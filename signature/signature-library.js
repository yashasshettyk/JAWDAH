/**
 * Dynamic Signature Library
 * A comprehensive signature capture system for web applications
 * Author: GitHub Copilot
 * Version: 1.0.0
 */

const DynamicSignature = (function () {
  // Private variables
  let isSigningMode = false;
  let currentSignatureElement = null;
  let currentCanvas = null;
  let currentCtx = null;
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let onCompleteCallback = null;

  // Signature class identifier (can be customized)
  let SIGNATURE_CLASS = 'signature-placeholder';

  // Private helper functions
  function getCoordinates(e) {
    const rect = currentCanvas.getBoundingClientRect();
    const scaleX = currentCanvas.width / rect.width;
    const scaleY = currentCanvas.height / rect.height;

    let clientX, clientY;
    if (e.type.includes("touch")) {
      const touch = e.touches[0] || e.changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return [x, y];
  }

  function handleTouch(e) {
    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0] || e.changedTouches[0];
    if (!touch) return;

    const mouseEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => {},
      stopPropagation: () => {},
      type: e.type === "touchstart" ? "mousedown" : 
            e.type === "touchmove" ? "mousemove" : "mouseup"
    };

    if (mouseEvent.type === "mousedown") {
      startDrawing(mouseEvent);
    } else if (mouseEvent.type === "mousemove") {
      draw(mouseEvent);
    } else if (mouseEvent.type === "mouseup") {
      stopDrawing();
    }
  }

  function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = getCoordinates(e);
  }

  function draw(e) {
    if (!isDrawing || !currentCtx) return;
    
    const [currentX, currentY] = getCoordinates(e);
    currentCtx.beginPath();
    currentCtx.moveTo(lastX, lastY);
    currentCtx.lineTo(currentX, currentY);
    currentCtx.stroke();
    [lastX, lastY] = [currentX, currentY];
  }

  function stopDrawing() {
    isDrawing = false;
  }

  function setupCanvasEvents(canvas) {
    canvas.addEventListener("mousedown", startDrawing, { passive: false });
    canvas.addEventListener("mousemove", draw, { passive: false });
    canvas.addEventListener("mouseup", stopDrawing, { passive: false });
    canvas.addEventListener("mouseout", stopDrawing, { passive: false });

    canvas.addEventListener("touchstart", handleTouch, { passive: false });
    canvas.addEventListener("touchmove", handleTouch, { passive: false });
    canvas.addEventListener("touchend", handleTouch, { passive: false });
    canvas.addEventListener("touchcancel", stopDrawing, { passive: false });
  }

  function createSignatureCanvas(element) {
    const rect = element.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    
    canvas.className = 'signature-canvas';
    canvas.width = Math.max(400, rect.width - 20);
    canvas.height = 150;
    
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    canvas.style.touchAction = "none";
    canvas.style.userSelect = "none";

    return { canvas, ctx };
  }

  function createControls() {
    const controls = document.createElement('div');
    controls.className = 'signature-controls';
    
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.className = 'clear-btn';
    clearBtn.onclick = () => DynamicSignature.clearCurrentSignature();
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.className = 'ok-btn';
    saveBtn.onclick = () => DynamicSignature.saveCurrentSignature();
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'clear-btn';
    cancelBtn.onclick = () => DynamicSignature.cancelSigning();
    
    controls.appendChild(clearBtn);
    controls.appendChild(saveBtn);
    controls.appendChild(cancelBtn);
    
    return controls;
  }

  function highlightSignatureAreas() {
    const elements = document.querySelectorAll(`.${SIGNATURE_CLASS}`);
    
    if (elements.length === 0) {
      console.warn('No placeholders found with class:', SIGNATURE_CLASS);
      return false;
    }
    
    elements.forEach(el => {
      el.classList.add('highlighted');
      el.addEventListener('click', handleElementClick);
    });
    
    return true;
  }

  function removeHighlights() {
    const elements = document.querySelectorAll(`.${SIGNATURE_CLASS}`);
    elements.forEach(el => {
      el.classList.remove('highlighted');
      el.removeEventListener('click', handleElementClick);
    });
  }

  function handleElementClick(e) {
    e.stopPropagation();
    
    if (currentSignatureElement) {
      DynamicSignature.cancelSigning();
    }

    const element = e.currentTarget;
    DynamicSignature.activateSignatureArea(element);
  }

  // Public API
  return {
    // Library information
    version: '1.0.0',
    name: 'DynamicSignature',

    // Initialize the library
    init: function(options = {}) {
      try {
        // Set custom signature class if provided
        if (options.signatureClass) {
          SIGNATURE_CLASS = options.signatureClass;
        }

        // Set global callback if provided
        if (options.onComplete && typeof options.onComplete === 'function') {
          onCompleteCallback = options.onComplete;
        }

        console.log(`${this.name} v${this.version} initialized successfully`);
        return { success: true, message: 'Library initialized' };
      } catch (error) {
        console.error('Error initializing library:', error);
        return { success: false, message: 'Failed to initialize library', error: error.message };
      }
    },

    // Start the signing process
    startSigning: function(callback) {
      try {
        if (isSigningMode) {
          console.warn('Already in signing mode, cancelling previous session');
          this.cancelSigning();
        }

        if (callback && typeof callback !== 'function') {
          console.error('Callback must be a function');
          return { 
            success: false, 
            message: 'Invalid callback provided. Must be a function.' 
          };
        }

        if (document.readyState === 'loading') {
          console.warn('DOM not ready, waiting...');
          return { 
            success: false, 
            message: 'DOM is still loading. Please try again when page is fully loaded.' 
          };
        }

        const elements = document.querySelectorAll(`.${SIGNATURE_CLASS}`);
        if (elements.length === 0) {
          console.error('No placeholders found with class:', SIGNATURE_CLASS);
          return { 
            success: false, 
            message: `No signature placeholders found with class: ${SIGNATURE_CLASS}` 
          };
        }

        let invalidCount = 0;
        elements.forEach((el, index) => {
          const validation = this.validateElement(el);
          if (!validation.valid) {
            console.warn(`Placeholder ${index + 1} is invalid:`, validation.message);
            invalidCount++;
          }
        });

        if (invalidCount === elements.length) {
          console.error('All placeholders are invalid');
          return {
            success: false,
            message: 'All signature placeholders are invalid'
          };
        }

        isSigningMode = true;
        if (callback) onCompleteCallback = callback;
        
        const signBtn = document.getElementById('signBtn');
        if (signBtn) {
          signBtn.disabled = true;
          signBtn.textContent = 'Select area to sign...';
        }
        
        const hasPlaceholders = highlightSignatureAreas();
        if (!hasPlaceholders) {
          this.finishSigning();
          return { 
            success: false, 
            message: `No valid signature placeholders found with class: ${SIGNATURE_CLASS}` 
          };
        }
        
        console.log(`Found ${elements.length} signature placeholder(s), ${invalidCount} invalid`);
        return { 
          success: true, 
          message: "Click on any signature area to start signing",
          totalPlaceholders: elements.length,
          invalidPlaceholders: invalidCount
        };
      } catch (error) {
        console.error('Error starting signing process:', error);
        this.reset();
        return {
          success: false,
          message: 'Failed to start signing process',
          error: error.message
        };
      }
    },

    // Activate specific signature area
    activateSignatureArea: function(element) {
      try {
        const validation = this.validateElement(element);
        if (!validation.valid) {
          console.error('Invalid element:', validation.message);
          return { success: false, message: validation.message };
        }

        const existingImg = element.querySelector('img[data-signature]');
        if (existingImg) {
          console.warn('Element already contains a signature');
          const shouldReplace = confirm('This area already has a signature. Replace it?');
          if (!shouldReplace) {
            return { success: false, message: 'User cancelled replacement' };
          }
        }

        removeHighlights();
        currentSignatureElement = element;
        
        try {
          element.setAttribute('data-original-content', element.innerHTML);
        } catch (error) {
          console.warn('Could not store original content:', error);
        }
        
        element.classList.add('signing');
        
        try {
          const { canvas, ctx } = createSignatureCanvas(element);
          const controls = createControls();
          
          currentCanvas = canvas;
          currentCtx = ctx;
          
          element.innerHTML = '';
          element.appendChild(canvas);
          element.appendChild(controls);
          
          setupCanvasEvents(canvas);
        } catch (error) {
          console.error('Error creating signature interface:', error);
          this.cancelSigning();
          return {
            success: false,
            message: 'Failed to create signature interface',
            error: error.message
          };
        }
        
        return { success: true, message: "Signature area activated" };
      } catch (error) {
        console.error('Error activating signature area:', error);
        this.cancelSigning();
        return {
          success: false,
          message: 'Failed to activate signature area',
          error: error.message
        };
      }
    },

    // Clear current signature
    clearCurrentSignature: function() {
      if (!currentCtx || !currentCanvas) {
        return { success: false, message: "No active signature area" };
      }

      currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
      return { success: true, message: "Signature cleared" };
    },

    // Save current signature
    saveCurrentSignature: function() {
      try {
        const canvasValidation = this.validateCanvasState();
        if (!canvasValidation.valid) {
          console.error('Invalid canvas state:', canvasValidation.message);
          return { success: false, message: canvasValidation.message };
        }

        const imageData = currentCtx.getImageData(0, 0, currentCanvas.width, currentCanvas.height);
        const isEmpty = imageData.data.every(pixel => pixel === 0);

        if (isEmpty) {
          console.warn('No signature provided');
          return { success: false, message: "Please provide a signature before saving" };
        }

        let base64;
        try {
          base64 = currentCanvas.toDataURL("image/png");
          if (!base64 || !base64.startsWith('data:image/png;base64,')) {
            throw new Error('Invalid base64 format');
          }
        } catch (error) {
          console.error('Error generating base64:', error);
          return {
            success: false,
            message: 'Failed to generate signature image',
            error: error.message
          };
        }

        const signatureId = currentSignatureElement.getAttribute('data-signature-id');
        
        const elementAttributes = {};
        try {
          Array.from(currentSignatureElement.attributes).forEach(attr => {
            if (attr.name.startsWith('data-')) {
              elementAttributes[attr.name] = attr.value;
            }
          });
        } catch (error) {
          console.warn('Error reading element attributes:', error);
        }

        let bytes, binaryString;
        try {
          binaryString = atob(base64.split(',')[1]);
          bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
        } catch (error) {
          console.error('Error converting to binary:', error);
          return {
            success: false,
            message: 'Failed to process signature data',
            error: error.message
          };
        }

        try {
          const img = document.createElement('img');
          img.src = base64;
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.border = '1px solid #ccc';
          img.setAttribute('data-signature', base64);
          
          currentSignatureElement.innerHTML = '';
          currentSignatureElement.appendChild(img);
          currentSignatureElement.classList.remove('signing');
        } catch (error) {
          console.error('Error creating image element:', error);
          return {
            success: false,
            message: 'Failed to save signature image',
            error: error.message
          };
        }
        
        const returnData = {
          signatureId: signatureId,
          base64: base64,
          binary: bytes,
          binaryString: binaryString,
          elementAttributes: elementAttributes,
          element: currentSignatureElement,
          mimeType: 'image/png',
          timestamp: new Date().toISOString()
        };

        if (onCompleteCallback && typeof onCompleteCallback === 'function') {
          try {
            onCompleteCallback(returnData);
          } catch (error) {
            console.error('Error in completion callback:', error);
          }
        }

        this.finishSigning();

        console.log('Signature saved successfully for ID:', signatureId);
        return {
          success: true,
          message: "Signature saved successfully",
          data: returnData
        };
      } catch (error) {
        console.error('Unexpected error saving signature:', error);
        this.cancelSigning();
        return {
          success: false,
          message: 'An unexpected error occurred while saving',
          error: error.message
        };
      }
    },

    // Cancel signing process
    cancelSigning: function() {
      if (currentSignatureElement) {
        const originalContent = currentSignatureElement.getAttribute('data-original-content');
        currentSignatureElement.innerHTML = originalContent || 'Click to sign here';
        currentSignatureElement.classList.remove('signing');
        currentSignatureElement.removeAttribute('data-original-content');
      }

      this.finishSigning();
      return { success: true, message: "Signing cancelled" };
    },

    // Finish signing process
    finishSigning: function() {
      isSigningMode = false;
      currentSignatureElement = null;
      currentCanvas = null;
      currentCtx = null;
      isDrawing = false;
      
      removeHighlights();
      
      const signBtn = document.getElementById('signBtn');
      if (signBtn) {
        signBtn.disabled = false;
        signBtn.textContent = 'Start Signing';
      }
    },

    // Get all signatures
    getAllSignatures: function() {
      const signatures = [];
      const elements = document.querySelectorAll(`.${SIGNATURE_CLASS}`);
      
      if (elements.length === 0) {
        console.warn('No placeholders found with class:', SIGNATURE_CLASS);
        return signatures;
      }
      
      elements.forEach(el => {
        const img = el.querySelector('img[data-signature]');
        if (img) {
          const base64 = img.getAttribute('data-signature');
          
          const elementAttributes = {};
          Array.from(el.attributes).forEach(attr => {
            if (attr.name.startsWith('data-')) {
              elementAttributes[attr.name] = attr.value;
            }
          });

          const binaryString = atob(base64.split(',')[1]);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          signatures.push({
            signatureId: el.getAttribute('data-signature-id'),
            base64: base64,
            binary: bytes,
            binaryString: binaryString,
            elementAttributes: elementAttributes,
            element: el,
            mimeType: 'image/png'
          });
        }
      });

      console.log(`Found ${signatures.length} completed signature(s) out of ${elements.length} placeholder(s)`);
      return signatures;
    },

    // Get signature by ID
    getSignatureById: function(signatureId) {
      const elements = document.querySelectorAll(`.${SIGNATURE_CLASS}`);
      if (elements.length === 0) {
        console.warn('No placeholders found with class:', SIGNATURE_CLASS);
        return { success: false, message: "No signature placeholders found" };
      }

      const element = document.querySelector(`.${SIGNATURE_CLASS}[data-signature-id="${signatureId}"]`);
      if (!element) {
        console.warn(`Signature with ID '${signatureId}' not found`);
        return { success: false, message: "Signature not found" };
      }

      const img = element.querySelector('img[data-signature]');
      if (!img) {
        return { success: false, message: "No signature data found" };
      }

      const base64 = img.getAttribute('data-signature');
      
      const elementAttributes = {};
      Array.from(element.attributes).forEach(attr => {
        if (attr.name.startsWith('data-')) {
          elementAttributes[attr.name] = attr.value;
        }
      });

      const binaryString = atob(base64.split(',')[1]);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return {
        success: true,
        data: {
          signatureId: signatureId,
          base64: base64,
          binary: bytes,
          binaryString: binaryString,
          elementAttributes: elementAttributes,
          element: element,
          mimeType: 'image/png'
        }
      };
    },

    // Download signature
    downloadSignature: function(signatureId, filename) {
      const result = this.getSignatureById(signatureId);
      if (!result.success) {
        return result;
      }

      const { binary, elementAttributes } = result.data;
      const blob = new Blob([binary], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `signature_${signatureId}_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { 
        success: true, 
        message: "Signature downloaded",
        data: { filename: link.download, elementAttributes }
      };
    },

    // Set signature class
    setSignatureClass: function(className) {
      if (!className || typeof className !== 'string') {
        console.error('Invalid class name provided:', className);
        return { 
          success: false, 
          message: 'Class name must be a non-empty string' 
        };
      }

      const oldClass = SIGNATURE_CLASS;
      SIGNATURE_CLASS = className;
      
      const elements = document.querySelectorAll(`.${SIGNATURE_CLASS}`);
      if (elements.length === 0) {
        console.warn(`No placeholders found with new class: ${className}`);
      } else {
        console.log(`Found ${elements.length} placeholder(s) with class: ${className}`);
      }
      
      return { 
        success: true, 
        message: `Signature class changed from '${oldClass}' to '${className}'`,
        placeholderCount: elements.length
      };
    },

    // Check if placeholders exist
    hasPlaceholders: function() {
      try {
        const elements = document.querySelectorAll(`.${SIGNATURE_CLASS}`);
        const hasElements = elements.length > 0;
        
        if (!hasElements) {
          console.warn('No placeholders found with class:', SIGNATURE_CLASS);
        }
        
        return {
          success: hasElements,
          count: elements.length,
          message: hasElements ? 
            `Found ${elements.length} placeholder(s)` : 
            `No placeholders found with class: ${SIGNATURE_CLASS}`
        };
      } catch (error) {
        console.error('Error checking placeholders:', error);
        return {
          success: false,
          count: 0,
          message: 'Error occurred while checking placeholders',
          error: error.message
        };
      }
    },

    // Validate element
    validateElement: function(element) {
      if (!element) {
        return { valid: false, message: 'Element is null or undefined' };
      }
      
      if (!(element instanceof HTMLElement)) {
        return { valid: false, message: 'Element is not a valid HTML element' };
      }
      
      if (!element.classList.contains(SIGNATURE_CLASS)) {
        return { valid: false, message: `Element does not have class: ${SIGNATURE_CLASS}` };
      }
      
      const signatureId = element.getAttribute('data-signature-id');
      if (!signatureId) {
        return { valid: false, message: 'Element missing data-signature-id attribute' };
      }
      
      return { valid: true, message: 'Element is valid', signatureId };
    },

    // Validate canvas state
    validateCanvasState: function() {
      if (!currentCanvas) {
        return { valid: false, message: 'No active canvas' };
      }
      
      if (!currentCtx) {
        return { valid: false, message: 'No canvas context available' };
      }
      
      if (!currentSignatureElement) {
        return { valid: false, message: 'No active signature element' };
      }
      
      return { valid: true, message: 'Canvas state is valid' };
    },

    // Reset module
    reset: function() {
      try {
        if (isSigningMode) {
          this.cancelSigning();
        }
        
        removeHighlights();
        
        isSigningMode = false;
        currentSignatureElement = null;
        currentCanvas = null;
        currentCtx = null;
        isDrawing = false;
        lastX = 0;
        lastY = 0;
        onCompleteCallback = null;
        
        const signBtn = document.getElementById('signBtn');
        if (signBtn) {
          signBtn.disabled = false;
          signBtn.textContent = 'Start Signing';
        }
        
        console.log('Module reset successfully');
        return { success: true, message: 'Module reset to initial state' };
      } catch (error) {
        console.error('Error resetting module:', error);
        return {
          success: false,
          message: 'Error occurred during reset',
          error: error.message
        };
      }
    }
  };
})();

// Expose globally
if (typeof window !== 'undefined') {
  window.DynamicSignature = DynamicSignature;
}

// Export for Node.js/module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DynamicSignature;
}
