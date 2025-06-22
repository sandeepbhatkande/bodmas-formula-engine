# Custom Variables Feature

The FormulaBuilder now supports custom variables functionality, allowing you to:

1. **Provide custom variables** that can override default variables
2. **Replace the default variable panel** with your own custom component

## Usage

### Basic Custom Variables

```jsx
import FormulaBuilder from './components/FormulaBuilder';

const customVariables = {
  // These will be merged with default variables
  apiKey: 'abc123',
  maxRetries: 3,
  // This will override any default variable with the same name
  taxRate: 0.15
};

<FormulaBuilder
  variables={defaultVariables}
  customVariables={customVariables}
  customFunctions={customFunctions}
  onFormulaChange={handleFormulaChange}
/>
```

### Custom Variable Panel Component

You can replace the entire variable panel with your own component:

```jsx
import CustomVariablePanel from './components/CustomVariablePanel';

<FormulaBuilder
  variables={defaultVariables}
  customVariables={customVariables}
  customVariableComponent={CustomVariablePanel}
  customFunctions={customFunctions}
  onFormulaChange={handleFormulaChange}
/>
```

## Custom Variable Component Props

When creating a custom variable component, it will receive these props:

- `variables`: Object containing all variables (merged default + custom)
- `onVariableInsert`: Function to call when user wants to insert a variable
- `onFunctionInsert`: Function to call when user wants to insert a function
- `engine`: The formula engine instance for accessing functions

## Example Custom Component

```jsx
const MyCustomVariablePanel = ({ 
  variables, 
  onVariableInsert, 
  onFunctionInsert, 
  engine 
}) => {
  return (
    <div>
      <h3>My Custom Variables</h3>
      {Object.entries(variables).map(([name, value]) => (
        <button 
          key={name}
          onClick={() => onVariableInsert(name)}
        >
          {name}: {JSON.stringify(value)}
        </button>
      ))}
    </div>
  );
};
```

## Variable Precedence

Custom variables take precedence over default variables:

```jsx
const defaultVariables = { taxRate: 0.08, price: 100 };
const customVariables = { taxRate: 0.12, discount: 0.1 };

// Final variables will be:
// { taxRate: 0.12, price: 100, discount: 0.1 }
```

## Features

- **Type Safety**: Variables maintain their original types
- **Search & Filter**: Built-in search functionality in default panel
- **Categorization**: Variables are grouped by type
- **Visual Indicators**: Different colors for custom vs default variables
- **Integration**: Seamless integration with existing formula engine 