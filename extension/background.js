// Background script for the browser extension
// This runs in the background and manages communication between content scripts and the dashboard

// Initialize Screenpipe integration
let screenpipeSession = null
let isRecording = false
let currentTabId = null
let projectId = null
let recordingSettings = {
  clicks: true,
  movement: true,
  scrolling: true,
  formInteractions: true,
  pageTransitions: true,
  consoleErrors: true,
  networkRequests: false,
}

// Load settings from storage
chrome.storage.local.get(["projectId", "recordingSettings"], (result) => {
  if (result.projectId) {
    projectId = result.projectId
  }

  if (result.recordingSettings) {
    recordingSettings = { ...recordingSettings, ...result.recordingSettings }
  }
})

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startRecording") {
    startRecording(message.tabId, message.projectId)
    sendResponse({ success: true })
  } else if (message.action === "stopRecording") {
    stopRecording()
    sendResponse({ success: true })
  } else if (message.action === "getStatus") {
    sendResponse({
      isRecording,
      currentTabId,
      projectId,
      recordingSettings,
    })
  } else if (message.action === "updateSettings") {
    recordingSettings = { ...recordingSettings, ...message.settings }
    chrome.storage.local.set({ recordingSettings })
    sendResponse({ success: true })
  } else if (message.action === "trackEvent") {
    trackEvent(message.eventData, sender.tab.id)
    sendResponse({ success: true })
  } else if (message.action === "trackFrictionPoint") {
    trackFrictionPoint(message.frictionData, sender.tab.id)
    sendResponse({ success: true })
  }

  return true // Keep the message channel open for async responses
})

// Start recording a session
async function startRecording(tabId, id) {
  if (isRecording) {
    stopRecording()
  }

  currentTabId = tabId

  if (id) {
    projectId = id
    chrome.storage.local.set({ projectId })
  }

  // Initialize Screenpipe session
  initializeScreenpipe(tabId)

  // Inject content script to track user interactions
  chrome.scripting.executeScript({
    target: { tabId },
    files: ["content.js"],
  })

  // Update extension icon to show recording state
  chrome.action.setIcon({
    path: {
      16: "icons/recording-16.png",
      48: "icons/recording-48.png",
      128: "icons/recording-128.png",
    },
  })

  isRecording = true

  // Send message to content script that recording has started
  chrome.tabs.sendMessage(tabId, {
    action: "recordingStarted",
    settings: recordingSettings,
  })

  // Get the current tab URL
  const url = await getCurrentTabUrl(tabId)

  // Start session on the server
  fetch(`${getApiUrl()}/api/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projectId,
      tabId,
      url,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenSize: {
        width: window.screen.width,
        height: window.screen.height,
      },
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Session started:", data.id)
      // Store session ID for later use
      chrome.storage.local.set({ currentSessionId: data.id })
    })
    .catch((error) => {
      console.error("Error starting session:", error)
    })
}

// Stop the current recording session
function stopRecording() {
  if (!isRecording) return

  // Stop Screenpipe recording
  if (screenpipeSession) {
    screenpipeSession.stop()
    screenpipeSession = null
  }

  // Update extension icon to show idle state
  chrome.action.setIcon({
    path: {
      16: "icons/idle-16.png",
      48: "icons/idle-48.png",
      128: "icons/idle-128.png",
    },
  })

  // Send message to content script that recording has stopped
  if (currentTabId) {
    chrome.tabs.sendMessage(currentTabId, { action: "recordingStopped" })
  }

  // Get current session ID
  chrome.storage.local.get(["currentSessionId"], (result) => {
    if (result.currentSessionId) {
      // End session on the server
      fetch(`${getApiUrl()}/api/sessions/${result.currentSessionId}/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endTime: new Date().toISOString(),
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Session ended:", data)
          chrome.storage.local.remove(["currentSessionId"])
        })
        .catch((error) => {
          console.error("Error ending session:", error)
        })
    }
  })

  isRecording = false
  currentTabId = null
}

// Initialize Screenpipe for screen recording
function initializeScreenpipe(tabId) {
  // This is where we would integrate with the Screenpipe API
  // For this example, we'll simulate the integration
  console.log("Initializing Screenpipe for tab", tabId)

  screenpipeSession = {
    tabId,
    startTime: new Date(),
    events: [],
    stop: function () {
      console.log("Stopping Screenpipe recording")
      // Here we would upload the recording to the server
      this.uploadRecording()
    },
    recordEvent: function (event) {
      this.events.push({
        ...event,
        timestamp: new Date().toISOString(),
      })
    },
    uploadRecording: function () {
      // Simulate uploading the recording to the server
      console.log("Uploading recording with", this.events.length, "events")

      chrome.storage.local.get(["currentSessionId"], (result) => {
        if (result.currentSessionId) {
          fetch(`${getApiUrl()}/api/recordings/${result.currentSessionId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              events: screenpipeSession.events,
              duration: (new Date() - screenpipeSession.startTime) / 1000,
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log("Recording uploaded:", data)
            })
            .catch((error) => {
              console.error("Error uploading recording:", error)
            })
        }
      })
    },
  }
}

// Track user interaction events
function trackEvent(eventData, tabId) {
  if (!isRecording || tabId !== currentTabId) return

  // Record event in Screenpipe session
  if (screenpipeSession) {
    screenpipeSession.recordEvent(eventData)
  }

  // Send event to the server
  chrome.storage.local.get(["currentSessionId"], (result) => {
    if (result.currentSessionId) {
      fetch(`${getApiUrl()}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: result.currentSessionId,
          ...eventData,
          timestamp: new Date().toISOString(),
        }),
      }).catch((error) => {
        console.error("Error tracking event:", error)
      })
    }
  })
}

// Track friction points
function trackFrictionPoint(frictionData, tabId) {
  if (!isRecording || tabId !== currentTabId) return

  // Send friction point to the server
  chrome.storage.local.get(["currentSessionId"], (result) => {
    if (result.currentSessionId) {
      fetch(`${getApiUrl()}/api/friction-points`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: result.currentSessionId,
          ...frictionData,
          timestamp: new Date().toISOString(),
        }),
      }).catch((error) => {
        console.error("Error tracking friction point:", error)
      })
    }
  })
}

// Helper function to get the current tab URL
async function getCurrentTabUrl(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.get(tabId, (tab) => {
      resolve(tab.url)
    })
  })
}

// Get API URL based on environment
function getApiUrl() {
  // For development, you might want to use a local server
  // For production, use your Vercel deployment URL
  return "https://snap-ux.vercel.app"
}

// Listen for tab updates to track page navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (isRecording && tabId === currentTabId && changeInfo.status === "complete") {
    // Re-inject content script when page changes
    chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"],
    })

    // Track page navigation
    trackEvent(
      {
        type: "navigation",
        url: tab.url,
        title: tab.title,
      },
      tabId,
    )
  }
})

// Listen for tab closing to stop recording if needed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (isRecording && tabId === currentTabId) {
    stopRecording()
  }
})
