# BODMAS Formula Builder

A powerful React component for building mathematical formulas with visual interface, real-time validation, and comprehensive function library. Perfect for creating Excel-like formula builders in your React applications.

## ✨ Features

- **Visual Formula Construction**: Build formulas through drag-and-drop, clickable buttons, or direct text input
- **Real-time Validation**: Instant syntax checking with helpful error messages
- **BODMAS Compliance**: Automatic operator precedence handling
- **Syntax Highlighting**: Monaco Editor integration with custom formula language support
- **Autocomplete**: Intelligent function and parameter suggestions
- **70+ Built-in Functions**: String, Math, Statistical, Logical, Date, and Financial functions
- **Custom Variables**: Define and use custom variables in formulas
- **Material-UI Integration**: Modern, responsive design with theme support
- **TypeScript Ready**: Full TypeScript support (coming soon)

## 🚀 Installation

```bash
npm install bodmas-formula-engine
```

or

```bash
yarn add bodmas-formula-engine
```

## 📖 Quick Start

### Basic Usage

```jsx
import React, { useState } from 'react';
import { FormulaBuilder } from 'bodmas-formula-engine';

function App() {
  const [formula, setFormula] = useState('');
  const [variables] = useState({
    price: 100,
    quantity: 5,
    discount: 0.1,
    taxRate: 0.08
  });

  const handleFormulaChange = (newFormula, validation) => {
    setFormula(newFormula);
    console.log('Formula is valid:', validation.valid);
    if (validation.valid) {
      console.log('Result:', validation.result);
    }
  };

  return (
    <FormulaBuilder
      initialFormula={formula}
      onFormulaChange={handleFormulaChange}
      variables={variables}
    />
  );
}
```

### Advanced Usage with Custom Functions

```jsx
import React, { useState } from 'react';
import { FormulaBuilder } from 'bodmas-formula-engine';

function App() {
  const [formula, setFormula] = useState('');
  const [variables] = useState({
    price: 100,
    quantity: 5,
    customerType: 'VIP'
  });

  const customFunctions = {
    DISCOUNT: {
      name: 'DISCOUNT',
      description: 'Calculate discount based on customer type',
      category: 'Custom',
      syntax: 'DISCOUNT(amount, customerType)',
      examples: ['DISCOUNT(100, "VIP")'],
      execute: (amount, customerType) => {
        const discountRates = { VIP: 0.2, REGULAR: 0.1, NEW: 0.05 };
        return amount * (discountRates[customerType] || 0);
      }
    }
  };

  return (
    <FormulaBuilder
      initialFormula={formula}
      onFormulaChange={(formula, validation) => {
        setFormula(formula);
        console.log('Result:', validation.result);
      }}
      variables={variables}
      customFunctions={customFunctions}
    />
  );
}
```

## 🔧 Props

### FormulaBuilder Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialFormula` | `string` | `''` | Initial formula to display |
| `onFormulaChange` | `function` | - | Callback when formula changes `(formula, validation) => void` |
| `variables` | `object` | `{}` | Variables available in formulas |
| `customFunctions` | `object` | `{}` | Custom functions to add |
| `customVariables` | `object` | `{}` | Additional variables (merged with variables) |
| `customVariableComponent` | `ReactNode` | - | Custom variable panel component |
| `theme` | `'light' \| 'dark'` | `'light'` | Theme for the editor |
| `height` | `string \| number` | `400` | Height of the formula builder |
| `disabled` | `boolean` | `false` | Disable the formula builder |
| `showPreview` | `boolean` | `true` | Show the preview panel |
| `showValidation` | `boolean` | `true` | Show validation messages |

### Validation Object

The `onFormulaChange` callback receives a validation object with:

```javascript
{
  valid: boolean,           // Whether the formula is valid
  result: any,             // Calculated result (if valid)
  error: string,           // Error message (if invalid)
  suggestions: string[]    // Suggestions for fixing errors
}
```

## 📚 Built-in Functions

### Math Functions (22)
- `SUM`, `AVERAGE`, `MIN`, `MAX`, `COUNT`
- `ROUND`, `CEIL`, `FLOOR`, `ABS`, `SQRT`
- `POWER`, `MOD`, `RANDOM`, `RANDBETWEEN`
- `SIN`, `COS`, `TAN`, `LOG`, `LN`, `EXP`
- `PI`, `E`

### String Functions (12)
- `CONCAT`, `LEFT`, `RIGHT`, `MID`, `LEN`
- `UPPER`, `LOWER`, `TRIM`, `REPLACE`
- `SUBSTITUTE`, `FIND`, `SEARCH`

### Logical Functions (10)
- `IF`, `AND`, `OR`, `NOT`, `XOR`
- `ISNUMBER`, `ISTEXT`, `ISBLANK`, `ISERROR`
- `CHOOSE`

### Date Functions (13)
- `NOW`, `TODAY`, `YEAR`, `MONTH`, `DAY`
- `HOUR`, `MINUTE`, `SECOND`, `WEEKDAY`
- `DATEDIF`, `DATEADD`, `DATEVALUE`, `TIMEVALUE`

### Statistical Functions (6)
- `STDEV`, `VAR`, `MEDIAN`, `MODE`
- `PERCENTILE`, `QUARTILE`

### Financial Functions (6)
- `PMT`, `PV`, `FV`, `RATE`, `NPER`, `NPV`

## 🎯 Examples

### Basic Calculations
```javascript
2 + 3 * 4                    // Result: 14
ROUND(3.14159, 2)            // Result: 3.14
MAX(10, 20, 5)               // Result: 20
```

### String Operations
```javascript
CONCAT("Hello ", "World")     // Result: "Hello World"
UPPER("hello")               // Result: "HELLO"
LEFT("Hello World", 5)       // Result: "Hello"
```

### Conditional Logic
```javascript
IF(price > 100, "Expensive", "Affordable")
AND(quantity > 5, price < 50)
```

### Date Functions
```javascript
YEAR(NOW())                  // Current year
DATEDIF("2023-01-01", "2023-12-31", "D")  // Days between dates
```

### Complex Formulas
```javascript
// Calculate total with discount and tax
price * quantity * (1 - discount) * (1 + taxRate)

// Conditional pricing
IF(quantity >= 10, price * 0.9, IF(quantity >= 5, price * 0.95, price))
```

## 🎨 Customization

### Custom Variable Panel

```jsx
import { CustomVariablePanel } from 'bodmas-formula-engine';

function MyCustomPanel({ variables, onVariableInsert }) {
  return (
    <div>
      <h3>My Variables</h3>
      {Object.entries(variables).map(([name, value]) => (
        <button key={name} onClick={() => onVariableInsert(name)}>
          {name}: {value}
        </button>
      ))}
    </div>
  );
}

// Use in FormulaBuilder
<FormulaBuilder
  customVariableComponent={<MyCustomPanel />}
  // ... other props
/>
```

### Custom Functions

```jsx
const customFunctions = {
  CUSTOM_CALC: {
    name: 'CUSTOM_CALC',
    description: 'Custom calculation function',
    category: 'Custom',
    syntax: 'CUSTOM_CALC(value1, value2)',
    examples: ['CUSTOM_CALC(10, 20)'],
    execute: (val1, val2) => {
      // Your custom logic here
      return val1 * val2 + 10;
    }
  }
};
```

## 🔧 Requirements

- React >= 18.0.0
- React DOM >= 18.0.0

## 📝 License

MIT © [Sandeep Bhatkande](https://github.com/sandeepbhatkande)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you have any questions or need help, please open an issue on [GitHub](https://github.com/sandeepbhatkande/bodmas-formula-engine/issues).
