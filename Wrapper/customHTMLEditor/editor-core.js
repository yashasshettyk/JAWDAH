(function () {
  "use strict";

  // Core Editor Class
  class HTMLEditorCore {
    constructor() {
      this.editors = new Map();
      this.currentTab = "html";
      this.updateTimer = null;
      this.isReady = false;

      this.defaultTemplates = {
        html: `<div id="app">
    <div class="container">
        <h1>Hello {userName}!</h1>
        <p>Welcome to the editor. Today is {currentDate}</p>
        
        <div class="counter-section">
            <button onclick="handleIncrement()" class="btn btn-primary">
                Count: <span id="counter">{initialCount}</span>
            </button>
            <button onclick="handleReset()" class="btn btn-secondary">Reset</button>
        </div>
        
        <div class="user-info">
            <h3>User Information</h3>
            <p>Name: {userProfile.name}</p>
            <p>Email: {userProfile.email}</p>
            <p>Role: {userProfile.role}</p>
        </div>
    </div>
</div>`,

        css: `body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

h1 {
    color: #333;
    text-align: center;
    margin-bottom: 20px;
}

.counter-section {
    text-align: center;
    margin: 30px 0;
}

.btn {
    border: none;
    padding: 12px 24px;
    margin: 5px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s ease;
}

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-primary:hover {
    background: #0056b3;
}

.btn-secondary {
    background: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background: #545b62;
}

.user-info {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 5px;
    margin-top: 20px;
}

.user-info h3 {
    margin-bottom: 15px;
    color: #495057;
}

.user-info p {
    margin: 5px 0;
    color: #6c757d;
}`,

        javascript: `// Modern JavaScript for OutSystems integration
class AppController {
    constructor() {
        this.counter = Variables.initialCount || 0;
        this.init();
    }
    
    init() {
        console.log('App initialized with variables:', Variables);
        this.updateDisplay();
    }
    
    increment() {
        this.counter++;
        this.updateDisplay();
        console.log('Counter incremented to:', this.counter);
    }
    
    reset() {
        this.counter = 0;
        this.updateDisplay();
        console.log('Counter reset');
    }
    
    updateDisplay() {
        const counterElement = document.getElementById('counter');
        if (counterElement) {
            counterElement.textContent = this.counter;
        }
    }
}

// Global instance
let appController;

// Global functions for HTML onclick handlers
function handleIncrement() {
    if (appController) {
        appController.increment();
    }
}

function handleReset() {
    if (appController) {
        appController.reset();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    appController = new AppController();
});`,

        variables: `{
    "userName": "John Doe",
    "currentDate": "2024-01-15",
    "initialCount": 0,
    "userProfile": {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "Developer"
    }
}`,
      };
    }

    // Initialize the editor
    async init() {
      try {
        this.showLoading(true);
        this.setupEventListeners();
        await this.initMonaco();
        this.isReady = true;
        this.updatePreview();
        this.showLoading(false);
      } catch (error) {
        console.error("Editor initialization failed:", error);
        this.showError("Failed to initialize editor: " + error.message);
        this.showLoading(false);
      }
    }

    // Setup event listeners
    setupEventListeners() {
      // Tab buttons
      document.querySelectorAll(".tab-button").forEach((button) => {
        button.addEventListener("click", (e) => {
          const tab = e.target.getAttribute("data-tab");
          if (tab) this.switchTab(tab);
        });
      });

      // Action buttons
      const runBtn = document.getElementById("runBtn");
      const clearBtn = document.getElementById("clearBtn");
      const exportBtn = document.getElementById("exportBtn");
      const importBtn = document.getElementById("importBtn");
      const exampleBtn = document.getElementById("exampleBtn");

      if (runBtn) runBtn.addEventListener("click", () => this.updatePreview());
      if (clearBtn) clearBtn.addEventListener("click", () => this.clearAll());
      if (exportBtn)
        exportBtn.addEventListener("click", () => this.exportCode());
      if (importBtn)
        importBtn.addEventListener("click", () => this.importCode());
      if (exampleBtn)
        exampleBtn.addEventListener("click", () => this.loadExample());

      // Keyboard shortcuts
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case "s":
              e.preventDefault();
              this.updatePreview();
              break;
            case "e":
              e.preventDefault();
              this.exportCode();
              break;
          }
        }
      });
    }

    // Initialize Monaco Editor
    async initMonaco() {
      return new Promise((resolve, reject) => {
        // Check if require is available
        if (typeof require === "undefined") {
          reject(
            new Error(
              "Monaco Editor loader not found. Please ensure the Monaco Editor script is loaded."
            )
          );
          return;
        }

        // Configure Monaco paths with fallback
        try {
          require.config({
            paths: {
              vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs",
            },
            onError: (err) => {
              reject(new Error("Failed to load Monaco Editor: " + err.message));
            },
          });

          require(["vs/editor/editor.main"], () => {
            try {
              this.createEditors();
              this.setupAutoUpdate();
              resolve();
            } catch (error) {
              reject(
                new Error("Failed to initialize editors: " + error.message)
              );
            }
          }, (err) => {
            reject(
              new Error("Failed to require Monaco Editor: " + err.message)
            );
          });
        } catch (error) {
          reject(new Error("Monaco configuration failed: " + error.message));
        }
      });
    }

    // Create all editors
    createEditors() {
      const commonOptions = {
        theme: "vs-dark",
        automaticLayout: true,
        fontSize: 14,
        wordWrap: "on",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        renderWhitespace: "selection",
        folding: true,
        lineNumbers: "on",
        tabSize: 2,
        insertSpaces: true,
      };

      const editorConfigs = [
        { id: "html", language: "html", template: "html" },
        { id: "css", language: "css", template: "css" },
        { id: "javascript", language: "javascript", template: "javascript" },
        {
          id: "variables",
          language: "json",
          template: "variables",
          fontSize: 12,
        },
      ];

      editorConfigs.forEach((config) => {
        const element = document.getElementById(`${config.id}Editor`);
        if (element) {
          try {
            const editor = monaco.editor.create(element, {
              ...commonOptions,
              value: this.defaultTemplates[config.template] || "",
              language: config.language,
              fontSize: config.fontSize || commonOptions.fontSize,
            });
            this.editors.set(config.id, editor);
          } catch (error) {
            console.error(`Failed to create ${config.id} editor:`, error);
            this.showError(`Failed to initialize ${config.id} editor`);
          }
        } else {
          console.warn(`Editor element not found: ${config.id}Editor`);
        }
      });

      // Validate that at least one editor was created
      if (this.editors.size === 0) {
        throw new Error("No editors could be initialized");
      }
    }

    // Setup auto-update
    setupAutoUpdate() {
      this.editors.forEach((editor) => {
        editor.onDidChangeModelContent(() => {
          clearTimeout(this.updateTimer);
          this.updateTimer = setTimeout(() => {
            this.updatePreview();
          }, 1000);
        });
      });
    }

    // Switch tabs
    switchTab(tabName) {
      this.currentTab = tabName;

      // Update tab buttons
      document.querySelectorAll(".tab-button").forEach((btn) => {
        btn.classList.remove("active");
      });

      const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
      if (activeTab) {
        activeTab.classList.add("active");
      }

      // Show/hide editors
      const editorIds = ["htmlEditor", "cssEditor", "javascriptEditor"];
      editorIds.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          element.style.display = "none";
        }
      });

      const currentEditor = document.getElementById(`${tabName}Editor`);
      if (currentEditor) {
        currentEditor.style.display = "block";
        const editor = this.editors.get(tabName);
        if (editor) {
          setTimeout(() => editor.layout(), 100);
        }
      }
    }

    // Update preview
    updatePreview() {
      if (!this.isReady) {
        console.warn("Editor not ready, skipping preview update");
        return;
      }

      try {
        this.hideError();

        // Get editor values with fallbacks
        const html = this.getEditorValue("html");
        const css = this.getEditorValue("css");
        const js = this.getEditorValue("javascript");
        const variablesText = this.getEditorValue("variables");

        // Parse and validate variables
        let variables = {};
        try {
          if (variablesText.trim()) {
            variables = JSON.parse(variablesText);
            if (typeof variables !== "object" || variables === null) {
              throw new Error("Variables must be a JSON object");
            }
          }
          this.updateStatus("variableStatus", "Variables OK", "success");
        } catch (e) {
          this.updateStatus("variableStatus", "JSON Error", "error");
          this.showError("Invalid JSON in variables: " + e.message);
          return;
        }

        // Process HTML with variables
        const processedHtml = this.replaceVariables(html, variables);

        // Transpile JavaScript if Babel is available
        let transpiledJs = js;
        if (typeof Babel !== "undefined" && js.trim()) {
          try {
            const result = Babel.transform(js, {
              presets: ["env"],
              plugins: [],
            });
            transpiledJs = result.code;
            this.updateStatus("babelStatus", "Babel ✓", "success");
          } catch (e) {
            this.updateStatus("babelStatus", "Babel Error", "error");
            this.showError("JavaScript transpilation failed: " + e.message);
            return;
          }
        } else if (js.trim()) {
          this.updateStatus("babelStatus", "No Babel", "warning");
        } else {
          this.updateStatus("babelStatus", "No JS", "");
        }

        // Create and update preview document
        const previewHtml = this.createPreviewDocument(
          processedHtml,
          css,
          transpiledJs,
          variables
        );

        const iframe = document.getElementById("previewFrame");
        if (iframe) {
          iframe.srcdoc = previewHtml;
        } else {
          throw new Error("Preview frame not found");
        }

        // Update timestamp
        this.updateStatus(
          "updateTime",
          new Date().toLocaleTimeString(),
          "success"
        );
      } catch (error) {
        this.showError("Preview update failed: " + error.message);
        console.error("Preview update error:", error);
      }
    }

    // Get editor value safely
    getEditorValue(editorName) {
      const editor = this.editors.get(editorName);
      return editor ? editor.getValue() : "";
    }

    // Replace variables in HTML
    replaceVariables(html, variables) {
      let result = html;

      function processObject(obj, prefix = "") {
        for (const [key, value] of Object.entries(obj)) {
          const fullKey = prefix ? `${prefix}.${key}` : key;

          if (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value)
          ) {
            processObject(value, fullKey);
          } else {
            const pattern = new RegExp(
              `\\{${fullKey.replace(/\./g, "\\.")}\\}`,
              "g"
            );
            result = result.replace(pattern, String(value));
          }
        }
      }

      if (variables && typeof variables === "object") {
        processObject(variables);
      }

      return result;
    }

    // Create preview document
    createPreviewDocument(html, css, js, variables) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <style>${css || ""}</style>
