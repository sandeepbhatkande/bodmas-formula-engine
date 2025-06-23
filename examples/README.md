# BODMAS Formula Engine Examples

This directory contains various examples demonstrating how to use the `bodmas-formula-engine` package in different scenarios.

## Quick Start

First, install the package:

```bash
npm install bodmas-formula-engine
```

Make sure you have the peer dependencies installed:

```bash
npm install react react-dom @mui/material @emotion/react @emotion/styled @mui/icons-material @mui/lab
```

## Examples

### 1. [Basic Usage](./basic-usage)
Simple integration with minimal configuration.

### 2. [Custom Variables](./custom-variables)
How to provide custom variables and create a custom variable panel.

### 3. [Custom Functions](./custom-functions)
Adding your own custom functions to the formula engine.

### 4. [Advanced Integration](./advanced-integration)
Complete integration with form handling, validation, and data persistence.

### 5. [Theme Customization](./theme-customization)
Customizing the appearance and theme of the formula builder.

### 6. [E-commerce Calculator](./ecommerce-calculator)
Real-world example: Building a pricing calculator for an e-commerce platform.

### 7. [Financial Calculator](./financial-calculator)
Real-world example: Creating financial calculations with built-in financial functions.

## Running Examples

Each example is a standalone React application. To run any example:

```bash
cd examples/[example-name]
npm install
npm start
```

## Integration Tips

### Required Peer Dependencies

The formula builder requires these peer dependencies to be installed in your project:

```json
{
  "react": ">=18.0.0",
  "react-dom": ">=18.0.0",
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.0",
  "@mui/material": "^7.1.2",
  "@mui/icons-material": "^7.1.2",
  "@mui/lab": "^7.0.0-beta.14"
}
```

### Theme Provider Setup

Wrap your app with MUI's ThemeProvider:

```jsx
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### TypeScript Support

TypeScript definitions will be available in a future release. For now, you can create your own type definitions or use the package with JavaScript.

## Contributing

Found an issue with an example or want to add a new one? Please open an issue or submit a pull request! 