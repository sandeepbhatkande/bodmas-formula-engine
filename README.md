# BODMAS Formula Engine

A powerful React component for building mathematical formulas with visual interface, real-time validation, and comprehensive function library.

## 🚀 Live Demo

**[Try the Interactive Demo →](https://sandeepbhatkande.github.io/bodmas-formula-engine)**

### Quick Examples
- **[Basic Usage](https://codesandbox.io/s/bodmas-basic-usage)** - Simple integration
- **[Custom Functions](https://codesandbox.io/s/bodmas-custom-functions)** - Business logic functions  
- **[E-commerce Calculator](https://codesandbox.io/s/bodmas-ecommerce)** - Real-world pricing calculator

## ✨ Features

- 🎯 **Visual Formula Builder** - Drag-and-drop interface
- ⚡ **Real-time Validation** - Instant feedback
- 🧮 **70+ Built-in Functions** - Math, String, Date, Financial, Statistical
- 🎨 **Material-UI Integration** - Beautiful, responsive design
- 🔧 **Extensible** - Custom functions and variables
- 📱 **Mobile Friendly** - Works on all devices
- 🎪 **Monaco Editor** - Professional code editor with syntax highlighting

## 📦 Installation

```bash
npm install bodmas-formula-engine
```

Install peer dependencies:
```bash
npm install react react-dom @mui/material @emotion/react @emotion/styled @mui/icons-material @mui/lab
```

## 🎮 Quick Start

```jsx
import React, { useState } from 'react';
import { FormulaBuilder } from 'bodmas-formula-engine';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme();

function App() {
  const [formula, setFormula] = useState('');
  const variables = { 
    price: 100, 
    quantity: 5, 
    discount: 0.1 
  };

  const handleFormulaChange = (newFormula, validation) => {
    setFormula(newFormula);
    if (validation.valid) {
      console.log('Result:', validation.result);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FormulaBuilder
        initialFormula={formula}
        onFormulaChange={handleFormulaChange}
        variables={variables}
      />
    </ThemeProvider>
  );
}

export default App;
```

## 🎯 Use Cases

- **E-commerce**: Dynamic pricing calculators
- **Finance**: Investment and loan calculators  
- **Analytics**: Custom metric calculations
- **Business Rules**: Complex business logic
- **Reporting**: Dynamic report formulas
- **Configuration**: User-defined calculations

## 📚 Examples

Explore comprehensive examples in the `/examples` directory:

### [Basic Usage](./examples/basic-usage)
```jsx
// Simple price calculation
price * quantity * (1 - discount)
```

### [Custom Functions](./examples/custom-functions)
```jsx
// Business logic functions
DISCOUNT(price, customerType) + LOYALTY_BONUS(points)
```

### [E-commerce Calculator](./examples/ecommerce-calculator)
```jsx
// Complex pricing with multiple factors
(basePrice * quantity * SEASONAL_MULTIPLIER(period) * (1 - TIER_DISCOUNT(tier))) +
SHIPPING_COST(weight, destination) - COUPON_DISCOUNT(code, orderValue)
```

## 🔧 Advanced Usage

### Custom Functions
```jsx
const customFunctions = {
  DISCOUNT: {
    name: 'DISCOUNT',
    description: 'Calculate discount based on customer type',
    execute: (amount, customerType) => {
      const rates = { VIP: 0.2, REGULAR: 0.1 };
      return amount * (rates[customerType] || 0);
    }
  }
};

<FormulaBuilder customFunctions={customFunctions} />
```

### Custom Variables
```jsx
const CustomVariablePanel = ({ onVariableSelect }) => (
  <div>
    <button onClick={() => onVariableSelect('customVar')}>
      Custom Variable
    </button>
  </div>
);

<FormulaBuilder 
  CustomVariableComponent={CustomVariablePanel}
  variables={{ customVar: 42 }}
/>
```

## 🎨 Theming

```jsx
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' }
  }
});

<ThemeProvider theme={theme}>
  <FormulaBuilder />
</ThemeProvider>
```

## 📖 API Reference

### FormulaBuilder Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialFormula` | `string` | `''` | Initial formula value |
| `onFormulaChange` | `function` | - | Callback when formula changes |
| `variables` | `object` | `{}` | Available variables |
| `customFunctions` | `object` | `{}` | Custom function definitions |
| `CustomVariableComponent` | `component` | - | Custom variable panel |
| `readOnly` | `boolean` | `false` | Read-only mode |
| `showValidation` | `boolean` | `true` | Show validation panel |
| `showPreview` | `boolean` | `true` | Show preview panel |

### Built-in Functions

#### Mathematical
`ABS`, `CEIL`, `FLOOR`, `ROUND`, `SQRT`, `POW`, `LOG`, `EXP`, `SIN`, `COS`, `TAN`, `MIN`, `MAX`, `SUM`, `AVERAGE`

#### String Functions  
`CONCAT`, `LEFT`, `RIGHT`, `MID`, `LEN`, `UPPER`, `LOWER`, `TRIM`, `REPLACE`, `FIND`

#### Date Functions
`NOW`, `TODAY`, `YEAR`, `MONTH`, `DAY`, `WEEKDAY`, `DATEDIFF`, `DATEADD`

#### Logical Functions
`IF`, `AND`, `OR`, `NOT`, `ISBLANK`, `ISNUMBER`, `ISTEXT`

#### Financial Functions
`PV`, `FV`, `PMT`, `RATE`, `NPER`, `NPV`, `IRR`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT © [Sandeep Bhatkande](https://github.com/sandeepbhatkande)

## 🔗 Links

- [GitHub Repository](https://github.com/sandeepbhatkande/bodmas-formula-engine)
- [Live Demo](https://sandeepbhatkande.github.io/bodmas-formula-engine)
- [npm Package](https://www.npmjs.com/package/bodmas-formula-engine)
- [Issues](https://github.com/sandeepbhatkande/bodmas-formula-engine/issues)

---

**Made with ❤️ for the React community**
