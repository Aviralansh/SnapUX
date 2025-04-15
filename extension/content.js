// Content script for the browser extension
// This runs in the context of the web page and tracks user interactions

// Initialize variables
let isRecording = false
let settings = {
  clicks: true,
  movement: true,
  scrolling: true,
  formInteractions: true,
  pageTransitions: true,
  consoleErrors: true,
  networkRequests: false,
}
let lastMousePosition = { x: 0, y: 0 }
const mousePositions = []
let lastScrollPosition = 0
let scrollTimeout = null
const formInteractions = {}
let hesitationTimeout = null
let lastInteractionTime = Date.now()
const consecutiveActions = {
  element: null,
  count: 0,
  lastAction: null,
}

// Check if we're already recording
if (typeof chrome !== "undefined" && chrome.runtime) {
  chrome.runtime.sendMessage({ action: "getStatus" }, (response) => {
    if (response && response.isRecording) {
      startRecording(response.recordingSettings)
    }
  })
}

// Listen for messages from background script
if (typeof chrome !== "undefined" && chrome.runtime) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && message.action === "recordingStarted") {
      startRecording(message.settings)
      sendResponse({ success: true })
    } else if (message && message.action === "recordingStopped") {
      stopRecording()
      sendResponse({ success: true })
    }

    return true // Keep the message channel open for async responses
  })
}

// Start recording user interactions
function startRecording(recordingSettings) {
  if (isRecording) return

  settings = { ...settings, ...recordingSettings }
  isRecording = true
  lastInteractionTime = Date.now()

  // Add event listeners based on settings
  if (settings.clicks) {
    document.addEventListener("click", trackClick)
  }

  if (settings.movement) {
    document.addEventListener("mousemove", trackMouseMovement)
  }

  if (settings.scrolling) {
    document.addEventListener("scroll", trackScrolling)
  }

  if (settings.formInteractions) {
    document.addEventListener("focus", trackFormFocus, true)
    document.addEventListener("blur", trackFormBlur, true)
    document.addEventListener("input", trackFormInput)
    document.addEventListener("change", trackFormChange)
    document.addEventListener("submit", trackFormSubmit)
    document.addEventListener("invalid", trackFormValidation, true)
  }

  if (settings.consoleErrors) {
    window.addEventListener("error", trackJavaScriptError)
  }

  // Track page load
  trackPageLoad()

  // Start detecting hesitations
  detectHesitations()

  // Add visual indicator that recording is active
  addRecordingIndicator()

  console.log("UX Insight: Recording started")
}

// Stop recording user interactions
function stopRecording() {
  if (!isRecording) return

  // Remove event listeners
  document.removeEventListener("click", trackClick)
  document.removeEventListener("mousemove", trackMouseMovement)
  document.removeEventListener("scroll", trackScrolling)
  document.removeEventListener("focus", trackFormFocus, true)
  document.removeEventListener("blur", trackFormBlur, true)
  document.removeEventListener("input", trackFormInput)
  document.removeEventListener("change", trackFormChange)
  document.removeEventListener("submit", trackFormSubmit)
  document.removeEventListener("invalid", trackFormValidation, true)
  window.removeEventListener("error", trackJavaScriptError)

  // Clear timeouts
  if (hesitationTimeout) {
    clearTimeout(hesitationTimeout)
  }

  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }

  // Remove recording indicator
  removeRecordingIndicator()

  isRecording = false
  console.log("UX Insight: Recording stopped")
}

// Track page load
function trackPageLoad() {
  const performanceData = window.performance.timing
  const loadTime = performanceData.loadEventEnd - performanceData.navigationStart

  sendEvent({
    type: "pageLoad",
    url: window.location.href,
    title: document.title,
    loadTime,
    referrer: document.referrer,
  })
}

