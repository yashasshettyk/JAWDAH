try {
  // Initialize with custom options
  const initResult = DynamicNameInput.init({
    nameClass: "name-placeholder",
    onComplete: function (nameData) {
      console.log("Name entry completed:", nameData);
      // Handle name completion here
      // You can send nameData to your server or process it as needed
    },
  });

  if (initResult.success) {
    console.log("Name input library ready");

    // Check for placeholders
    const placeholderCheck = DynamicNameInput.hasPlaceholders();
    console.log("Placeholder check:", placeholderCheck.message);
  } else {
    console.error("Failed to initialize:", initResult.message);
  }
} catch (error) {
  console.error("Error during initialization:", error);
}

function getAllNames() {
  return DynamicNameInput.getAllNames();
}

function getNameById(nameId) {
  return DynamicNameInput.getNameById(nameId);
}

function resetNameSystem() {
  return DynamicNameInput.reset();
}
