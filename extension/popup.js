// Popup script for the browser extension

// DOM elements
const statusIndicator = document.getElementById("status-indicator")
const statusText = document.getElementById("status-text")
const projectIdInput = document.getElementById("project-id")
const startButton = document.getElementById("start-button")
const stopButton = document.getElementById("stop-button")
const trackClicks = document.getElementById("track-clicks")
const trackMovement = document.getElementById("track-movement")
const trackScrolling = document.getElementById("track-scrolling")
const trackForms = document.getElementById("track-forms")
const trackErrors = document.getElementById("track-errors")

// Initialize popup
document.addEventListener("DOMContentLoaded", () => {
  // Get current status from background script
  chrome.runtime.sendMessage({ action: "getStatus" }, (response) => {
    if (response.isRecording) {
      updateUI(true)
    }

    if (response.projectId) {
      projectIdInput.value = response.projectId
    }

    // Set tracking options
    if (response.recordingSettings) {
      trackClicks.checked = response.recordingSettings.clicks
      trackMovement.checked = response.recordingSettings.movement
      trackScrolling.checked = response.recordingSettings.scrolling
      trackForms.checked = response.recordingSettings.formInteractions
      trackErrors.checked = response.recordingSettings.consoleErrors
    }
  })

  // Start recording button
  startButton.addEventListener("click", () => {
    const projectId = projectIdInput.value.trim()

    if (!projectId) {
      alert("Please enter a project ID")
      return
    }

    // Update settings
    const settings = {
      clicks: trackClicks.checked,
      movement: trackMovement.checked,
      scrolling: trackScrolling.checked,
      formInteractions: trackForms.checked,
      consoleErrors: trackErrors.checked,
    }

    chrome.runtime.sendMessage({ action: "updateSettings", settings })

    // Get current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return

      const tabId = tabs[0].id

      // Start recording
      chrome.runtime.sendMessage(
        {
          action: "startRecording",
          tabId,
          projectId,
        },
        (response) => {
          if (response.success) {
            updateUI(true)
          }
        },
      )
    })
  })

  // Stop recording button
  stopButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "stopRecording" }, (response) => {
      if (response.success) {
        updateUI(false)
      }
    })
  })

  // Update settings when checkboxes change
  const checkboxes = [trackClicks, trackMovement, trackScrolling, trackForms, trackErrors]
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const settings = {
        clicks: trackClicks.checked,
        movement: trackMovement.checked,
        scrolling: trackScrolling.checked,
        formInteractions: trackForms.checked,
        consoleErrors: trackErrors.checked,
      }

      chrome.runtime.sendMessage({ action: "updateSettings", settings })
    })
  })
})

// Update UI based on recording status
function updateUI(isRecording) {
  if (isRecording) {
    statusIndicator.classList.remove("idle")
    statusIndicator.classList.add("recording")
    statusText.textContent = "Recording"
    startButton.disabled = true
    stopButton.disabled = false
  } else {
    statusIndicator.classList.remove("recording")
    statusIndicator.classList.add("idle")
    statusText.textContent = "Not recording"
    startButton.disabled = false
    stopButton.disabled = true
  }
}