// Track mouse clicks
function trackClick(event) {
  lastInteractionTime = Date.now()

  const target = event.target
  const elementInfo = getElementInfo(target)

  // Check for repeated clicks on the same element
  if (consecutiveActions.element === elementInfo.selector) {
    if (consecutiveActions.lastAction === "click") {
      consecutiveActions.count++

      // If user clicks the same element multiple times, it might indicate a friction point
      if (consecutiveActions.count >= 3) {
        trackFrictionPoint({
          type: "repeatedClicks",
          element: elementInfo,
          count: consecutiveActions.count,
          message: "User clicked the same element multiple times in succession",
        })
      }
    } else {
      consecutiveActions.count = 1
      consecutiveActions.lastAction = "click"
    }
  } else {
    consecutiveActions.element = elementInfo.selector
    consecutiveActions.count = 1
    consecutiveActions.lastAction = "click"
  }

  sendEvent({
    type: "click",
    x: event.clientX,
    y: event.clientY,
    element: elementInfo,
  })
}

// Track mouse movement
function trackMouseMovement(event) {
  // Only track mouse position periodically to avoid too many events
  const now = Date.now()
  if (now - lastInteractionTime > 100) {
    lastInteractionTime = now

    const x = event.clientX
    const y = event.clientY

    // Calculate distance from last position
    const distance = Math.sqrt(Math.pow(x - lastMousePosition.x, 2) + Math.pow(y - lastMousePosition.y, 2))

    // Only record if moved more than 5 pixels
    if (distance > 5) {
      lastMousePosition = { x, y }
      mousePositions.push({ x, y, time: now })

      // Keep only the last 100 positions
      if (mousePositions.length > 100) {
        mousePositions.shift()
      }

      // Send movement data periodically (every 10 positions)
      if (mousePositions.length % 10 === 0) {
        sendEvent({
          type: "mouseMovement",
          positions: mousePositions.slice(-10),
        })
      }
    }
  }
}

// Track scrolling behavior
function trackScrolling() {
  lastInteractionTime = Date.now()

  // Clear previous timeout
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }

  // Set a timeout to track when scrolling stops
  scrollTimeout = setTimeout(() => {
    const scrollPosition = window.scrollY
    const scrollHeight = document.documentElement.scrollHeight
    const viewportHeight = window.innerHeight
    const scrollPercentage = (scrollPosition / (scrollHeight - viewportHeight)) * 100

    sendEvent({
      type: "scroll",
      position: scrollPosition,
      percentage: Math.min(100, Math.max(0, scrollPercentage)),
      direction: scrollPosition > lastScrollPosition ? "down" : "up",
      distance: Math.abs(scrollPosition - lastScrollPosition),
    })

    lastScrollPosition = scrollPosition
  }, 500)
}

// Track form field focus
function trackFormFocus(event) {
  if (!isFormElement(event.target)) return

  lastInteractionTime = Date.now()
  const target = event.target
  const elementInfo = getElementInfo(target)

  // Start tracking time spent on this field
  formInteractions[elementInfo.selector] = {
    startTime: Date.now(),
    value: target.value,
    initialValue: target.value,
  }

  sendEvent({
    type: "formFocus",
    element: elementInfo,
  })
}

// Track form field blur
function trackFormBlur(event) {
  if (!isFormElement(event.target)) return

  lastInteractionTime = Date.now()
  const target = event.target
  const elementInfo = getElementInfo(target)

  // Calculate time spent on this field
  if (formInteractions[elementInfo.selector]) {
    const timeSpent = Date.now() - formInteractions[elementInfo.selector].startTime
    const initialValue = formInteractions[elementInfo.selector].initialValue
    const finalValue = target.value
    const valueChanged = initialValue !== finalValue

    // Check for potential friction points
    if (timeSpent > 10000 && valueChanged) {
      // User spent more than 10 seconds on a field and changed the value
      trackFrictionPoint({
        type: "longFormInteraction",
        element: elementInfo,
        timeSpent,
        message: "User spent a long time filling out this field",
      })
    }

    if (target.validity && !target.validity.valid) {
      // Field has validation errors
      trackFrictionPoint({
        type: "formValidationError",
        element: elementInfo,
        message: "Field has validation errors after user interaction",
      })
    }

    sendEvent({
      type: "formBlur",
      element: elementInfo,
      timeSpent,
      valueChanged,
    })

    delete formInteractions[elementInfo.selector]
  }
}