</head>
<body>
    ${html || ""}
    <script>
        // Variables for OutSystems integration
        window.Variables = ${JSON.stringify(variables || {}, null, 2)};
        
        // Console forwarding
        ['log', 'warn', 'error', 'info'].forEach(method => {
            const original = console[method];
            console[method] = function(...args) {
                original.apply(console, args);
                try {
                    window.parent.postMessage({
                        type: 'console',
                        method: method,
                        args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg))
                    }, '*');
                } catch(e) {}
            };
        });
        
        // Error handling
        window.addEventListener('error', function(e) {
            console.error('Runtime Error:', e.message);
        });
        
        // User JavaScript
        ${js || ""}
    </script>
</body>
</html>`;
    }

    // Utility functions
    showError(message) {
      const errorBanner = document.getElementById("errorBanner");
      if (errorBanner) {
        errorBanner.textContent = "❌ " + message;
        errorBanner.style.display = "block";
        setTimeout(() => {
          errorBanner.style.display = "none";
        }, 5000);
      }
    }

    hideError() {
      const errorBanner = document.getElementById("errorBanner");
      if (errorBanner) {
        errorBanner.style.display = "none";
      }
    }

    updateStatus(elementId, text, type) {
      const element = document.getElementById(elementId);
      if (element) {
        element.textContent = text;
        element.className = "status-item";
        if (type) element.classList.add(type);
      }
    }

    showLoading(show) {
      const overlay = document.getElementById("loadingOverlay");
      if (overlay) {
        overlay.style.display = show ? "flex" : "none";
      }
    }

    // File operations
    clearAll() {
      if (confirm("Clear all code? This cannot be undone.")) {
        this.editors.forEach((editor) => {
          editor.setValue("");
        });
        this.updatePreview();
      }
    }

    exportCode() {
      try {
        const data = {
          html: this.getEditorValue("html"),
          css: this.getEditorValue("css"),
          javascript: this.getEditorValue("javascript"),
          variables: this.getEditorValue("variables"),
          metadata: {
            exportedAt: new Date().toISOString(),
            version: "2.0.0",
          },
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `html-editor-export-${new Date()
          .toISOString()
          .slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        this.showError("Export failed: " + error.message);
        console.error("Export error:", error);
      }
    }

    importCode() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";

      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);

            if (data.html && this.editors.has("html")) {
              this.editors.get("html").setValue(data.html);
            }
            if (data.css && this.editors.has("css")) {
              this.editors.get("css").setValue(data.css);
            }
            if (data.javascript && this.editors.has("javascript")) {
              this.editors.get("javascript").setValue(data.javascript);
            }
            if (data.variables && this.editors.has("variables")) {
              this.editors.get("variables").setValue(data.variables);
            }

            this.updatePreview();
          } catch (error) {
            this.showError("Invalid import file: " + error.message);
            console.error("Import error:", error);
          }
        };
        reader.onerror = () => {
          this.showError("Failed to read file");
        };
        reader.readAsText(file);
      };

      input.click();
    }

    loadExample() {
      if (confirm("Load example? This will replace current content.")) {
        if (this.editors.has("html")) {
          this.editors.get("html").setValue(this.defaultTemplates.html);
        }
        if (this.editors.has("css")) {
          this.editors.get("css").setValue(this.defaultTemplates.css);
        }
        if (this.editors.has("javascript")) {
          this.editors
            .get("javascript")
            .setValue(this.defaultTemplates.javascript);
        }
        if (this.editors.has("variables")) {
          this.editors
            .get("variables")
            .setValue(this.defaultTemplates.variables);
        }
        this.updatePreview();
      }
    }
  }

  // Console message handling
  window.addEventListener("message", function (event) {
    if (event.data && event.data.type === "console") {
      const method = event.data.method || "log";
      const args = event.data.args || [];
      console[method]("[Preview]", ...args);
    }
  });

  // Global HTMLEditor object
  window.HTMLEditor = {
    instance: null,

    init() {
      if (!this.instance) {
        this.instance = new HTMLEditorCore();
        this.instance.init();
      }
      return this.instance;
    },
  };
})();
