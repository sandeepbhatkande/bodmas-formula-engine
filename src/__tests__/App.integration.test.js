import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock the FormulaBuilder component
jest.mock('../components/FormulaBuilder', () => {
  return function MockFormulaBuilder({ 
    initialFormula, 
    onFormulaChange, 
    variables, 
    customVariables,
    customFunctions,
    customVariableComponent
  }) {
    const [formula, setFormula] = React.useState(initialFormula || '');
    
    const handleFormulaChange = (newFormula) => {
      setFormula(newFormula);
      onFormulaChange?.(newFormula, { valid: true });
    };

    // Merge variables like the real component
    const allVariables = { ...variables, ...customVariables };

    return (
      <div data-testid="formula-builder">
        <div data-testid="formula-display">{formula}</div>
        <input
          data-testid="formula-input"
          value={formula}
          onChange={(e) => handleFormulaChange(e.target.value)}
          placeholder="Enter formula"
        />
        <div data-testid="variables-count">
          Variables: {Object.keys(variables || {}).length}
        </div>
        <div data-testid="all-variables-count">
          All Variables: {Object.keys(allVariables || {}).length}
        </div>
        <div data-testid="custom-functions-count">
          Functions: {Object.keys(customFunctions || {}).length}
        </div>
        {customVariableComponent && (
          <div data-testid="custom-variable-panel">Custom Variable Panel Active</div>
        )}
        <button 
          data-testid="insert-variable-btn"
          onClick={() => {/* Mock insert */}}
        >
          Insert Variable
        </button>
      </div>
    );
  };
});

// Mock CustomVariablePanel
jest.mock('../components/CustomVariablePanel', () => {
  return function MockCustomVariablePanel({ variables, onVariableInsert }) {
    return (
      <div data-testid="custom-variable-panel-component">
        <div data-testid="panel-variables-count">
          Panel Variables: {Object.keys(variables || {}).length}
        </div>
        <button 
          data-testid="panel-insert-btn"
          onClick={() => onVariableInsert?.('panelVar')}
        >
          Insert from Panel
        </button>
      </div>
    );
  };
});