// Track form input changes
function trackFormInput(event) {
  if (!isFormElement(event.target)) return

  lastInteractionTime = Date.now()
  const target = event.target
  const elementInfo = getElementInfo(target)

  // Update current value
  if (formInteractions[elementInfo.selector]) {
    formInteractions[elementInfo.selector].value = target.value
  }

  // Check for repeated deletions (backspace/delete)
  if (consecutiveActions.element === elementInfo.selector) {
    if (
      consecutiveActions.lastAction === "delete" &&
      event.inputType &&
      (event.inputType.includes("delete") || event.inputType.includes("backspace"))
    ) {
      consecutiveActions.count++

      // If user deletes characters multiple times, it might indicate a friction point
      if (consecutiveActions.count >= 5) {
        trackFrictionPoint({
          type: "repeatedDeletions",
          element: elementInfo,
          count: consecutiveActions.count,
          message: "User repeatedly deleted input, possibly indicating confusion",
        })
      }
    } else {
      consecutiveActions.count = 1
      consecutiveActions.lastAction =
        event.inputType && (event.inputType.includes("delete") || event.inputType.includes("backspace"))
          ? "delete"
          : "input"
    }
  } else {
    consecutiveActions.element = elementInfo.selector
    consecutiveActions.count = 1
    consecutiveActions.lastAction =
      event.inputType && (event.inputType.includes("delete") || event.inputType.includes("backspace"))
        ? "delete"
        : "input"
  }
}

// Track form field changes
function trackFormChange(event) {
  if (!isFormElement(event.target)) return

  lastInteractionTime = Date.now()
  const target = event.target
  const elementInfo = getElementInfo(target)

  sendEvent({
    type: "formChange",
    element: elementInfo,
    value: target.type === "password" ? "[REDACTED]" : target.value,
  })
}

// Track form submissions
function trackFormSubmit(event) {
  lastInteractionTime = Date.now()
  const form = event.target
  const elementInfo = getElementInfo(form)

  // Check if form has validation errors
  const invalidFields = Array.from(form.elements)
    .filter((el) => el.validity && !el.validity.valid)
    .map(getElementInfo)

  if (invalidFields.length > 0) {
    trackFrictionPoint({
      type: "formSubmitWithErrors",
      element: elementInfo,
      invalidFields,
      message: "User attempted to submit form with validation errors",
    })
  }

  sendEvent({
    type: "formSubmit",
    element: elementInfo,
    hasErrors: invalidFields.length > 0,
  })
}

// Track form validation errors
function trackFormValidation(event) {
  lastInteractionTime = Date.now()
  const target = event.target
  const elementInfo = getElementInfo(target)

  trackFrictionPoint({
    type: "formValidationError",
    element: elementInfo,
    message: target.validationMessage || "Field validation failed",
  })

  sendEvent({
    type: "formValidation",
    element: elementInfo,
    message: target.validationMessage,
  })
}

// Track JavaScript errors
function trackJavaScriptError(event) {
  trackFrictionPoint({
    type: "javascriptError",
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
  })

  sendEvent({
    type: "error",
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
  })
}

// Detect user hesitations
function detectHesitations() {
  hesitationTimeout = setTimeout(() => {
    const now = Date.now()
    const timeSinceLastInteraction = now - lastInteractionTime

    // If user hasn't interacted for more than 5 seconds
    if (timeSinceLastInteraction > 5000) {
      // Get element under cursor
      const elementAtPoint = document.elementFromPoint(lastMousePosition.x, lastMousePosition.y)

      if (elementAtPoint) {
        const elementInfo = getElementInfo(elementAtPoint)

        trackFrictionPoint({
          type: "hesitation",
          element: elementInfo,
          duration: timeSinceLastInteraction,
          position: lastMousePosition,
          message: "User hesitated/paused on this element",
        })

        sendEvent({
          type: "hesitation",
          element: elementInfo,
          duration: timeSinceLastInteraction,
          position: lastMousePosition,
        })
      }
    }

    // Continue detecting hesitations
    detectHesitations()
  }, 5000)
}

