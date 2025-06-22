import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormulaBuilder } from '../index';
import { FormulaEngine } from '../../../utils/FormulaEngine';

// Mock all child components
jest.mock('../FormulaEditor', () => {
  const mockReact = require('react');
  const FormulaEditor = mockReact.forwardRef(({ value, onChange, validation, engine }, ref) => {
    mockReact.useImperativeHandle(ref, () => ({
      insertAtCursor: jest.fn((text) => {
        onChange(value + text);
      }),
      focus: jest.fn(),
      getSelection: jest.fn(),
      getValue: jest.fn(() => value),
      getEditor: jest.fn(),
    }));

    return mockReact.createElement('div', { 'data-testid': 'formula-editor' },
      mockReact.createElement('textarea', {
        'data-testid': 'formula-input',
        value: value,
        onChange: (e) => onChange(e.target.value),
        placeholder: 'Enter formula'
      }),
      mockReact.createElement('div', { 'data-testid': 'validation-status' },
        validation.valid ? 'valid' : 'invalid'
      ),
      !validation.valid && mockReact.createElement('div', { 'data-testid': 'validation-error' }, validation.error)
    );
  });
  FormulaEditor.displayName = 'FormulaEditor';
  return { FormulaEditor };
});

jest.mock('../PaletteContainer', () => {
  const mockReact = require('react');
  return {
    PaletteContainer: ({ 
      onFunctionInsert, 
      onVariableInsert, 
      variables, 
      engine, 
      customVariableComponent: CustomVariableComponent 
    }) => mockReact.createElement('div', { 'data-testid': 'palette-container' },
      mockReact.createElement('div', { 'data-testid': 'variables-count' },
        `Variables: ${Object.keys(variables || {}).length}`
      ),
      mockReact.createElement('button', {
        'data-testid': 'insert-function-btn',
        onClick: () => onFunctionInsert('SUM(')
      }, 'Insert Function'),
      mockReact.createElement('button', {
        'data-testid': 'insert-variable-btn',
        onClick: () => onVariableInsert('testVar')
      }, 'Insert Variable'),
      CustomVariableComponent && mockReact.createElement('div', { 'data-testid': 'custom-variable-component' },
        mockReact.createElement(CustomVariableComponent)
      )
    )
  };
});

jest.mock('../ValidationPanel', () => {
  const mockReact = require('react');
  return {
    ValidationPanel: ({ validation }) => mockReact.createElement('div', { 'data-testid': 'validation-panel' },
      mockReact.createElement('div', { 'data-testid': 'validation-panel-status' },
        validation.valid ? 'Valid' : 'Invalid'
      ),
      validation.error && mockReact.createElement('div', { 'data-testid': 'validation-panel-error' }, validation.error)
    )
  };
});

jest.mock('../PreviewPanel', () => {
  const mockReact = require('react');
  return {
    PreviewPanel: ({ result, formula, variables }) => mockReact.createElement('div', { 'data-testid': 'preview-panel' },
      mockReact.createElement('div', { 'data-testid': 'preview-formula' }, formula || 'No formula'),
      mockReact.createElement('div', { 'data-testid': 'preview-result' },
        result !== null ? String(result) : 'No result'
      ),
      mockReact.createElement('div', { 'data-testid': 'preview-variables-count' },
        Object.keys(variables || {}).length
      )
    )
  };
});

// Mock FormulaEngine
jest.mock('../../../utils/FormulaEngine');