describe('App Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('should render main components', () => {
      render(<App />);
      
      expect(screen.getByText('BODMAS Formula Builder')).toBeInTheDocument();
      expect(screen.getByText('Build Complex Formulas Visually')).toBeInTheDocument();
      expect(screen.getByTestId('formula-builder')).toBeInTheDocument();
    });

    test('should render app bar with controls', () => {
      render(<App />);
      
      expect(screen.getByText('Custom Panel')).toBeInTheDocument();
      expect(screen.getByText('Add Variable')).toBeInTheDocument();
    });

    test('should show default variables in FormulaBuilder', () => {
      render(<App />);
      
      // Default variables should be passed to FormulaBuilder
      expect(screen.getByTestId('variables-count')).toHaveTextContent('Variables: 6');
    });
  });

  describe('Custom Variable Panel Toggle', () => {
    test('should toggle custom variable panel', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Initially should show default panel indicator
      expect(screen.getByText('Using Default Variable Panel')).toBeInTheDocument();
      
      // Toggle switch
      const toggleSwitch = screen.getByRole('checkbox');
      await user.click(toggleSwitch);
      
      expect(screen.getByText('Using Custom Variable Panel')).toBeInTheDocument();
    });

    test('should pass custom variable panel flag to FormulaBuilder', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Toggle switch
      const toggleSwitch = screen.getByRole('checkbox');
      await user.click(toggleSwitch);
      
      expect(screen.getByTestId('custom-variable-panel')).toBeInTheDocument();
    });
  });

  describe('Variable Management', () => {
    test('should open add variable dialog', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const addButton = screen.getByText('Add Variable');
      await user.click(addButton);
      
      expect(screen.getByText('Add New Variable')).toBeInTheDocument();
      expect(screen.getByLabelText('Variable Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Variable Value')).toBeInTheDocument();
    });

    test('should add new numeric variable', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Open dialog
      const addButton = screen.getByText('Add Variable');
      await user.click(addButton);
      
      // Fill form
      await user.type(screen.getByLabelText('Variable Name'), 'testVar');
      await user.type(screen.getByLabelText('Variable Value'), '123');
      
      // Submit (find the button in dialog)
      const submitButton = screen.getByRole('button', { name: 'Add Variable' });
      await user.click(submitButton);
      
      // Check that variables count increased
      await waitFor(() => {
        expect(screen.getByTestId('variables-count')).toHaveTextContent('Variables: 7');
      });
    });

    test('should add new string variable', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Open dialog
      const addButton = screen.getByText('Add Variable');
      await user.click(addButton);
      
      // Fill form
      await user.type(screen.getByLabelText('Variable Name'), 'testString');
      await user.type(screen.getByLabelText('Variable Value'), 'hello world');
      
      // Submit
      const submitButton = screen.getByRole('button', { name: 'Add Variable' });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('variables-count')).toHaveTextContent('Variables: 7');
      });
    });

    test('should add boolean variable', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Open dialog
      const addButton = screen.getByText('Add Variable');
      await user.click(addButton);
      
      // Fill form
      await user.type(screen.getByLabelText('Variable Name'), 'testBool');
      await user.type(screen.getByLabelText('Variable Value'), 'true');
      
      // Submit
      const submitButton = screen.getByRole('button', { name: 'Add Variable' });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('variables-count')).toHaveTextContent('Variables: 7');
      });
    });

    test('should remove variable using chip delete', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Find delete buttons on variable chips (MUI Chip delete buttons)
      const deleteButtons = screen.getAllByTestId('CancelIcon');
      expect(deleteButtons.length).toBeGreaterThan(0);
      
      await user.click(deleteButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByTestId('variables-count')).toHaveTextContent('Variables: 5');
      });
    });
  });

  describe('Formula Handling', () => {
    test('should handle formula changes', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const formulaInput = screen.getByTestId('formula-input');
      await user.clear(formulaInput);
      await user.type(formulaInput, '1 + 2');
      
      expect(screen.getByTestId('formula-display')).toHaveTextContent('1 + 2');
    });

    test('should pass custom functions to FormulaBuilder', () => {
      render(<App />);
      
      // Should have custom functions (DISCOUNT, TAX, TOTAL)
      expect(screen.getByTestId('custom-functions-count')).toHaveTextContent('Functions: 3');
    });
  });

  describe('Responsive Design', () => {
    test('should render properly on different screen sizes', () => {
      render(<App />);
      
      // Check main container
      const container = screen.getByText('Build Complex Formulas Visually').closest('.MuiContainer-root');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Theme and Styling', () => {
    test('should apply Material-UI theme', () => {
      render(<App />);
      
      // Check if theme provider is working by checking for MUI classes
      const appBar = screen.getByText('BODMAS Formula Builder').closest('.MuiAppBar-root');
      expect(appBar).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    test('should maintain formula state across interactions', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Set formula
      const formulaInput = screen.getByTestId('formula-input');
      await user.clear(formulaInput);
      await user.type(formulaInput, 'price * quantity');
      
      // Toggle panel
      const toggleSwitch = screen.getByRole('checkbox');
      await user.click(toggleSwitch);
      
      // Formula should still be there
      expect(screen.getByTestId('formula-display')).toHaveTextContent('price * quantity');
    });

    test('should maintain variable state across panel toggles', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Add variable
      const addButton = screen.getByText('Add Variable');
      await user.click(addButton);
      
      await user.type(screen.getByLabelText('Variable Name'), 'newVar');
      await user.type(screen.getByLabelText('Variable Value'), '456');
      
      const submitButton = screen.getByRole('button', { name: 'Add Variable' });
      await user.click(submitButton);
      
      // Toggle panel
      const toggleSwitch = screen.getByRole('checkbox');
      await user.click(toggleSwitch);
      
      // Variables should still include the new one
      await waitFor(() => {
        expect(screen.getByTestId('variables-count')).toHaveTextContent('Variables: 7');
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle empty variable name gracefully', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Open dialog
      const addButton = screen.getByText('Add Variable');
      await user.click(addButton);
      
      // Only fill value, not name
      await user.type(screen.getByLabelText('Variable Value'), '123');
      
      // Try to submit - button should be disabled
      const submitButton = screen.getByRole('button', { name: 'Add Variable' });
      expect(submitButton).toBeDisabled();
    });

    test('should handle empty variable value gracefully', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Open dialog
      const addButton = screen.getByText('Add Variable');
      await user.click(addButton);
      
      // Only fill name, not value
      await user.type(screen.getByLabelText('Variable Name'), 'testVar');
      
      // Try to submit - button should be disabled
      const submitButton = screen.getByRole('button', { name: 'Add Variable' });
      expect(submitButton).toBeDisabled();
    });
  });
}); 