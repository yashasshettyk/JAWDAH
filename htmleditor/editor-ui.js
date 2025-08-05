// CSS Styles for the editor
const editorStyles = `
  .editor-container {
    height: 400px;
  }
  .variable-mapping {
    max-height: 300px;
    overflow-y: auto;
  }
  .CodeMirror {
    height: 100%;
    font-family: "Consolas", "Monaco", "Courier New", monospace;
  }
  /* Fix line numbers overlapping with code */
  .CodeMirror-linenumber {
    padding: 0 8px 0 0;
    min-width: 20px;
    text-align: right;
    color: #767676;
    white-space: nowrap;
  }
  .CodeMirror-gutters {
    border-right: 1px solid #ddd;
    background-color: #f7f7f7;
    white-space: nowrap;
    min-width: 41px;
  }
  .CodeMirror-lines {
    padding: 4px 0;
  }
  .CodeMirror pre {
    padding: 0 4px;
    line-height: 1.5;
  }
  .nav-pills .nav-link.active {
    background-color: #0d6efd;
  }
`;

// Inject styles into the document
function injectStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = editorStyles;
  document.head.appendChild(styleElement);
}

// Function to create the complete editor HTML structure
function createEditorHTML(containerId) {
  return `
    <nav class="navbar navbar-dark bg-primary">
      <div class="container-fluid">
        <span class="navbar-brand mb-0 h1">
          <i class="bi bi-code-square"></i> OutSystems HTML + Babel Editor
        </span>
        <div class="d-flex">
          <button class="btn btn-success me-2" id="runBtn">
            <i class="bi bi-play-fill"></i> Run & Preview
          </button>
          <button class="btn btn-outline-light me-2" id="formatBtn">
            <i class="bi bi-code"></i> Format
          </button>
          <button class="btn btn-outline-light" id="helpBtn">
            <i class="bi bi-question-circle"></i> Help
          </button>
        </div>
      </div>
    </nav>

    <div class="container-fluid mt-3" id="main-editor-container">
      <div class="row">
        <!-- Main Panel - Editors (Full Width) -->
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <ul class="nav nav-pills card-header-pills" id="editorTabs" role="tablist">
                <li class="nav-item" role="presentation">
                  <button class="nav-link active" id="html-tab" data-bs-toggle="pill" data-bs-target="#html-panel" type="button" role="tab">
                    <i class="bi bi-filetype-html"></i> HTML
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" id="babel-tab" data-bs-toggle="pill" data-bs-target="#babel-panel" type="button" role="tab">
                    <i class="bi bi-filetype-js"></i> Babel JS
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" id="preview-tab" data-bs-toggle="pill" data-bs-target="#preview-panel" type="button" role="tab">
                    <i class="bi bi-eye"></i> Preview
                  </button>
                </li>
              </ul>
            </div>
            <div class="card-body p-0">
              <div class="tab-content" id="editorTabContent">
                <div class="tab-pane fade show active" id="html-panel" role="tabpanel">
                  <div class="editor-container">
                    <textarea id="htmlEditor" placeholder="Write your HTML here..."></textarea>
                  </div>
                </div>
                <div class="tab-pane fade" id="babel-panel" role="tabpanel">
                  <div class="editor-container">
                    <textarea id="babelEditor" placeholder="Write your Babel JavaScript here..."></textarea>
                  </div>
                </div>
                <div class="tab-pane fade" id="preview-panel" role="tabpanel">
                  <div class="editor-container">
                    <iframe id="previewFrame" class="w-100 h-100 border-0"></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Bottom Action Buttons -->
          <div class="d-flex gap-2 mt-3 justify-content-center">
            <button class="btn btn-outline-primary" id="variableMappingBtn" data-bs-toggle="collapse" data-bs-target="#variableMappingAccordion" aria-expanded="false">
              <i class="bi bi-diagram-3"></i> Variable Mapping
            </button>
            <button class="btn btn-outline-info" id="quickTipsBtn" data-bs-toggle="collapse" data-bs-target="#quickTipsAccordion" aria-expanded="false">
              <i class="bi bi-lightbulb"></i> Quick Tips
            </button>
            <button class="btn btn-outline-secondary" id="helpBtn2" data-bs-toggle="collapse" data-bs-target="#helpAccordion" aria-expanded="false">
              <i class="bi bi-question-circle"></i> Full Help
            </button>
          </div>
          
          <!-- Accordion Section -->
          <div class="mt-3">
            <!-- Variable Mapping Accordion -->
            <div class="collapse" id="variableMappingAccordion">
              <div class="card">
                <div class="card-header">
                  <h6 class="card-title mb-0">
                    <i class="bi bi-diagram-3"></i> OutSystems Variable Mapping
                  </h6>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <label for="outsystemsData" class="form-label">
                      OutSystems Data Object (JSON)
                    </label>
                    <textarea class="form-control" id="outsystemsData" rows="6" placeholder='{"user": {"name": "John", "age": 25}, "product": {"title": "Sample Product"}}'></textarea>
                  </div>
                  <button class="btn btn-primary btn-sm mb-3" id="parseDataBtn">
                    Parse Variables
                  </button>

                  <div class="variable-mapping">
                    <h6>Available Variables</h6>
                    <div id="variableList" class="list-group list-group-flush" style="max-height: 250px; overflow-y: auto;">
                      <div class="text-muted">
                        Parse JSON data to see available variables
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Quick Tips Accordion -->
            <div class="collapse" id="quickTipsAccordion">
              <div class="card">
                <div class="card-header">
                  <h6 class="card-title mb-0">
                    <i class="bi bi-lightbulb"></i> Quick Tips
                  </h6>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <p><strong>Variable Usage:</strong></p>
                      <p>• Use <code>{{variable.name}}</code> in HTML</p>
                      <p>• Access data via <code>window.outsystemsData</code> in JS</p>
                      <p>• Click variables to copy to clipboard</p>
                    </div>
                    <div class="col-md-6">
                      <p><strong>Keyboard Shortcuts:</strong></p>
                      <p>• <kbd>Ctrl+S</kbd> - Format current editor</p>
                      <p>• <kbd>Ctrl+Enter</kbd> - Run & Preview</p>
                      <p>• <kbd>F11</kbd> - Toggle fullscreen</p>
                    </div>
                  </div>
                  
                  <hr>
                  
                  <p><strong>Examples:</strong></p>
                  <div class="row">
                    <div class="col-md-6">
                      <div class="bg-light p-2 rounded mb-2">
                        <small><strong>HTML:</strong><br><code>{{user.name}} - {{product.title}}</code></small>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="bg-light p-2 rounded">
                        <small><strong>JavaScript:</strong><br><code>const name = window.outsystemsData.user.name;</code></small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Full Help Accordion -->
            <div class="collapse" id="helpAccordion">
              <div class="card">
                <div class="card-header">
                  <h6 class="card-title mb-0">
                    <i class="bi bi-info-circle"></i> Complete Usage Guide
                  </h6>
                </div>
                <div class="card-body" style="max-height: 400px; overflow-y: auto;">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-4">
                        <h6 class="text-primary">🚀 Getting Started</h6>
                        <p><strong>1. Setup:</strong> The editor auto-initializes on page load</p>
                        <p><strong>2. Multiple Instances:</strong> Use <code>window.createEditor('containerId')</code> for additional editors</p>
                        <p><strong>3. Access Editor:</strong> Use <code>window.getEditor('containerId')</code> to get specific instance</p>
                      </div>
                      
                      <div class="mb-4">
                        <h6 class="text-primary">📝 Editor Panels</h6>
                        <p><strong>HTML Panel:</strong> Write your HTML structure with variable placeholders</p>
                        <p><strong>Babel Panel:</strong> Write modern JavaScript (ES6+) that gets transpiled to ES5</p>
                        <p><strong>Preview Panel:</strong> Live preview of your compiled HTML + JS</p>
                      </div>
                      
                      <div class="mb-4">
                        <h6 class="text-primary">🔧 Variable Setup</h6>
                        <p><strong>Step 1:</strong> Enter JSON data in "OutSystems Data Object" textarea</p>
                        <p><strong>Step 2:</strong> Click "Parse Variables" to generate variable list</p>
                        <p><strong>Step 3:</strong> Click on variables to copy them to clipboard</p>
                      </div>
                    </div>
                    
                    <div class="col-md-6">
                      <div class="mb-4">
                        <h6 class="text-primary">💡 Variable Usage</h6>
                        <p><strong>In HTML:</strong></p>
                        <div class="bg-light p-2 rounded mb-2">
                          <code>{{user.name}} {{product.title}} {{data.items[0].value}}</code>
                        </div>
                        
                        <p><strong>In JavaScript:</strong></p>
                        <div class="bg-light p-2 rounded mb-2">
                          <code>const userName = window.outsystemsData.user.name;</code><br>
                          <code>const items = window.outsystemsData.data.items;</code>
                        </div>
                        
                        <p><strong>Example JSON:</strong></p>
                        <div class="bg-light p-2 rounded">
                          <code>
                          {<br>
                          &nbsp;&nbsp;"user": {"name": "John", "age": 25},<br>
                          &nbsp;&nbsp;"product": {"title": "Sample", "price": 99},<br>
                          &nbsp;&nbsp;"items": [{"id": 1, "name": "Item 1"}]<br>
                          }
                          </code>
                        </div>
                      </div>
                      
                      <div class="mb-4">
                        <h6 class="text-primary">⌨️ Keyboard Shortcuts</h6>
                        <ul>
                          <li><strong>Ctrl+S:</strong> Format current editor</li>
                          <li><strong>Ctrl+Enter:</strong> Run & Preview</li>
                          <li><strong>F11:</strong> Toggle fullscreen</li>
                        </ul>
                      </div>
                      
                      <div class="mb-4">
                        <h6 class="text-primary">🔄 API Methods</h6>
                        <ul>
                          <li><strong>Get Config:</strong> <code>window.getEditorConfigs()</code></li>
                          <li><strong>Set Config:</strong> <code>window.setEditorConfigs(config)</code></li>
                          <li><strong>Create Editor:</strong> <code>window.createEditor('id', config)</code></li>
                        </ul>
                      </div>
                      
                      <div class="alert alert-warning">
                        <h6 class="text-primary">⚠️ Important Notes</h6>
                        <ul class="mb-0">
                          <li>Variables are case-sensitive</li>
                          <li>Use dot notation for nested objects</li>
                          <li>Array access: <code>{{items[0].property}}</code></li>
                          <li>All data is available via <code>window.outsystemsData</code></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Function to setup accordion event listeners
function setupAccordionListeners(container) {
  const accordionButtons = container.querySelectorAll('[data-bs-toggle="collapse"]');
  accordionButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-bs-target');
      const allAccordions = container.querySelectorAll('.collapse');
      
      allAccordions.forEach(accordion => {
        if (`#${accordion.id}` !== targetId) {
          const bsCollapse = bootstrap.Collapse.getInstance(accordion);
          if (bsCollapse) {
            bsCollapse.hide();
          }
        }
      });
    });
  });
}

// Export functions for use by editor-core.js
window.EditorUI = {
  injectStyles,
  createEditorHTML,
  setupAccordionListeners
};
  