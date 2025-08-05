// Main OutSystemsEditor class
class OutSystemsEditor {
  constructor(containerId, config = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.config = config;
    this.htmlEditor = null;
    this.babelEditor = null;

    console.log("OutSystemsEditor initialized for container:", containerId);

    // Initialize editor functionality
    this.init();
  }

  init() {
    console.log("Editor initialized successfully");

    // Setup CodeMirror editors
    this.setupEditors();

    // Setup event listeners
    this.setupEventListeners();
  }

  setupEditors() {
    setTimeout(() => {
      const htmlTextarea = this.container.querySelector("#htmlEditor");
      const babelTextarea = this.container.querySelector("#babelEditor");

      if (htmlTextarea && window.CodeMirror) {
        this.htmlEditor = CodeMirror.fromTextArea(htmlTextarea, {
          mode: "htmlmixed",
          theme: "default",
          lineNumbers: true,
          autoCloseTags: true,
          autoCloseBrackets: true,
          matchBrackets: true,
          indentUnit: 2,
          tabSize: 2,
          lineWrapping: true,
        });
      }

      if (babelTextarea && window.CodeMirror) {
        this.babelEditor = CodeMirror.fromTextArea(babelTextarea, {
          mode: "javascript",
          theme: "default",
          lineNumbers: true,
          autoCloseBrackets: true,
          matchBrackets: true,
          indentUnit: 2,
          tabSize: 2,
          lineWrapping: true,
        });
      }
    }, 100);
  }

  setupEventListeners() {
    setTimeout(() => {
      const runBtn = this.container.querySelector("#runBtn");
      const formatBtn = this.container.querySelector("#formatBtn");
      const helpBtn = this.container.querySelector("#helpBtn");
      const parseDataBtn = this.container.querySelector("#parseDataBtn");

      if (runBtn) {
        runBtn.addEventListener("click", () => {
          this.runAndPreview();
        });
      }

      if (formatBtn) {
        formatBtn.addEventListener("click", () => {
          this.formatCode();
        });
      }

      if (helpBtn) {
        helpBtn.addEventListener("click", () => {
          console.log("Help button clicked");
        });
      }

      if (parseDataBtn) {
        parseDataBtn.addEventListener("click", () => {
          this.parseVariables();
        });
      }
    }, 100);
  }

  runAndPreview() {
    console.log("Running and previewing...");

    const htmlContent = this.htmlEditor ? this.htmlEditor.getValue() : "";
    const babelContent = this.babelEditor ? this.babelEditor.getValue() : "";

    // Basic preview functionality
    const previewFrame = this.container.querySelector("#previewFrame");
    if (previewFrame) {
      const doc =
        previewFrame.contentDocument || previewFrame.contentWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Preview</title>
          <style>body { font-family: Arial, sans-serif; padding: 20px; }</style>
        </head>
        <body>
          ${htmlContent}
          <script>${babelContent}</script>
        </body>
        </html>
      `);
      doc.close();
    }

    // Switch to preview tab
    const previewTab = this.container.querySelector("#preview-tab");
    if (previewTab) {
      previewTab.click();
    }
  }

  formatCode() {
    console.log("Formatting code...");

    if (this.htmlEditor) {
      this.htmlEditor.setValue(this.htmlEditor.getValue());
    }

    if (this.babelEditor) {
      this.babelEditor.setValue(this.babelEditor.getValue());
    }
  }

  parseVariables() {
    console.log("Parsing variables...");

    const outsystemsData = this.container.querySelector("#outsystemsData");
    const variableList = this.container.querySelector("#variableList");

    if (outsystemsData && variableList) {
      try {
        const data = JSON.parse(outsystemsData.value);
        window.outsystemsData = data;

        const variables = this.extractVariablePaths(data);
        this.displayVariables(variables, variableList);
      } catch (error) {
        variableList.innerHTML = `<div class="text-danger">Error parsing JSON: ${error.message}</div>`;
      }
    }
  }

  extractVariablePaths(obj, prefix = "") {
    const paths = [];

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newPrefix = prefix ? `${prefix}.${key}` : key;

        if (
          typeof obj[key] === "object" &&
          obj[key] !== null &&
          !Array.isArray(obj[key])
        ) {
          paths.push(...this.extractVariablePaths(obj[key], newPrefix));
        } else {
          paths.push({
            path: newPrefix,
            value: obj[key],
            type: Array.isArray(obj[key]) ? "array" : typeof obj[key],
          });
        }
      }
    }

    return paths;
  }

  displayVariables(variables, container) {
    container.innerHTML = "";

    variables.forEach((variable) => {
      const item = document.createElement("div");
      item.className =
        "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
      item.style.cursor = "pointer";

      item.innerHTML = `
        <div>
          <code>{{${variable.path}}}</code>
          <small class="text-muted d-block">${variable.type}: ${JSON.stringify(
        variable.value
      )}</small>
        </div>
        <i class="bi bi-clipboard"></i>
      `;

      item.addEventListener("click", () => {
        navigator.clipboard.writeText(`{{${variable.path}}}`).then(() => {
          console.log(`Copied: {{${variable.path}}}`);
        });
      });

      container.appendChild(item);
    });
  }

  setEditorConfigs(config) {
    this.config = { ...this.config, ...config };
    console.log("Editor config updated:", this.config);
    return { success: true, message: "Config updated" };
  }

  getEditorConfigs() {
    return this.config;
  }
}

// Make it globally available
window.OutSystemsEditor = OutSystemsEditor;
console.log("OutSystemsEditor fallback loaded with full functionality");
