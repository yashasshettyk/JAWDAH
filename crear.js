try {
  // Initialize with custom options
  const initResult = DynamicSignature.init({
    signatureClass: "signature-placeholder",
    onComplete: function (signatureData) {
      console.log("Signature completed:", signatureData);
      // Handle signature completion here
      // You can send signatureData to your server or process it as needed
    },
  });

  if (initResult.success) {
    console.log("Signature library ready");

    // Check for placeholders
    const placeholderCheck = DynamicSignature.hasPlaceholders();
    console.log("Placeholder check:", placeholderCheck.message);
  } else {
    console.error("Failed to initialize:", initResult.message);
  }
} catch (error) {
  console.error("Error during initialization:", error);
}

window.addEventListener("unhandledrejection", function (event) {
  console.error("Unhandled promise rejection:", event.reason);
});
