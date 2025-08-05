// Prettier CDN
const prettierUrl = "https://unpkg.com/prettier@2.8.8/standalone.js";
const prettierHtmlUrl = "https://unpkg.com/prettier@2.8.8/parser-html.js";
let prettierLoaded = false;
let prettier, prettierHtml;

function loadPrettier(cb) {
  if (prettierLoaded) return cb();
  const script1 = document.createElement("script");
  script1.src = prettierUrl;
  script1.onload = () => {
    const script2 = document.createElement("script");
    script2.src = prettierHtmlUrl;
    script2.onload = () => {
      prettier = window.prettier;
      prettierHtml = window.prettierPlugins.html;
      prettierLoaded = true;
      cb();
    };
    document.body.appendChild(script2);
  };
  document.body.appendChild(script1);
}

// Main OutSystemsEditor class
class OutSystemsEditor {
  constructor(containerId, config = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.config = config;
    this.htmlEditor = null;
    this.babelEditor = null;
    this.outsystemsData = {};

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

    // Replace variables in HTML
    const processedHTML = this.replaceVariables(htmlContent);

    // Transform Babel code if available
    let transformedJS = babelContent;
    if (babelContent && window.Babel) {
      try {
        transformedJS = Babel.transform(babelContent, {
          presets: ["env"],
        }).code;
      } catch (error) {
        console.warn(
          "Babel transformation failed, using original code:",
          error
        );
      }
    }

    // Basic preview functionality
    const previewFrame = this.container.querySelector("#previewFrame");
    if (previewFrame) {
      const previewContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Preview</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>body { font-family: Arial, sans-serif; padding: 20px; }</style>
        </head>
        <body>
          ${processedHTML}
          <script>
            // Make OutSystems data available globally
            window.outsystemsData = ${JSON.stringify(this.outsystemsData)};
            
            // User code
            ${transformedJS}
          </script>
          <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
      `;

      previewFrame.srcdoc = previewContent;
    }

    // Switch to preview tab
    const previewTab = this.container.querySelector("#preview-tab");
    if (previewTab) {
      previewTab.click();
    }
  }

  formatCode() {
    console.log("Formatting code...");

    const activeTab = this.container.querySelector(".nav-link.active");
    const activeTabId = activeTab ? activeTab.id : null;

    if (activeTabId === "html-tab" && this.htmlEditor) {
      const formatted = this.formatHTML(this.htmlEditor.getValue());
      this.htmlEditor.setValue(formatted);
    } else if (activeTabId === "babel-tab" && this.babelEditor) {
      const formatted = this.formatJS(this.babelEditor.getValue());
      this.babelEditor.setValue(formatted);
    }
  }

  parseVariables() {
    console.log("Parsing variables...");

    const outsystemsData = this.container.querySelector("#outsystemsData");
    const variableList = this.container.querySelector("#variableList");

    if (outsystemsData && variableList) {
      try {
        const data = JSON.parse(outsystemsData.value);
        this.outsystemsData = data;
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

  replaceVariables(content) {
    return content.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getValueByPath(this.outsystemsData, path.trim());
      return value !== undefined ? value : match;
    });
  }

  getValueByPath(obj, path) {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  formatHTML(html) {
    return html
      .replace(/></g, ">\n<")
      .replace(/^\s+|\s+$/g, "")
      .split("\n")
      .map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return "";
        const indent = "  ".repeat(Math.max(0, index > 0 ? 1 : 0));
        return indent + trimmed;
      })
      .join("\n");
  }

  formatJS(js) {
    return js
      .replace(/;/g, ";\n")
      .replace(/{/g, "{\n")
      .replace(/}/g, "\n}")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)
      .join("\n");
  }

  setEditorConfigs(config) {
    this.config = { ...this.config, ...config };

    if (config.theme !== undefined) {
      if (this.htmlEditor) this.htmlEditor.setOption("theme", config.theme);
      if (this.babelEditor) this.babelEditor.setOption("theme", config.theme);
    }

    if (config.lineNumbers !== undefined) {
      if (this.htmlEditor)
        this.htmlEditor.setOption("lineNumbers", config.lineNumbers);
      if (this.babelEditor)
        this.babelEditor.setOption("lineNumbers", config.lineNumbers);
    }

    if (config.autoRun === true) {
      setTimeout(() => this.runAndPreview(), 500);
    }

    if (config.activeTab !== undefined) {
      const tabMap = {
        html: "html-tab",
        babel: "babel-tab",
        js: "babel-tab",
        preview: "preview-tab",
      };
      const tabId = tabMap[config.activeTab] || config.activeTab;
      const tabElement = this.container.querySelector(`#${tabId}`);
      if (tabElement) {
        tabElement.click();
      }
    }

    // Refresh editors
    setTimeout(() => {
      if (this.htmlEditor) this.htmlEditor.refresh();
      if (this.babelEditor) this.babelEditor.refresh();
    }, 100);

    console.log("Editor config updated:", this.config);
    return { success: true, message: "Config updated" };
  }

  getEditorConfigs() {
    const outsystemsDataEl = this.container.querySelector("#outsystemsData");
    return {
      containerId: this.containerId,
      htmlContent: this.htmlEditor ? this.htmlEditor.getValue() : "",
      babelContent: this.babelEditor ? this.babelEditor.getValue() : "",
      outsystemsData: this.outsystemsData,
      outsystemsDataRaw: outsystemsDataEl ? outsystemsDataEl.value : "",
      config: this.config,
    };
  }
}

// Make it globally available
window.OutSystemsEditor = OutSystemsEditor;
console.log("OutSystemsEditor main class loaded");

// Initialize the editor when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // This will be handled by the script in index.html
});

// Global helper function for external access
window.setEditorConfigs = function (config) {
  if (window.editorInstance) {
    return window.editorInstance.setEditorConfigs(config);
  } else {
    console.error("Editor instance not initialized yet");
    return { success: false, message: "Editor not ready" };
  }
};

window.getEditorConfigs = function () {
  if (window.editorInstance) {
    return window.editorInstance.getEditorConfigs();
  } else {
    console.error("Editor instance not initialized yet");
    return null;
  }
};