// Helper function to get element information
function getElementInfo(element) {
  if (!element) return null

  // Generate a CSS selector for the element
  const selector = getCssSelector(element)

  // Get element attributes
  const tagName = element.tagName ? element.tagName.toLowerCase() : "unknown"
  const id = element.id || ""
  const className = element.className && typeof element.className === "string" ? element.className : ""
  const type = element.type || ""
  const name = element.name || ""
  const value = element.value
  const text = element.textContent ? element.textContent.trim().substring(0, 50) : ""

  // Don't capture sensitive information
  const isSensitive =
    (tagName === "input" && (type === "password" || name.includes("password"))) ||
    element.getAttribute("autocomplete") === "cc-number"

  return {
    selector,
    tagName,
    id,
    className,
    type,
    name,
    value: isSensitive ? "[REDACTED]" : value,
    text: text.length > 0 ? text : undefined,
    isVisible: isElementVisible(element),
  }
}

// Helper function to generate a CSS selector for an element
function getCssSelector(element) {
  if (!element || element === document || element === document.documentElement) {
    return ""
  }

  let selector = ""

  // Use ID if available
  if (element.id) {
    return `#${element.id}`
  }

  // Use tag name
  selector = element.tagName.toLowerCase()

  // Add classes (limit to first 2 classes to avoid overly specific selectors)
  if (element.className && typeof element.className === "string") {
    const classes = element.className.trim().split(/\s+/)
    if (classes.length > 0 && classes[0]) {
      selector += `.${classes.slice(0, 2).join(".")}`
    }
  }

  // Add position among siblings for more specificity
  const parent = element.parentNode
  if (parent && parent.children.length > 1) {
    const siblings = Array.from(parent.children)
    const index = siblings.indexOf(element) + 1
    if (index > 0) {
      selector += `:nth-child(${index})`
    }
  }

  return selector
}

// Helper function to check if an element is a form element
function isFormElement(element) {
  if (!element || !element.tagName) return false

  const tagName = element.tagName.toLowerCase()
  return tagName === "input" || tagName === "textarea" || tagName === "select" || tagName === "button"
}

// Helper function to check if an element is visible
function isElementVisible(element) {
  if (!element || !element.getBoundingClientRect) return false

  const rect = element.getBoundingClientRect()
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    window.getComputedStyle(element).visibility !== "hidden" &&
    window.getComputedStyle(element).display !== "none"
  )
}

// Send event to background script
function sendEvent(eventData) {
  if (typeof chrome !== "undefined" && chrome.runtime) {
    chrome.runtime.sendMessage({
      action: "trackEvent",
      eventData,
    })
  }
}

// Track friction point
function trackFrictionPoint(frictionData) {
  if (typeof chrome !== "undefined" && chrome.runtime) {
    chrome.runtime.sendMessage({
      action: "trackFrictionPoint",
      frictionData,
    })
  }
}

// Add visual indicator that recording is active
function addRecordingIndicator() {
  const indicator = document.createElement("div")
  indicator.id = "ux-insight-recording-indicator"
  indicator.style.position = "fixed"
  indicator.style.top = "10px"
  indicator.style.right = "10px"
  indicator.style.backgroundColor = "rgba(255, 0, 0, 0.7)"
  indicator.style.color = "white"
  indicator.style.padding = "5px 10px"
  indicator.style.borderRadius = "4px"
  indicator.style.fontSize = "12px"
  indicator.style.fontFamily = "Arial, sans-serif"
  indicator.style.zIndex = "9999"
  indicator.style.pointerEvents = "none"
  indicator.textContent = "Recording"

  document.body.appendChild(indicator)
}

// Remove recording indicator
function removeRecordingIndicator() {
  const indicator = document.getElementById("ux-insight-recording-indicator")
  if (indicator) {
    indicator.remove()
  }
}
