/**
 * Dynamic Name Input Library
 * A comprehensive name input system for web applications
 * Author: GitHub Copilot
 * Version: 2.0.0
 */

const DynamicNameInput = (function () {
  // Private variables
  let isEditingMode = false;
  let currentNameElement = null;
  let currentInput = null;
  let onCompleteCallback = null;

  // Add mutation observer and listening state (like signature library)
  let mutationObserver = null;
  let isListeningEnabled = false;

  // Name class identifier (can be customized)
  let NAME_CLASS = "name-placeholder";

  // Private helper functions
  function createNameInput(element, existingValue = "") {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "name-input";
    input.placeholder = "Enter name here...";
    input.value = existingValue;
    input.maxLength = 100;

    // Auto-focus the input
    setTimeout(() => input.focus(), 10);

    // Handle Enter key to save
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        DynamicNameInput.saveCurrentName();
      } else if (e.key === "Escape") {
        e.preventDefault();
        DynamicNameInput.cancelEditing();
      }
    });

    return input;
  }

  function createControls() {
    const controls = document.createElement("div");
    controls.className = "name-controls";

    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Clear";
    clearBtn.className = "control-btn clear-btn";
    clearBtn.onclick = () => DynamicNameInput.clearCurrentName();

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.className = "control-btn save-btn";
    saveBtn.onclick = () => DynamicNameInput.saveCurrentName();

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.className = "control-btn cancel-btn";
    cancelBtn.onclick = () => DynamicNameInput.cancelEditing();

    controls.appendChild(clearBtn);
    controls.appendChild(saveBtn);
    controls.appendChild(cancelBtn);

    return controls;
  }

  function highlightNameAreas() {
    const elements = document.querySelectorAll(`.${NAME_CLASS}`);

    if (elements.length === 0) {
      console.warn("No placeholders found with class:", NAME_CLASS);
      return false;
    }

    elements.forEach((el) => {
      el.classList.add("highlighted");
      el.addEventListener("click", handleElementClick);
    });

    return true;
  }

  function removeHighlights() {
    const elements = document.querySelectorAll(`.${NAME_CLASS}`);
    elements.forEach((el) => {
      el.classList.remove("highlighted");
      el.removeEventListener("click", handleElementClick);
    });
  }

  function handleElementClick(e) {
    e.stopPropagation();

    if (currentNameElement) {
      DynamicNameInput.cancelEditing();
    }

    const element = e.currentTarget;
    DynamicNameInput.activateNameArea(element);
  }

  function sanitizeName(name) {
    return name
      .replace(/[<>'"&]/g, "")
      .trim()
      .replace(/\s+/g, " ");
  }

  // Add placeholder click handling (like signature library)
  function enablePlaceholderListeners() {
    if (isEditingMode) return;

    const elements = document.querySelectorAll(`.${NAME_CLASS}`);
    elements.forEach((element) => {
      element.removeEventListener("click", handlePlaceholderClick);
      element.addEventListener("click", handlePlaceholderClick);
      element.setAttribute("data-listener-active", "true");
    });

    isListeningEnabled = true;
    console.log(`Enabled listeners for ${elements.length} placeholder(s)`);
  }

  function disablePlaceholderListeners() {
    const elements = document.querySelectorAll(`.${NAME_CLASS}`);
    elements.forEach((element) => {
      element.removeEventListener("click", handlePlaceholderClick);
      element.removeAttribute("data-listener-active");
    });

    isListeningEnabled = false;
  }

  function handlePlaceholderClick(event) {
    event.stopPropagation();
    event.preventDefault();

    if (isEditingMode) return;

    const element = event.currentTarget;
    disablePlaceholderListeners();
    DynamicNameInput.activateNameArea(element);
  }

  // Add mutation observer setup (like signature library)
  function setupMutationObserver() {
    if (mutationObserver) {
      mutationObserver.disconnect();
    }

    mutationObserver = new MutationObserver(function (mutations) {
      let shouldUpdateListeners = false;

      mutations.forEach(function (mutation) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.classList && node.classList.contains(NAME_CLASS)) {
                console.log("New name placeholder detected");
                shouldUpdateListeners = true;
              } else if (node.querySelectorAll) {
                const newPlaceholders = node.querySelectorAll(`.${NAME_CLASS}`);
                if (newPlaceholders.length > 0) {
                  console.log(
                    `${newPlaceholders.length} new name placeholders detected`
                  );
                  shouldUpdateListeners = true;
                }
              }
            }
          });
        }
      });

      if (shouldUpdateListeners && !isEditingMode) {
        enablePlaceholderListeners();
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // Public API
  return {
    // Library information
    version: "2.0.0",
    name: "DynamicNameInput",

    // Initialize the library
    init: function (options = {}) {
      try {
        // Set custom name class if provided
        if (options.nameClass) {
          NAME_CLASS = options.nameClass;
        }

        // Set global callback if provided
        if (options.onComplete && typeof options.onComplete === "function") {
          onCompleteCallback = options.onComplete;
        }

        // Setup mutation observer and enable listeners (like signature library)
        setupMutationObserver();

        // Enable listeners for existing placeholders
        const initialCheck = this.hasPlaceholders();
        if (initialCheck.success && initialCheck.count > 0) {
          enablePlaceholderListeners();
        }

        console.log(`${this.name} v${this.version} initialized successfully`);
        return { success: true, message: "Library initialized" };
      } catch (error) {
        console.error("Error initializing library:", error);
        return {
          success: false,
          message: "Failed to initialize library",
          error: error.message,
        };
      }
    },

    // Start the editing process
    startEditing: function (callback) {
      try {
        if (isEditingMode) {
          console.warn("Already in editing mode, cancelling previous session");
          this.cancelEditing();
        }

        if (callback && typeof callback !== "function") {
          console.error("Callback must be a function");
          return {
            success: false,
            message: "Invalid callback provided. Must be a function.",
          };
        }

        if (document.readyState === "loading") {
          console.warn("DOM not ready, waiting...");
          return {
            success: false,
            message:
              "DOM is still loading. Please try again when page is fully loaded.",
          };
        }

        const elements = document.querySelectorAll(`.${NAME_CLASS}`);
        if (elements.length === 0) {
          console.error("No placeholders found with class:", NAME_CLASS);
          return {
            success: false,
            message: `No name placeholders found with class: ${NAME_CLASS}`,
          };
        }

        let invalidCount = 0;
        elements.forEach((el, index) => {
          const validation = this.validateElement(el);
          if (!validation.valid) {
            console.warn(
              `Placeholder ${index + 1} is invalid:`,
              validation.message
            );
            invalidCount++;
          }
        });

        if (invalidCount === elements.length) {
          console.error("All placeholders are invalid");
          return {
            success: false,
            message: "All name placeholders are invalid",
          };
        }

        isEditingMode = true;
        if (callback) onCompleteCallback = callback;

        const nameBtn = document.getElementById("nameBtn");
        if (nameBtn) {
          nameBtn.disabled = true;
          nameBtn.textContent = "Select area to enter name...";
        }

        const hasPlaceholders = highlightNameAreas();
        if (!hasPlaceholders) {
          this.finishEditing();
          return {
            success: false,
            message: `No valid name placeholders found with class: ${NAME_CLASS}`,
          };
        }

        console.log(
          `Found ${elements.length} name placeholder(s), ${invalidCount} invalid`
        );
        return {
          success: true,
          message: "Click on any name area to start editing",
          totalPlaceholders: elements.length,
          invalidPlaceholders: invalidCount,
        };
      } catch (error) {
        console.error("Error starting editing process:", error);
        this.reset();
        return {
          success: false,
          message: "Failed to start editing process",
          error: error.message,
        };
      }
    },

    // Activate specific name area
    activateNameArea: function (element) {
      try {
        const validation = this.validateElement(element);
        if (!validation.valid) {
          console.error("Invalid element:", validation.message);
          return { success: false, message: validation.message };
        }

        const existingNameSpan = element.querySelector("span[data-name]");
        let existingValue = "";

        if (existingNameSpan) {
          existingValue = existingNameSpan.getAttribute("data-name") || "";
          console.log("Found existing name:", existingValue);
        }

        removeHighlights();
        currentNameElement = element;
        isEditingMode = true; // Set editing mode like signature library

        try {
          element.setAttribute("data-original-content", element.innerHTML);
        } catch (error) {
          console.warn("Could not store original content:", error);
        }

        element.classList.add("editing");

        try {
          const input = createNameInput(element, existingValue);
          const controls = createControls();

          currentInput = input;

          element.innerHTML = "";
          element.appendChild(input);
          element.appendChild(controls);
        } catch (error) {
          console.error("Error creating name input interface:", error);
          this.cancelEditing();
          return {
            success: false,
            message: "Failed to create name input interface",
            error: error.message,
          };
        }

        return { success: true, message: "Name area activated" };
      } catch (error) {
        console.error("Error activating name area:", error);
        this.cancelEditing();
        return {
          success: false,
          message: "Failed to activate name area",
          error: error.message,
        };
      }
    },

    // Clear current name input
    clearCurrentName: function () {
      if (!currentInput) {
        return { success: false, message: "No active name input area" };
      }

      currentInput.value = "";
      currentInput.focus();
      return { success: true, message: "Name input cleared" };
    },

    // Save current name
    saveCurrentName: function () {
      try {
        if (!currentInput || !currentNameElement) {
          console.error("No active name input");
          return { success: false, message: "No active name input area" };
        }

        const rawName = currentInput.value;
        if (!rawName || rawName.trim().length === 0) {
          console.warn("No name provided");
          return {
            success: false,
            message: "Please enter a name before saving",
          };
        }

        const sanitizedName = sanitizeName(rawName);
        if (sanitizedName.length === 0) {
          console.warn("Invalid name after sanitization");
          return {
            success: false,
            message: "Please enter a valid name",
          };
        }

        const nameId = currentNameElement.getAttribute("data-name-id");

        const elementAttributes = {};
        try {
          Array.from(currentNameElement.attributes).forEach((attr) => {
            if (attr.name.startsWith("data-")) {
              elementAttributes[attr.name] = attr.value;
            }
          });
        } catch (error) {
          console.warn("Error reading element attributes:", error);
        }

        try {
          const nameSpan = document.createElement("span");
          nameSpan.textContent = sanitizedName;
          nameSpan.className = "name-display";
          nameSpan.setAttribute("data-name", sanitizedName);

          currentNameElement.innerHTML = "";
          currentNameElement.appendChild(nameSpan);
          currentNameElement.classList.remove("editing");
        } catch (error) {
          console.error("Error creating name display element:", error);
          return {
            success: false,
            message: "Failed to save name display",
            error: error.message,
          };
        }

        const returnData = {
          nameId: nameId,
          name: sanitizedName,
          originalInput: rawName,
          elementAttributes: elementAttributes,
          element: currentNameElement,
          timestamp: new Date().toISOString(),
        };

        if (onCompleteCallback && typeof onCompleteCallback === "function") {
          try {
            onCompleteCallback(returnData);
          } catch (error) {
            console.error("Error in completion callback:", error);
          }
        }

        this.finishEditing();

        console.log("Name saved successfully for ID:", nameId);
        return {
          success: true,
          message: "Name saved successfully",
          data: returnData,
        };
      } catch (error) {
        console.error("Unexpected error saving name:", error);
        this.cancelEditing();
        return {
          success: false,
          message: "An unexpected error occurred while saving",
          error: error.message,
        };
      }
    },

    // Cancel editing process
    cancelEditing: function () {
      if (currentNameElement) {
        const originalContent = currentNameElement.getAttribute(
          "data-original-content"
        );
        if (originalContent) {
          currentNameElement.innerHTML = originalContent;
        } else {
          // Restore to original placeholder state without adding extra text
          const nameId = currentNameElement.getAttribute("data-name-id");
          const areaText = nameId ? nameId.replace("name", "Area ") : "Area";
          currentNameElement.innerHTML = `Click to enter name - ${areaText}`;
        }
        currentNameElement.classList.remove("editing");
        currentNameElement.removeAttribute("data-original-content");
      }

      this.finishEditing();
      return { success: true, message: "Editing cancelled" };
    },

    // Finish editing process
    finishEditing: function () {
      isEditingMode = false;
      currentNameElement = null;
      currentInput = null;

      removeHighlights();

      const nameBtn = document.getElementById("nameBtn");
      if (nameBtn) {
        nameBtn.disabled = false;
        nameBtn.textContent = "Start Name Entry";
      }

      // Re-enable placeholder listeners after editing is finished
      setTimeout(() => {
        enablePlaceholderListeners();
      }, 100);
    },

    // Get all names
    getAllNames: function () {
      const names = [];
      const elements = document.querySelectorAll(`.${NAME_CLASS}`);

      if (elements.length === 0) {
        console.warn("No placeholders found with class:", NAME_CLASS);
        return names;
      }

      elements.forEach((el) => {
        const nameSpan = el.querySelector("span[data-name]");
        if (nameSpan) {
          const name = nameSpan.getAttribute("data-name");

          const elementAttributes = {};
          Array.from(el.attributes).forEach((attr) => {
            if (attr.name.startsWith("data-")) {
              elementAttributes[attr.name] = attr.value;
            }
          });

          names.push({
            nameId: el.getAttribute("data-name-id"),
            name: name,
            elementAttributes: elementAttributes,
            element: el,
          });
        }
      });

      console.log(
        `Found ${names.length} completed name(s) out of ${elements.length} placeholder(s)`
      );
      return names;
    },

    // Get name by ID
    getNameById: function (nameId) {
      const elements = document.querySelectorAll(`.${NAME_CLASS}`);
      if (elements.length === 0) {
        console.warn("No placeholders found with class:", NAME_CLASS);
        return { success: false, message: "No name placeholders found" };
      }

      const element = document.querySelector(
        `.${NAME_CLASS}[data-name-id="${nameId}"]`
      );
      if (!element) {
        console.warn(`Name with ID '${nameId}' not found`);
        return { success: false, message: "Name not found" };
      }

      const nameSpan = element.querySelector("span[data-name]");
      if (!nameSpan) {
        return { success: false, message: "No name data found" };
      }

      const name = nameSpan.getAttribute("data-name");

      const elementAttributes = {};
      Array.from(element.attributes).forEach((attr) => {
        if (attr.name.startsWith("data-")) {
          elementAttributes[attr.name] = attr.value;
        }
      });

      return {
        success: true,
        data: {
          nameId: nameId,
          name: name,
          elementAttributes: elementAttributes,
          element: element,
        },
      };
    },

    // Set name class
    setNameClass: function (className) {
      if (!className || typeof className !== "string") {
        console.error("Invalid class name provided:", className);
        return {
          success: false,
          message: "Class name must be a non-empty string",
        };
      }

      const oldClass = NAME_CLASS;
      NAME_CLASS = className;

      const elements = document.querySelectorAll(`.${NAME_CLASS}`);
      if (elements.length === 0) {
        console.warn(`No placeholders found with new class: ${className}`);
      } else {
        console.log(
          `Found ${elements.length} placeholder(s) with class: ${className}`
        );
      }

      return {
        success: true,
        message: `Name class changed from '${oldClass}' to '${className}'`,
        placeholderCount: elements.length,
      };
    },

    // Check if placeholders exist
    hasPlaceholders: function () {
      try {
        const elements = document.querySelectorAll(`.${NAME_CLASS}`);
        const hasElements = elements.length > 0;

        if (!hasElements) {
          console.warn("No placeholders found with class:", NAME_CLASS);
        }

        return {
          success: hasElements,
          count: elements.length,
          message: hasElements
            ? `Found ${elements.length} placeholder(s)`
            : `No placeholders found with class: ${NAME_CLASS}`,
        };
      } catch (error) {
        console.error("Error checking placeholders:", error);
        return {
          success: false,
          count: 0,
          message: "Error occurred while checking placeholders",
          error: error.message,
        };
      }
    },

    // Validate element
    validateElement: function (element) {
      if (!element) {
        return { valid: false, message: "Element is null or undefined" };
      }

      if (!(element instanceof HTMLElement)) {
        return { valid: false, message: "Element is not a valid HTML element" };
      }

      if (!element.classList.contains(NAME_CLASS)) {
        return {
          valid: false,
          message: `Element does not have class: ${NAME_CLASS}`,
        };
      }

      const nameId = element.getAttribute("data-name-id");
      if (!nameId) {
        return {
          valid: false,
          message: "Element missing data-name-id attribute",
        };
      }

      return { valid: true, message: "Element is valid", nameId };
    },

    // Reset module
    reset: function () {
      try {
        if (isEditingMode) {
          this.cancelEditing();
        }

        removeHighlights();
        disablePlaceholderListeners();

        // Clean up mutation observer
        if (mutationObserver) {
          mutationObserver.disconnect();
          mutationObserver = null;
        }

        isEditingMode = false;
        isListeningEnabled = false;
        currentNameElement = null;
        currentInput = null;
        onCompleteCallback = null;

        const nameBtn = document.getElementById("nameBtn");
        if (nameBtn) {
          nameBtn.disabled = false;
          nameBtn.textContent = "Start Name Entry";
        }

        console.log("Module reset successfully");
        return { success: true, message: "Module reset to initial state" };
      } catch (error) {
        console.error("Error resetting module:", error);
        return {
          success: false,
          message: "Error occurred during reset",
          error: error.message,
        };
      }
    },
  };
})();

// Expose globally
if (typeof window !== "undefined") {
  window.DynamicNameInput = DynamicNameInput;
}

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = DynamicNameInput;
}
