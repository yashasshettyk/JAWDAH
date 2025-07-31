(function () {
  "use strict";

  class HTMLTemplateBuilder {
    constructor() {
      this.currentTab = "html";
      this.templates = JSON.parse(
        localStorage.getItem("htmlTemplates") || "{}"
      );
      this.variables = new Set([
        "userName",
        "userEmail",
        "currentDate",
        "title",
        "contentTitle",
        "contentBody",
      ]);
      this.init();
    }

    init() {
      this.setupEventListeners();
      this.updatePreview();
      this.renderVariables();
    }

    setupEventListeners() {
      // Tab switching
      document.querySelectorAll(".tab").forEach((tab) => {
        tab.addEventListener("click", (e) => {
          this.switchTab(e.target.dataset.tab);
        });
      });

      // Editor content changes
      document.getElementById("htmlEditor").addEventListener("input", () => {
        this.extractVariables();
        this.updatePreview();
      });

      document.getElementById("cssEditor").addEventListener("input", () => {
        this.updatePreview();
      });

      // Button actions
      document
        .getElementById("saveBtn")
        .addEventListener("click", () => this.saveTemplate());
      document
        .getElementById("loadBtn")
        .addEventListener("click", () => this.loadTemplate());
      document
        .getElementById("exportBtn")
        .addEventListener("click", () => this.exportTemplate());
      document
        .getElementById("previewBtn")
        .addEventListener("click", () => this.updatePreview());
      document
        .getElementById("addVariableBtn")
        .addEventListener("click", () => this.addVariable());

      // Variable tag clicks
      document
        .getElementById("variablesList")
        .addEventListener("click", (e) => {
          if (e.target.classList.contains("tag")) {
            this.insertVariable(e.target.dataset.var);
          }
        });
    }

    switchTab(tabName) {
      this.currentTab = tabName;

      // Update tab appearance
      document.querySelectorAll(".tab").forEach((tab) => {
        tab.classList.remove("active");
      });
      document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

      // Show/hide editors
      document.getElementById("htmlEditor").style.display =
        tabName === "html" ? "block" : "none";
      document.getElementById("cssEditor").style.display =
        tabName === "css" ? "block" : "none";
    }

    extractVariables() {
      const htmlContent = document.getElementById("htmlEditor").value;
      const variablePattern = /\{([^}]+)\}/g;
      let match;

      while ((match = variablePattern.exec(htmlContent)) !== null) {
        this.variables.add(match[1]);
      }

      this.renderVariables();
    }

    renderVariables() {
      const variablesList = document.getElementById("variablesList");
      variablesList.innerHTML = "";

      Array.from(this.variables)
        .sort()
        .forEach((variable) => {
          const tag = document.createElement("span");
          tag.className = "tag";
          tag.dataset.var = variable;
          tag.textContent = variable;
          variablesList.appendChild(tag);
        });
    }

    insertVariable(variableName) {
      const activeEditor = document.getElementById(this.currentTab + "Editor");
      const cursorPos = activeEditor.selectionStart;
      const textBefore = activeEditor.value.substring(0, cursorPos);
      const textAfter = activeEditor.value.substring(cursorPos);

      const variableText = `{${variableName}}`;
      activeEditor.value = textBefore + variableText + textAfter;
      activeEditor.focus();
      activeEditor.setSelectionRange(
        cursorPos + variableText.length,
        cursorPos + variableText.length
      );

      this.updatePreview();
    }

    addVariable() {
      const variableName = prompt("Enter variable name:");
      if (variableName && variableName.trim()) {
        const cleanName = variableName.trim().replace(/[^a-zA-Z0-9_]/g, "");
        if (cleanName) {
          this.variables.add(cleanName);
          this.renderVariables();
          this.insertVariable(cleanName);
        }
      }
    }

    updatePreview() {
      try {
        const html = document.getElementById("htmlEditor").value;
        const css = document.getElementById("cssEditor").value;

        // Create sample data for preview
        const sampleData = {
          userName: "John Doe",
          userEmail: "john.doe@example.com",
          currentDate: new Date().toLocaleDateString(),
          title: "Sample Document Title",
          contentTitle: "Content Section",
          contentBody:
            "This is sample content to show how your template will look with real data.",
        };

        // Add any additional variables with sample values
        Array.from(this.variables).forEach((variable) => {
          if (!sampleData[variable]) {
            sampleData[variable] = `[${variable}]`;
          }
        });

        // Replace variables in HTML
        let processedHtml = html;
        Object.keys(sampleData).forEach((key) => {
          const regex = new RegExp(`\\{${key}\\}`, "g");
          processedHtml = processedHtml.replace(regex, sampleData[key]);
        });

        // Create complete HTML document
        const previewContent = `
<!DOCTYPE html>
<html>
<head>
    <style>${css}</style>
</head>
<body>
    ${
      processedHtml.includes("<body>")
        ? processedHtml
            .replace(/<!DOCTYPE html>[\s\S]*?<body[^>]*>/, "")
            .replace(/<\/body>[\s\S]*$/, "")
        : processedHtml
    }
</body>
</html>`;

        // Update preview frame
        const previewFrame = document.getElementById("previewFrame");
        previewFrame.srcdoc = previewContent;

        document.getElementById("previewStatus").textContent = "Updated";
        setTimeout(() => {
          document.getElementById("previewStatus").textContent = "Ready";
        }, 1000);
      } catch (error) {
        this.showError("Preview update failed: " + error.message);
      }
    }

    saveTemplate() {
      const templateName = document.getElementById("templateName").value.trim();
      if (!templateName) {
        this.showError("Please enter a template name");
        return;
      }

      const template = {
        name: templateName,
        html: document.getElementById("htmlEditor").value,
        css: document.getElementById("cssEditor").value,
        variables: Array.from(this.variables),
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      };

      this.templates[templateName] = template;
      localStorage.setItem("htmlTemplates", JSON.stringify(this.templates));

      this.showSuccess(`Template "${templateName}" saved successfully!`);
    }

    loadTemplate() {
      const templateNames = Object.keys(this.templates);
      if (templateNames.length === 0) {
        this.showError("No saved templates found");
        return;
      }

      const templateName = prompt(
        "Available templates:\n" +
          templateNames.join("\n") +
          "\n\nEnter template name to load:"
      );
      if (templateName && this.templates[templateName]) {
        const template = this.templates[templateName];

        document.getElementById("templateName").value = template.name;
        document.getElementById("htmlEditor").value = template.html;
        document.getElementById("cssEditor").value = template.css;

        this.variables = new Set(template.variables || []);
        this.renderVariables();
        this.updatePreview();

        this.showSuccess(`Template "${templateName}" loaded successfully!`);
      } else if (templateName) {
        this.showError("Template not found");
      }
    }

    exportTemplate() {
      const templateName = document.getElementById("templateName").value.trim();
      if (!templateName) {
        this.showError("Please enter a template name");
        return;
      }

      const exportData = {
        template: {
          name: templateName,
          html: document.getElementById("htmlEditor").value,
          css: document.getElementById("cssEditor").value,
          variables: Array.from(this.variables),
          created: new Date().toISOString(),
        },
        sampleData: this.generateSampleData(),
        usage: {
          description:
            "Use this template with the HTML Template Viewer component",
          instructions: [
            "1. Copy the template object to your OutSystems application",
            "2. Pass your data object to the viewer component",
            "3. The viewer will replace {variableName} with actual values",
          ],
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${templateName.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_template.json`;
      link.click();
      URL.revokeObjectURL(url);

      this.showSuccess("Template exported successfully!");
    }

    generateSampleData() {
      const sampleData = {};
      Array.from(this.variables).forEach((variable) => {
        sampleData[variable] = `Sample value for ${variable}`;
      });
      return sampleData;
    }

    showError(message) {
      const errorEl = document.getElementById("errorMessage");
      errorEl.textContent = message;
      errorEl.style.display = "block";
      setTimeout(() => {
        errorEl.style.display = "none";
      }, 5000);
    }

    showSuccess(message) {
      const successEl = document.getElementById("successMessage");
      successEl.textContent = message;
      successEl.style.display = "block";
      setTimeout(() => {
        successEl.style.display = "none";
      }, 3000);
    }
  }

  // Initialize when DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    new HTMLTemplateBuilder();
  });
})();
