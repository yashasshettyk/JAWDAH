class PhotoCapture {
  constructor() {
    this.video = null;
    this.canvas = null;
    this.errorDiv = null;
    this.stream = null;
    this.isInitialized = false;
  }

  // Function 1: Initialize the component (call this on screen ready)
  initializeComponent(videoElementId, canvasElementId, errorElementId) {
    if (this.isInitialized) return;

    this.video = document.getElementById(videoElementId);
    this.canvas = document.getElementById(canvasElementId);
    this.errorDiv = document.getElementById(errorElementId);
    this.isInitialized = true;
    console.log("Photo Capture Component Initialized");
  }

  // Function 2: Start Camera (returns nothing)
  async startCamera() {
    try {
      this.clearError();

      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;

      this.video.style.display = "block";

      console.log("Camera started successfully");
    } catch (error) {
      this.showError(
        "Camera access denied or not available: " + error.message
      );
      throw error;
    }
  }

  // Function 3: Capture Image (returns image info object)
  capturePhoto(clickedOn = null) {
    if (!this.stream) {
      // Instead of throwing, return null to avoid undefined assignment
      this.showError("Camera not started. Please start camera first.");
      return null;
    }

    const context = this.canvas.getContext("2d");
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;

    context.drawImage(this.video, 0, 0);

    const mimeType = "image/png";
    const imageDataUrl = this.canvas.toDataURL(mimeType);

    // Extract base64 data (remove data:image/png;base64, prefix)
    const base64Data = imageDataUrl.split(",")[1];

    // Calculate file size in bytes
    let padding = 0;
    if (base64Data.endsWith("==")) padding = 2;
    else if (base64Data.endsWith("=")) padding = 1;
    const fileSize = (base64Data.length * 3) / 4 - padding;

    // Generate a name for the file
    const name = `photo_${new Date().getTime()}.png`;

    console.log("Photo captured successfully");
    return {
      fileName: name,
      fileBinary: base64Data,
      fileClickedOn: clickedOn,
      fileMimeType: mimeType,
      fileFileSize: fileSize,
    };
  }

  // Function 4: Stop Camera
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    this.video.style.display = "none";

    console.log("Camera stopped successfully");
  }

  downloadPhoto(dataUrl) {
    const link = document.createElement("a");
    link.download = `photo_${new Date().getTime()}.png`;
    link.href = dataUrl;
    link.click();
  }

  showError(message) {
    if (this.errorDiv) {
      this.errorDiv.textContent = message;
    }
  }

  clearError() {
    if (this.errorDiv) {
      this.errorDiv.textContent = "";
    }
  }
}
