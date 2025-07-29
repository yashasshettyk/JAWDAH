# OutSystems HTML Template Components Integration Guide

## Overview

This package provides two specialized components for OutSystems applications:

1. **HTML Template Builder** - Create and design HTML templates with dynamic variables
2. **HTML Template Viewer** - Display templates with real data from JSON objects

## Component 1: HTML Template Builder

### Purpose

- Create reusable HTML templates with variable placeholders
- Design templates with CSS styling
- Export templates for use in OutSystems applications
- Manage template library

### Key Features

- Visual HTML/CSS editor
- Variable management with `{variableName}` syntax
- Live preview with sample data
- Template save/load functionality
- Export to JSON format for OutSystems integration

### Usage in OutSystems

1. Use the Template Builder to create your HTML templates
2. Export the template as JSON
3. Store the template JSON in your OutSystems application (as Text attribute or Static Entity)
4. Use the Template Viewer component to render the template with real data

### File Structure

```
TemplateBuilder/
├── index.html              # Main HTML file
├── template-builder.js     # Core JavaScript functionality
└── README.md              # This documentation
```

### Integration Steps

1. **Create Template**: Use the builder to design your HTML template
2. **Add Variables**: Use `{variableName}` syntax for dynamic content
3. **Export Template**: Click "Export JSON" to get the template data
4. **Store in OutSystems**: Save the exported JSON in your application
5. **Use with Viewer**: Pass the template and data to the viewer component

## Component 2: HTML Template Viewer

### Purpose

- Render HTML templates with dynamic data
- Replace template variables with actual values from JSON
- Export rendered HTML
- Print functionality

### Key Features

- JSON data validation
- Variable detection and mapping
- Live rendering preview
- HTML export functionality
- Print support
- Sample templates included

### Usage in OutSystems

1. Pass the HTML template (from Template Builder or stored template)
2. Pass the JSON data object with variable values
3. The component will render the final HTML with data substituted
4. Export or print the rendered result

### File Structure

```
TemplateViewer/
├── index.html              # Main HTML file
├── template-viewer.js      # Core JavaScript functionality
└── README.md              # This documentation
```

### Integration Steps

1. **Load Template**: Provide the HTML template string
2. **Provide Data**: Supply JSON object with variable values
3. **Render**: Component automatically replaces variables with data
4. **Export/Print**: Use built-in export or print functionality

## OutSystems Integration

### Method 1: Web Block Integration

1. Create a Web Block in OutSystems
2. Add the HTML/CSS/JS from the components
3. Create Input Parameters for template and data
4. Use JavaScript to initialize the components

### Method 2: External URL Integration

1. Host the components on a web server
2. Use iframe or External URL widget in OutSystems
3. Pass parameters via URL query string or postMessage API

### Method 3: Direct Code Integration

1. Copy the HTML structure to OutSystems screens
2. Add the CSS to the screen or theme
3. Add the JavaScript as client actions or scripts
4. Modify to work with OutSystems data binding

## Data Flow Example

### Template Builder → OutSystems → Template Viewer

1. **Template Creation**:

```javascript
// Template Builder exports this JSON
{
  "template": {
    "name": "WelcomeEmail",
    "html": "<h1>Welcome {userName}!</h1><p>Email: {userEmail}</p>",
    "css": "h1 { color: blue; }",
    "variables": ["userName", "userEmail"]
  }
}
```

2. **OutSystems Data**:

```javascript
// Your OutSystems application provides this data
{
  "userName": "John Smith",
  "userEmail": "john.smith@company.com",
  "currentDate": "2024-01-15"
}
```

3. **Template Viewer Output**:

```html
<!-- Rendered result -->
<h1>Welcome John Smith!</h1>
<p>Email: john.smith@company.com</p>
```

## API Reference

### Template Builder Methods

```javascript
// Save template
templateBuilder.saveTemplate();

// Load template
templateBuilder.loadTemplate(templateName);

// Export template
templateBuilder.exportTemplate();

// Add variable
templateBuilder.addVariable(variableName);
```

### Template Viewer Methods

```javascript
// Set template
viewer.setTemplate(htmlTemplate);

// Set data
viewer.setData(jsonData);

// Render template
viewer.renderTemplate();

// Export HTML
viewer.exportHTML();

// Print template
viewer.printTemplate();
```

## Variable Syntax

### In Templates

Use curly braces to define variables:

```html
<h1>Hello {userName}!</h1>
<p>Today is {currentDate}</p>
<p>Your balance is {accountBalance}</p>
```

### In Data JSON

Provide corresponding values:

```json
{
  "userName": "Alice Johnson",
  "currentDate": "2024-01-15",
  "accountBalance": "$1,234.56"
}
```

## Sample Templates Included

### 1. Email Template

- Professional email layout
- Header, content, footer sections
- Call-to-action buttons
- Company branding areas

### 2. Invoice Template

- Business invoice format
- Item tables
- Totals calculation areas
- Company and client information

### 3. Report Template

- Executive summary
- Key metrics display
- Professional formatting
- Charts and data sections

### 4. Certificate Template

- Achievement certificates
- Formal design
- Signature areas
- Institution branding

## Customization

### Styling

- Modify CSS in the template builder
- Use CSS frameworks like Bootstrap
- Add custom fonts and colors
- Responsive design support

### Functionality

- Extend JavaScript for custom features
- Add validation rules
- Implement custom export formats
- Add integration with external APIs

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Security Considerations

- Sanitize HTML input to prevent XSS
- Validate JSON data
- Use Content Security Policy (CSP)
- Restrict file uploads if implementing

## Performance Tips

- Cache templates for reuse
- Minimize DOM manipulation
- Use efficient JSON parsing
- Optimize CSS for rendering speed

## Troubleshooting

### Common Issues

1. **Variables not replacing**: Check variable names match exactly
2. **CSS not applying**: Verify CSS syntax and selectors
3. **JSON parse errors**: Validate JSON format
4. **Export not working**: Check browser file download permissions

### Debug Mode

Enable console logging for debugging:

```javascript
// Add to components for debug information
console.log("Template variables:", variables);
console.log("Data provided:", data);
console.log("Rendered HTML:", renderedHTML);
```

## Support and Updates

- Check documentation for latest features
- Validate templates before production use
- Test with real OutSystems data
- Monitor browser console for errors

---

**Note**: These components are designed to be lightweight and easily integrated into OutSystems applications. They provide a complete solution for dynamic HTML template generation and rendering without requiring external dependencies beyond standard web technologies.
