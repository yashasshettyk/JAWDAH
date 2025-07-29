(function () {
  "use strict";

  class HTMLTemplateViewer {
    constructor() {
      this.currentTemplate = "";
      this.currentData = {};
      this.variables = new Set();
      this.sampleTemplates = this.getSampleTemplates();
      this.init();
    }

    init() {
      this.setupEventListeners();
      this.extractVariables();
      this.loadSampleData();
    }

    setupEventListeners() {
      // Main action buttons
      document
        .getElementById("renderBtn")
        .addEventListener("click", () => this.renderTemplate());
      document
        .getElementById("exportHtmlBtn")
        .addEventListener("click", () => this.exportHTML());
      document
        .getElementById("printBtn")
        .addEventListener("click", () => this.printTemplate());

      // Control buttons
      document
        .getElementById("validateBtn")
        .addEventListener("click", () => this.validateJSON());
      document
        .getElementById("sampleBtn")
        .addEventListener("click", () => this.loadSampleData());

      // Template and data input changes
      document.getElementById("templateInput").addEventListener("input", () => {
        this.extractVariables();
        this.renderTemplate();
      });

      document.getElementById("dataInput").addEventListener("input", () => {
        this.validateAndRender();
      });

      // Sample template selection
      document
        .getElementById("sampleTemplates")
        .addEventListener("click", (e) => {
          const templateItem = e.target.closest(".template-item");
          if (templateItem) {
            this.loadSampleTemplate(templateItem.dataset.template);
          }
        });
    }

    extractVariables() {
      const template = document.getElementById("templateInput").value;
      const variablePattern = /\{([^}]+)\}/g;
      let match;

      this.variables.clear();
      while ((match = variablePattern.exec(template)) !== null) {
        this.variables.add(match[1]);
      }

      this.updateVariableDisplay();
    }

    updateVariableDisplay() {
      const variableTags = document.getElementById("variableTags");
      const variableCount = document.getElementById("variableCount");

      variableTags.innerHTML = "";
      Array.from(this.variables)
        .sort()
        .forEach((variable) => {
          const tag = document.createElement("span");
          tag.className = "variable-tag";
          tag.textContent = variable;
          variableTags.appendChild(tag);
        });

      variableCount.textContent = `Variables: ${this.variables.size}`;
    }

    validateJSON() {
      try {
        const jsonText = document.getElementById("dataInput").value.trim();
        if (!jsonText) {
          this.showError("Please enter JSON data");
          return false;
        }

        const data = JSON.parse(jsonText);
        this.currentData = data;
        this.showSuccess("JSON is valid!");
        return true;
      } catch (error) {
        this.showError("Invalid JSON: " + error.message);
        return false;
      }
    }

    validateAndRender() {
      if (this.validateJSON()) {
        this.renderTemplate();
      }
    }

    renderTemplate() {
      try {
        this.hideMessages();

        const template = document.getElementById("templateInput").value;
        const jsonText = document.getElementById("dataInput").value.trim();

        if (!template.trim()) {
          this.showError("Please enter an HTML template");
          return;
        }

        let data = {};
        if (jsonText) {
          try {
            data = JSON.parse(jsonText);
          } catch (error) {
            this.showError("Invalid JSON data: " + error.message);
            return;
          }
        }

        // Replace variables in template
        let renderedHTML = template;
        Object.keys(data).forEach((key) => {
          const regex = new RegExp(`\\{${key}\\}`, "g");
          renderedHTML = renderedHTML.replace(regex, data[key]);
        });

        // Check for unreplaced variables
        const unreplacedVars = [];
        Array.from(this.variables).forEach((variable) => {
          if (!(variable in data)) {
            unreplacedVars.push(variable);
          }
        });

        // Replace unreplaced variables with placeholder
        unreplacedVars.forEach((variable) => {
          const regex = new RegExp(`\\{${variable}\\}`, "g");
          renderedHTML = renderedHTML.replace(regex, `[${variable}]`);
        });

        // Update render frame
        const renderFrame = document.getElementById("renderFrame");
        renderFrame.srcdoc = renderedHTML;

        // Update status
        document.getElementById("renderStatus").textContent =
          "Rendered successfully";
        document.getElementById("statusText").textContent =
          unreplacedVars.length > 0
            ? `Warning: ${unreplacedVars.length} variables missing data`
            : "All variables resolved";

        if (unreplacedVars.length > 0) {
          this.showError(
            `Missing data for variables: ${unreplacedVars.join(", ")}`
          );
        } else {
          this.showSuccess("Template rendered successfully!");
        }
      } catch (error) {
        this.showError("Render failed: " + error.message);
        document.getElementById("renderStatus").textContent = "Render failed";
      }
    }

    exportHTML() {
      try {
        const template = document.getElementById("templateInput").value;
        const jsonText = document.getElementById("dataInput").value.trim();

        if (!template.trim()) {
          this.showError("Please enter an HTML template");
          return;
        }

        let data = {};
        if (jsonText) {
          data = JSON.parse(jsonText);
        }

        // Replace variables
        let exportHTML = template;
        Object.keys(data).forEach((key) => {
          const regex = new RegExp(`\\{${key}\\}`, "g");
          exportHTML = exportHTML.replace(regex, data[key]);
        });

        // Create and download file
        const blob = new Blob([exportHTML], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `rendered_template_${new Date()
          .toISOString()
          .slice(0, 10)}.html`;
        link.click();
        URL.revokeObjectURL(url);

        this.showSuccess("HTML exported successfully!");
      } catch (error) {
        this.showError("Export failed: " + error.message);
      }
    }

    printTemplate() {
      const renderFrame = document.getElementById("renderFrame");
      if (renderFrame.contentWindow) {
        renderFrame.contentWindow.print();
      } else {
        this.showError("Nothing to print. Please render the template first.");
      }
    }

    loadSampleData() {
      const sampleData = {
        title: "Sample Document",
        userName: "John Doe",
        userEmail: "john.doe@example.com",
        currentDate: new Date().toLocaleDateString(),
        contentTitle: "Welcome Message",
        contentBody:
          "This is a sample content body to demonstrate the template rendering functionality.",
        companyName: "Acme Corporation",
        amount: "$1,234.56",
        invoiceNumber: "INV-2024-001",
        dueDate: "2024-02-15",
      };

      document.getElementById("dataInput").value = JSON.stringify(
        sampleData,
        null,
        2
      );
      this.validateAndRender();
    }

    loadSampleTemplate(templateType) {
      // Remove active class from all templates
      document.querySelectorAll(".template-item").forEach((item) => {
        item.classList.remove("active");
      });

      // Add active class to selected template
      document
        .querySelector(`[data-template="${templateType}"]`)
        .classList.add("active");

      const template = this.sampleTemplates[templateType];
      if (template) {
        document.getElementById("templateInput").value = template.html;
        document.getElementById("dataInput").value = JSON.stringify(
          template.sampleData,
          null,
          2
        );
        this.extractVariables();
        this.renderTemplate();
      }
    }

    getSampleTemplates() {
      return {
        email: {
          html: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; background: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: white; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; line-height: 1.6; }
        .footer { background: #f8f9fa; padding: 15px; text-align: center; color: #666; }
        .button { background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{emailSubject}</h1>
        </div>
        <div class="content">
            <p>Dear {recipientName},</p>
            <p>{emailBody}</p>
            <p style="text-align: center;">
                <a href="{actionLink}" class="button">{actionText}</a>
            </p>
            <p>Best regards,<br>{senderName}</p>
        </div>
        <div class="footer">
            <p>{companyName} | {companyAddress}</p>
        </div>
    </div>
</body>
</html>`,
          sampleData: {
            emailSubject: "Welcome to Our Service",
            recipientName: "John Smith",
            emailBody:
              "Thank you for joining our platform. We're excited to have you on board!",
            actionLink: "https://example.com/activate",
            actionText: "Activate Account",
            senderName: "Customer Support Team",
            companyName: "Acme Corporation",
            companyAddress: "123 Business St, City, State 12345",
          },
        },
        invoice: {
          html: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .invoice-details { background: #f8f9fa; padding: 15px; margin: 20px 0; }
        .items table { width: 100%; border-collapse: collapse; }
        .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .items th { background: #007bff; color: white; }
        .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>{companyName}</h1>
            <p>{companyAddress}</p>
        </div>
        <div>
            <h2>INVOICE</h2>
            <p>Invoice #: {invoiceNumber}</p>
            <p>Date: {invoiceDate}</p>
        </div>
    </div>
    
    <div class="invoice-details">
        <h3>Bill To:</h3>
        <p>{clientName}<br>{clientAddress}</p>
    </div>
    
    <div class="items">
        <table>
            <tr><th>Description</th><th>Quantity</th><th>Rate</th><th>Amount</th></tr>
            <tr><td>{itemDescription}</td><td>{itemQuantity}</td><td>{itemRate}</td><td>{itemAmount}</td></tr>
        </table>
    </div>
    
    <div class="total">
        Total: {totalAmount}
    </div>
</body>
</html>`,
          sampleData: {
            companyName: "Acme Services Ltd",
            companyAddress: "123 Business Street, City, State 12345",
            invoiceNumber: "INV-2024-001",
            invoiceDate: "2024-01-15",
            clientName: "ABC Company",
            clientAddress: "456 Client Ave, City, State 67890",
            itemDescription: "Web Development Services",
            itemQuantity: "1",
            itemRate: "$2,500.00",
            itemAmount: "$2,500.00",
            totalAmount: "$2,500.00",
          },
        },
        report: {
          html: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin: 30px 0; }
        .metric { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #007bff; }
        .metric h4 { margin: 0 0 10px 0; color: #007bff; }
        .footer { text-align: center; margin-top: 50px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{reportTitle}</h1>
        <p>Generated on {reportDate} by {reportAuthor}</p>
    </div>
    
    <div class="section">
        <h2>Executive Summary</h2>
        <p>{executiveSummary}</p>
    </div>
    
    <div class="section">
        <h2>Key Metrics</h2>
        <div class="metric">
            <h4>Revenue</h4>
            <p>{revenue}</p>
        </div>
        <div class="metric">
            <h4>Growth Rate</h4>
            <p>{growthRate}</p>
        </div>
        <div class="metric">
            <h4>Customer Satisfaction</h4>
            <p>{satisfaction}</p>
        </div>
    </div>
    
    <div class="footer">
        <p>Confidential - {companyName}</p>
    </div>
</body>
</html>`,
          sampleData: {
            reportTitle: "Q1 2024 Performance Report",
            reportDate: "2024-01-31",
            reportAuthor: "Analytics Team",
            executiveSummary:
              "This quarter showed strong performance across all key metrics with significant growth in revenue and customer satisfaction.",
            revenue: "$1.2M (+15% from previous quarter)",
            growthRate: "15% quarter-over-quarter",
            satisfaction: "92% (exceeds target of 90%)",
            companyName: "Acme Corporation",
          },
        },
        certificate: {
          html: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Times New Roman', serif; margin: 0; padding: 40px; background: #f9f9f9; }
        .certificate { background: white; border: 8px solid #gold; padding: 60px; text-align: center; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .title { font-size: 48px; color: #d4af37; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px; }
        .subtitle { font-size: 24px; color: #333; margin-bottom: 40px; }
        .recipient { font-size: 36px; color: #d4af37; margin: 30px 0; font-weight: bold; text-decoration: underline; }
        .achievement { font-size: 20px; margin: 30px 0; line-height: 1.6; }
        .date-location { margin-top: 50px; display: flex; justify-content: space-between; }
        .signature-line { border-top: 2px solid #333; width: 200px; text-align: center; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="certificate">
        <h1 class="title">Certificate of {certificateType}</h1>
        <p class="subtitle">This certifies that</p>
        <div class="recipient">{recipientName}</div>
        <div class="achievement">
            has successfully {achievement} in {courseName}
            <br>with a score of {score}
        </div>
        <div class="date-location">
            <div>
                <div class="signature-line">{instructorName}</div>
                <p>Instructor</p>
            </div>
            <div>
                <p>Date: {completionDate}</p>
                <p>{institutionName}</p>
            </div>
        </div>
    </div>
</body>
</html>`,
          sampleData: {
            certificateType: "Completion",
            recipientName: "John Smith",
            achievement: "completed the requirements",
            courseName: "Advanced Web Development",
            score: "95%",
            instructorName: "Dr. Jane Wilson",
            completionDate: "January 15, 2024",
            institutionName: "Tech Academy",
          },
        },
      };
    }

    showError(message) {
      const errorEl = document.getElementById("errorDisplay");
      errorEl.textContent = message;
      errorEl.style.display = "block";
      setTimeout(() => {
        errorEl.style.display = "none";
      }, 5000);
    }

    showSuccess(message) {
      const successEl = document.getElementById("successDisplay");
      successEl.textContent = message;
      successEl.style.display = "block";
      setTimeout(() => {
        successEl.style.display = "none";
      }, 3000);
    }

    hideMessages() {
      document.getElementById("errorDisplay").style.display = "none";
      document.getElementById("successDisplay").style.display = "none";
    }
  }

  // Initialize when DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    new HTMLTemplateViewer();
  });
})();
