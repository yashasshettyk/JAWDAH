// Standalone JavaScript function to prevent negative values in input fields
// Usage: preventNegativeValues('your-input-id')

(function () {
  "use strict";

  // Simple function to prevent negative values - just pass the input ID
  function preventNegativeValues(inputId) {
    // Handle both string ID and element object
    const input =
      typeof inputId === "string" ? document.getElementById(inputId) : inputId;

    if (!input) {
      console.warn(`Input with ID '${inputId}' not found`);
      return false;
    }

    // Check if already initialized to prevent duplicate event listeners
    if (input.dataset.negativeValuesPrevented === "true") {
      console.log(`Input '${inputId}' already has negative value prevention`);
      return true;
    }

    // Function to handle input validation
    function validateInput() {
      const value = parseFloat(input.value);

      if (input.value !== "" && value < 0) {
        // Reset negative values to 0 immediately
        input.value = "0";

        // Show visual feedback
        input.style.borderColor = "#f44336";
        input.style.backgroundColor = "#ffebee";

        // Remove visual feedback after a longer delay
        setTimeout(() => {
          input.style.borderColor = "";
          input.style.backgroundColor = "";
        }, 2000);
      } else {
        // Clear any existing red styling when value is valid
        input.style.borderColor = "";
        input.style.backgroundColor = "";
      }
    }

    // Add event listeners to monitor input changes
    input.addEventListener("input", validateInput);
    input.addEventListener("change", validateInput);
    input.addEventListener("blur", validateInput);

    // Prevent typing negative signs and minus key
    input.addEventListener("keydown", function (e) {
      // Prevent minus key (45), negative sign on numpad (109)
      if (e.keyCode === 45 || e.keyCode === 109 || e.key === "-") {
        e.preventDefault();

        // Show visual feedback
        input.style.borderColor = "#f44336";
        input.style.backgroundColor = "#ffebee";

        setTimeout(() => {
          input.style.borderColor = "";
          input.style.backgroundColor = "";
        }, 1500);
      }
    });

    // Prevent pasting negative values
    input.addEventListener("paste", function (e) {
      setTimeout(() => {
        validateInput();
      }, 10);
    });

    // Mark as initialized
    input.dataset.negativeValuesPrevented = "true";

    console.log(
      `Negative value restriction applied to input: ${input.id || "element"}`
    );
    return true;
  }

  // Function to apply to multiple inputs at once
  function preventNegativeValuesMultiple(inputIds) {
    if (Array.isArray(inputIds)) {
      inputIds.forEach((id) => preventNegativeValues(id));
    } else {
      console.warn(
        "preventNegativeValuesMultiple expects an array of input IDs"
      );
    }
  }

  // Function to remove restrictions
  function removeNegativeValueRestriction(inputId) {
    const input =
      typeof inputId === "string" ? document.getElementById(inputId) : inputId;

    if (!input) {
      console.warn(`Input with ID '${inputId}' not found`);
      return false;
    }

    // Clone the element to remove all event listeners
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);

    // Remove the marker
    delete newInput.dataset.negativeValuesPrevented;

    console.log(`Negative value restriction removed from input: ${inputId}`);
    return true;
  }

  // Make functions globally available
  window.preventNegativeValues = preventNegativeValues;
  window.preventNegativeValuesMultiple = preventNegativeValuesMultiple;
  window.removeNegativeValueRestriction = removeNegativeValueRestriction;

  // Auto-initialize if DOM is already loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      console.log("preventNegativeValues function is ready to use");
    });
  } else {
    console.log("preventNegativeValues function is ready to use");
  }
})();
 