describe('FormulaBuilder', () => {
  let mockEngine;
  let mockOnFormulaChange;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock engine instance
    mockEngine = {
      validateExpression: jest.fn(() => ({ valid: true, error: null })), // Default return value
      evaluateFormula: jest.fn(() => null),
      getFunctionSuggestions: jest.fn(() => []),
    };
    
    // Mock FormulaEngine constructor
    FormulaEngine.mockImplementation(() => mockEngine);
    
    // Mock callback
    mockOnFormulaChange = jest.fn();
  });

  describe('rendering', () => {
    test('should render with default props', () => {
      render(<FormulaBuilder />);
      
      expect(screen.getByText('Formula Builder')).toBeInTheDocument();
      expect(screen.getByTestId('formula-editor')).toBeInTheDocument();
      expect(screen.getByTestId('palette-container')).toBeInTheDocument();
      expect(screen.getByTestId('validation-panel')).toBeInTheDocument();
      expect(screen.getByTestId('preview-panel')).toBeInTheDocument();
    });

    test('should render with initial formula', () => {
      const initialFormula = '1 + 2';
      render(<FormulaBuilder initialFormula={initialFormula} />);
      
      expect(screen.getByDisplayValue(initialFormula)).toBeInTheDocument();
    });

    test('should render with custom variables', () => {
      const variables = { revenue: 1000, costs: 500 };
      const customVariables = { profit: 500 };
      
      render(<FormulaBuilder variables={variables} customVariables={customVariables} />);
      
      // Should show total count of both variable sets
      expect(screen.getByText('Variables: 3')).toBeInTheDocument();
    });

    test('should render with custom variable component', () => {
      const CustomVariableComponent = () => <div>Custom Variables</div>;
      
      render(<FormulaBuilder customVariableComponent={CustomVariableComponent} />);
      
      expect(screen.getByText('Custom Variables')).toBeInTheDocument();
    });
  });

  describe('formula validation and evaluation', () => {
    test('should validate formula on change', async () => {
      const formula = '1 + 2';
      mockEngine.validateExpression.mockReturnValue({ valid: true, error: null });
      mockEngine.evaluateFormula.mockReturnValue(3);
      
      render(<FormulaBuilder onFormulaChange={mockOnFormulaChange} />);
      
      const input = screen.getByTestId('formula-input');
      fireEvent.change(input, { target: { value: formula } });
      
      expect(mockEngine.validateExpression).toHaveBeenCalledWith(formula);
      expect(mockOnFormulaChange).toHaveBeenCalledWith(formula, { valid: true, error: null });
    });

    test('should handle invalid formula', async () => {
      const formula = '1 +';
      const validationError = { valid: false, error: 'Incomplete expression' };
      mockEngine.validateExpression.mockReturnValue(validationError);
      
      render(<FormulaBuilder onFormulaChange={mockOnFormulaChange} />);
      
      const input = screen.getByTestId('formula-input');
      fireEvent.change(input, { target: { value: formula } });
      
      expect(screen.getByTestId('validation-status')).toHaveTextContent('invalid');
      expect(screen.getByTestId('validation-error')).toHaveTextContent('Incomplete expression');
      expect(mockOnFormulaChange).toHaveBeenCalledWith(formula, validationError);
    });

    test('should evaluate valid formula for preview', async () => {
      const formula = 'SUM(1, 2, 3)';
      const result = 6;
      mockEngine.validateExpression.mockReturnValue({ valid: true, error: null });
      mockEngine.evaluateFormula.mockReturnValue(result);
      
      render(<FormulaBuilder />);
      
      const input = screen.getByTestId('formula-input');
      fireEvent.change(input, { target: { value: formula } });
      
      expect(mockEngine.evaluateFormula).toHaveBeenCalledWith(formula, {});
      expect(screen.getByTestId('preview-result')).toHaveTextContent('6');
    });

    test('should handle evaluation errors', async () => {
      const formula = 'UNKNOWN_FUNCTION()';
      mockEngine.validateExpression.mockReturnValue({ valid: true, error: null });
      mockEngine.evaluateFormula.mockImplementation(() => {
        throw new Error('Unknown function');
      });
      
      render(<FormulaBuilder />);
      
      const input = screen.getByTestId('formula-input');
      fireEvent.change(input, { target: { value: formula } });
      
      expect(screen.getByTestId('preview-result')).toHaveTextContent('Error: Unknown function');
    });

    test('should use variables in evaluation', async () => {
      const formula = 'revenue - costs';
      const variables = { revenue: 1000, costs: 300 };
      const customVariables = { tax: 50 };
      const expectedVariables = { ...variables, ...customVariables };
      
      mockEngine.validateExpression.mockReturnValue({ valid: true, error: null });
      mockEngine.evaluateFormula.mockReturnValue(700);
      
      render(<FormulaBuilder variables={variables} customVariables={customVariables} />);
      
      const input = screen.getByTestId('formula-input');
      fireEvent.change(input, { target: { value: formula } });
      
      expect(mockEngine.evaluateFormula).toHaveBeenCalledWith(formula, expectedVariables);
    });

    test('should prioritize custom variables over default variables', () => {
      const variables = { revenue: 1000, costs: 300 };
      const customVariables = { revenue: 2000 }; // Override revenue
      
      mockEngine.validateExpression.mockReturnValue({ valid: true, error: null });
      mockEngine.evaluateFormula.mockReturnValue(1700);
      
      render(<FormulaBuilder variables={variables} customVariables={customVariables} />);
      
      const input = screen.getByTestId('formula-input');
      fireEvent.change(input, { target: { value: 'revenue' } });
      
      expect(mockEngine.evaluateFormula).toHaveBeenCalledWith('revenue', { 
        revenue: 2000, // Should use custom variable value
        costs: 300 
      });
    });
  });

  describe('function and variable insertion', () => {
    test('should insert function through palette', async () => {
      render(<FormulaBuilder />);
      
      const insertBtn = screen.getByTestId('insert-function-btn');
      fireEvent.click(insertBtn);
      
      // Should update the formula input
      expect(screen.getByDisplayValue('SUM(')).toBeInTheDocument();
    });

    test('should insert variable through palette', async () => {
      render(<FormulaBuilder />);
      
      const insertBtn = screen.getByTestId('insert-variable-btn');
      fireEvent.click(insertBtn);
      
      // Should update the formula input
      expect(screen.getByDisplayValue('testVar')).toBeInTheDocument();
    });

    test('should handle function insertion with existing formula', async () => {
      const initialFormula = '1 + ';
      render(<FormulaBuilder initialFormula={initialFormula} />);
      
      const insertBtn = screen.getByTestId('insert-function-btn');
      fireEvent.click(insertBtn);
      
      expect(screen.getByDisplayValue('1 + SUM(')).toBeInTheDocument();
    });

    test('should handle variable insertion with existing formula', async () => {
      const initialFormula = 'SUM(';
      render(<FormulaBuilder initialFormula={initialFormula} />);
      
      const insertBtn = screen.getByTestId('insert-variable-btn');
      fireEvent.click(insertBtn);
      
      expect(screen.getByDisplayValue('SUM(testVar')).toBeInTheDocument();
    });
  });

  describe('custom functions', () => {
    test('should initialize engine with custom functions', () => {
      const customFunctions = {
        CUSTOM_ADD: {
          name: 'CUSTOM_ADD',
          signature: 'CUSTOM_ADD(a, b)',
          description: 'Custom addition',
          execute: (a, b) => a + b
        }
      };
      
      render(<FormulaBuilder customFunctions={customFunctions} />);
      
      expect(FormulaEngine).toHaveBeenCalledWith(customFunctions);
    });

    test('should work without custom functions', () => {
      render(<FormulaBuilder />);
      
      expect(FormulaEngine).toHaveBeenCalledWith({});
    });
  });

  describe('component lifecycle', () => {
    test('should maintain formula state across re-renders', () => {
      const { rerender } = render(<FormulaBuilder initialFormula="1 + 2" />);
      
      expect(screen.getByDisplayValue('1 + 2')).toBeInTheDocument();
      
      rerender(<FormulaBuilder initialFormula="1 + 2" variables={{ a: 1 }} />);
      
      expect(screen.getByDisplayValue('1 + 2')).toBeInTheDocument();
    });

    test('should handle prop changes', () => {
      const { rerender } = render(<FormulaBuilder variables={{ a: 1 }} />);
      
      expect(screen.getByText('Variables: 1')).toBeInTheDocument();
      
      rerender(<FormulaBuilder variables={{ a: 1, b: 2 }} />);
      
      expect(screen.getByText('Variables: 2')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    test('should handle empty formula gracefully', () => {
      mockEngine.validateExpression.mockReturnValue({ valid: true, error: null });
      
      render(<FormulaBuilder />);
      
      const input = screen.getByTestId('formula-input');
      fireEvent.change(input, { target: { value: '' } });
      
      expect(screen.getByTestId('preview-result')).toHaveTextContent('No result');
    });

    test('should handle whitespace-only formula', () => {
      mockEngine.validateExpression.mockReturnValue({ valid: true, error: null });
      
      render(<FormulaBuilder />);
      
      const input = screen.getByTestId('formula-input');
      fireEvent.change(input, { target: { value: '   ' } });
      
      expect(screen.getByTestId('preview-result')).toHaveTextContent('No result');
    });

    test('should not evaluate invalid formulas', async () => {
      const formula = '1 +';
      mockEngine.validateExpression.mockReturnValue({ valid: false, error: 'Incomplete' });
      
      render(<FormulaBuilder />);
      
      const input = screen.getByTestId('formula-input');
      fireEvent.change(input, { target: { value: formula } });
      
      expect(mockEngine.evaluateFormula).not.toHaveBeenCalled();
      expect(screen.getByTestId('preview-result')).toHaveTextContent('No result');
    });
  });

  describe('callback handling', () => {
    test('should call onFormulaChange with formula and validation', async () => {
      const validationResult = { valid: true, error: null };
      mockEngine.validateExpression.mockReturnValue(validationResult);
      
      render(<FormulaBuilder onFormulaChange={mockOnFormulaChange} />);
      
      const input = screen.getByTestId('formula-input');
      fireEvent.change(input, { target: { value: '1 + 2' } });
      
      expect(mockOnFormulaChange).toHaveBeenCalledWith('1 + 2', validationResult);
    });

    test('should not call onFormulaChange when callback is not provided', async () => {
      mockEngine.validateExpression.mockReturnValue({ valid: true, error: null });
      
      // Should not throw error when onFormulaChange is not provided
      expect(() => {
        render(<FormulaBuilder />);
        const input = screen.getByTestId('formula-input');
        fireEvent.change(input, { target: { value: '1 + 2' } });
      }).not.toThrow();
    });
  });

  describe('accessibility', () => {

    test('should have proper form elements', () => {
      render(<FormulaBuilder />);
      
      const input = screen.getByTestId('formula-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Enter formula');
    });
  });

  describe('integration with child components', () => {
    test('should pass correct props to FormulaEditor', () => {
      const initialFormula = 'SUM(1, 2)';
      render(<FormulaBuilder initialFormula={initialFormula} />);
      
      expect(screen.getByDisplayValue(initialFormula)).toBeInTheDocument();
      expect(screen.getByTestId('validation-status')).toHaveTextContent('valid');
    });

    test('should pass correct props to PaletteContainer', () => {
      const variables = { a: 1, b: 2 };
      render(<FormulaBuilder variables={variables} />);
      
      expect(screen.getByText('Variables: 2')).toBeInTheDocument();
    });

    test('should pass correct props to ValidationPanel', () => {
      const validationResult = { valid: false, error: 'Test error' };
      mockEngine.validateExpression.mockReturnValue(validationResult);
      
      render(<FormulaBuilder />);
      
      const input = screen.getByTestId('formula-input');
      fireEvent.change(input, { target: { value: 'invalid' } });
      
      expect(screen.getByTestId('validation-panel-status')).toHaveTextContent('Invalid');
      expect(screen.getByTestId('validation-panel-error')).toHaveTextContent('Test error');
    });

    test('should pass correct props to PreviewPanel', () => {
      const formula = '2 * 3';
      const result = 6;
      const variables = { x: 10 };
      
      mockEngine.validateExpression.mockReturnValue({ valid: true, error: null });
      mockEngine.evaluateFormula.mockReturnValue(result);
      
      render(<FormulaBuilder variables={variables} />);
      
      const input = screen.getByTestId('formula-input');
      fireEvent.change(input, { target: { value: formula } });
      
      expect(screen.getByTestId('preview-formula')).toHaveTextContent(formula);
      expect(screen.getByTestId('preview-result')).toHaveTextContent('6');
      expect(screen.getByTestId('preview-variables-count')).toHaveTextContent('1');
    });
  });
}); 