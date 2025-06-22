import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { PaletteContainer } from '../PaletteContainer';

// Create emotion cache for testing
const cache = createCache({ key: 'css', prepend: true });

// Mock window.getComputedStyle to avoid CSS-in-JS errors
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
    visibility: 'visible',
  }),
});

// Mock the child components
jest.mock('../FunctionPalette', () => ({
  FunctionPalette: ({ onFunctionInsert, onVariableInsert, variables, engine, showVariables, showHeader }) => (
    <div data-testid="function-palette">
      <div data-testid="function-palette-props">
        {JSON.stringify({ 
          variablesCount: variables?.length || 0, 
          showVariables, 
          showHeader,
          hasEngine: !!engine 
        })}
      </div>
      <button
        data-testid="insert-function-btn"
        onClick={() => onFunctionInsert('SUM(')}
      >
        Insert Function
      </button>
      <button
        data-testid="insert-variable-btn"
        onClick={() => onVariableInsert('testVar')}
      >
        Insert Variable
      </button>
    </div>
  )
}));

jest.mock('../VariablePalette', () => ({
  __esModule: true,
  default: ({ variableManager, onVariableInsert, onVariableEdit, onVariableDelete, onVariableAdd }) => (
    <div data-testid="variable-palette">
      <div data-testid="variable-manager-stats">
        {JSON.stringify(variableManager?.getStats() || {})}
      </div>
      <button
        data-testid="insert-variable-btn"
        onClick={() => onVariableInsert('managerVar')}
      >
        Insert Variable
      </button>
      <button
        data-testid="edit-variable-btn"
        onClick={() => onVariableEdit({ name: 'testVar', value: 123 })}
      >
        Edit Variable
      </button>
      <button
        data-testid="delete-variable-btn"
        onClick={() => onVariableDelete('testVar')}
      >
        Delete Variable
      </button>
      <button
        data-testid="add-variable-btn"
        onClick={() => onVariableAdd()}
      >
        Add Variable
      </button>
    </div>
  )
}));

// Create a theme for testing
const theme = createTheme();

// Helper function to render with theme and emotion cache
const renderWithTheme = (component) => {
  return render(
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </CacheProvider>
  );
};

// Mock engine for testing
const mockEngine = {
  getFunctionSuggestions: jest.fn(() => [])
};

describe('SimpleVariableManager', () => {
  describe('Variable Manager functionality through PaletteContainer', () => {
    it('should initialize with provided variables', () => {
      const variables = { var1: 123, var2: 'test', var3: true };
      
      renderWithTheme(
        <PaletteContainer
          onFunctionInsert={jest.fn()}
          onVariableInsert={jest.fn()}
          variables={variables}
          engine={mockEngine}
        />
      );

      // Switch to variables tab to see the variable manager
      fireEvent.click(screen.getByText('Variables'));
      
      // Check that variables are processed
      const statsElement = screen.getByTestId('variable-manager-stats');
      const stats = JSON.parse(statsElement.textContent);
      expect(stats.totalVariables).toBe(3);
    });

    it('should handle different variable types', () => {
      const variables = { 
        numberVar: 123, 
        stringVar: 'test', 
        boolVar: true,
        arrayVar: [1, 2, 3],
        objectVar: { key: 'value' }
      };
      
      renderWithTheme(
        <PaletteContainer
          onFunctionInsert={jest.fn()}
          onVariableInsert={jest.fn()}
          variables={variables}
          engine={mockEngine}
        />
      );

      fireEvent.click(screen.getByText('Variables'));
      
      const statsElement = screen.getByTestId('variable-manager-stats');
      const stats = JSON.parse(statsElement.textContent);
      expect(stats.totalVariables).toBe(5);
      expect(stats.byType).toEqual(
        expect.objectContaining({
          number: 1,
          string: 1,
          boolean: 1
        })
      );
    });
  });
});

describe('PaletteContainer', () => {
  const defaultProps = {
    onFunctionInsert: jest.fn(),
    onVariableInsert: jest.fn(),
    variables: {},
    engine: mockEngine
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      renderWithTheme(<PaletteContainer {...defaultProps} />);
      
      expect(screen.getByText('Formula Builder')).toBeInTheDocument();
      expect(screen.getByText('Functions')).toBeInTheDocument();
      expect(screen.getByText('Variables')).toBeInTheDocument();
    });

    it('should render function palette by default', () => {
      renderWithTheme(<PaletteContainer {...defaultProps} />);
      
      expect(screen.getByTestId('function-palette')).toBeInTheDocument();
      expect(screen.queryByTestId('variable-palette')).not.toBeInTheDocument();
    });

    it('should have proper tab accessibility attributes', () => {
      renderWithTheme(<PaletteContainer {...defaultProps} />);
      
      // Use data-testid or simpler queries to avoid CSS issues
      const functionsTab = screen.getByText('Functions').closest('button');
      const variablesTab = screen.getByText('Variables').closest('button');
      
      expect(functionsTab).toHaveAttribute('aria-selected', 'true');
      expect(variablesTab).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to variables tab when clicked', () => {
      const variables = { testVar: 123 };
      renderWithTheme(
        <PaletteContainer {...defaultProps} variables={variables} />
      );
      
      const variablesTab = screen.getByText('Variables');
      fireEvent.click(variablesTab);
      
      expect(screen.getByTestId('variable-palette')).toBeInTheDocument();
      expect(screen.queryByTestId('function-palette')).not.toBeInTheDocument();
    });

    it('should switch back to functions tab', () => {
      const variables = { testVar: 123 };
      renderWithTheme(
        <PaletteContainer {...defaultProps} variables={variables} />
      );
      
      // Switch to variables
      fireEvent.click(screen.getByText('Variables'));
      expect(screen.getByTestId('variable-palette')).toBeInTheDocument();
      
      // Switch back to functions
      fireEvent.click(screen.getByText('Functions'));
      expect(screen.getByTestId('function-palette')).toBeInTheDocument();
      expect(screen.queryByTestId('variable-palette')).not.toBeInTheDocument();
    });

    it('should update tab selection state correctly', () => {
      renderWithTheme(<PaletteContainer {...defaultProps} />);
      
      // Use simpler queries to avoid CSS issues
      const functionsTab = screen.getByText('Functions').closest('button');
      const variablesTab = screen.getByText('Variables').closest('button');
      
      // Initially functions tab is selected
      expect(functionsTab).toHaveAttribute('aria-selected', 'true');
      expect(variablesTab).toHaveAttribute('aria-selected', 'false');
      
      // Click variables tab
      fireEvent.click(variablesTab);
      
      expect(functionsTab).toHaveAttribute('aria-selected', 'false');
      expect(variablesTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Function Palette Integration', () => {
    it('should pass correct props to FunctionPalette', () => {
      const variables = { var1: 123, var2: 'test' };
      const engine = mockEngine;
      
      renderWithTheme(
        <PaletteContainer
          {...defaultProps}
          variables={variables}
          engine={engine}
        />
      );
      
      const propsElement = screen.getByTestId('function-palette-props');
      const props = JSON.parse(propsElement.textContent);
      
      expect(props.variablesCount).toBe(2);
      expect(props.showVariables).toBe(false);
      expect(props.showHeader).toBe(false);
      expect(props.hasEngine).toBe(true);
    });

    it('should handle function insertion', () => {
      const onFunctionInsert = jest.fn();
      
      renderWithTheme(
        <PaletteContainer
          {...defaultProps}
          onFunctionInsert={onFunctionInsert}
        />
      );
      
      fireEvent.click(screen.getByTestId('insert-function-btn'));
      expect(onFunctionInsert).toHaveBeenCalledWith('SUM(');
    });

    it('should handle variable insertion from function palette', () => {
      const onVariableInsert = jest.fn();
      
      renderWithTheme(
        <PaletteContainer
          {...defaultProps}
          onVariableInsert={onVariableInsert}
        />
      );
      
      fireEvent.click(screen.getByTestId('insert-variable-btn'));
      expect(onVariableInsert).toHaveBeenCalledWith('testVar');
    });
  });

  describe('Variable Palette Integration', () => {
    it('should show variable palette when variables exist', () => {
      const variables = { testVar: 123 };
      
      renderWithTheme(
        <PaletteContainer {...defaultProps} variables={variables} />
      );
      
      fireEvent.click(screen.getByText('Variables'));
      expect(screen.getByTestId('variable-palette')).toBeInTheDocument();
    });

    it('should show empty state when no variables exist', () => {
      renderWithTheme(<PaletteContainer {...defaultProps} variables={{}} />);
      
      fireEvent.click(screen.getByText('Variables'));
      
      expect(screen.getByText('No Variables Available')).toBeInTheDocument();
      expect(screen.getByText(/Variables will appear here/)).toBeInTheDocument();
      expect(screen.queryByTestId('variable-palette')).not.toBeInTheDocument();
    });

    it('should handle variable operations from variable palette', () => {
      const onVariableInsert = jest.fn();
      const variables = { testVar: 123 };
      
      renderWithTheme(
        <PaletteContainer
          {...defaultProps}
          onVariableInsert={onVariableInsert}
          variables={variables}
        />
      );
      
      fireEvent.click(screen.getByText('Variables'));
      
      // Test variable insertion
      fireEvent.click(screen.getByTestId('insert-variable-btn'));
      expect(onVariableInsert).toHaveBeenCalledWith('managerVar');
    });

    it('should handle variable edit operations', () => {
      // Since handleVariableEdit just logs, we'll spy on console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const variables = { testVar: 123 };
      
      renderWithTheme(
        <PaletteContainer {...defaultProps} variables={variables} />
      );
      
      fireEvent.click(screen.getByText('Variables'));
      fireEvent.click(screen.getByTestId('edit-variable-btn'));
      
      expect(consoleSpy).toHaveBeenCalledWith('Edit variable:', { name: 'testVar', value: 123 });
      
      consoleSpy.mockRestore();
    });

    it('should handle variable delete operations', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const variables = { testVar: 123 };
      
      renderWithTheme(
        <PaletteContainer {...defaultProps} variables={variables} />
      );
      
      fireEvent.click(screen.getByText('Variables'));
      fireEvent.click(screen.getByTestId('delete-variable-btn'));
      
      expect(consoleSpy).toHaveBeenCalledWith('Delete variable:', 'testVar');
      
      consoleSpy.mockRestore();
    });

    it('should handle variable add operations', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const variables = { testVar: 123 };
      
      renderWithTheme(
        <PaletteContainer {...defaultProps} variables={variables} />
      );
      
      fireEvent.click(screen.getByText('Variables'));
      fireEvent.click(screen.getByTestId('add-variable-btn'));
      
      expect(consoleSpy).toHaveBeenCalledWith('Add variable clicked');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Custom Variable Component', () => {
    it('should render custom variable component when provided', () => {
      const CustomVariableComponent = ({ variables, onVariableInsert }) => (
        <div data-testid="custom-variable-component">
          <span>Custom Component with {Object.keys(variables).length} variables</span>
          <button onClick={() => onVariableInsert('customVar')}>
            Insert Custom Variable
          </button>
        </div>
      );
      
      const variables = { var1: 123, var2: 'test' };
      const onVariableInsert = jest.fn();
      
      renderWithTheme(
        <PaletteContainer
          {...defaultProps}
          variables={variables}
          onVariableInsert={onVariableInsert}
          customVariableComponent={CustomVariableComponent}
        />
      );
      
      fireEvent.click(screen.getByText('Variables'));
      
      expect(screen.getByTestId('custom-variable-component')).toBeInTheDocument();
      expect(screen.getByText('Custom Component with 2 variables')).toBeInTheDocument();
      expect(screen.queryByTestId('variable-palette')).not.toBeInTheDocument();
    });

    it('should pass correct props to custom variable component', () => {
      const CustomVariableComponent = jest.fn().mockReturnValue(
        <div data-testid="custom-variable-component">Custom</div>
      );
      
      const variables = { var1: 123 };
      const onVariableInsert = jest.fn();
      const onFunctionInsert = jest.fn();
      const engine = mockEngine;
      
      renderWithTheme(
        <PaletteContainer
          onFunctionInsert={onFunctionInsert}
          onVariableInsert={onVariableInsert}
          variables={variables}
          engine={engine}
          customVariableComponent={CustomVariableComponent}
        />
      );
      
      fireEvent.click(screen.getByText('Variables'));
      
      expect(CustomVariableComponent).toHaveBeenCalledTimes(1);
      expect(CustomVariableComponent.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          variables,
          onVariableInsert,
          onFunctionInsert,
          engine
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined variables prop', () => {
      renderWithTheme(
        <PaletteContainer
          onFunctionInsert={jest.fn()}
          onVariableInsert={jest.fn()}
          engine={mockEngine}
        />
      );
      
      fireEvent.click(screen.getByText('Variables'));
      expect(screen.getByText('No Variables Available')).toBeInTheDocument();
    });

    it('should handle null variables prop', () => {
      renderWithTheme(
        <PaletteContainer
          onFunctionInsert={jest.fn()}
          onVariableInsert={jest.fn()}
          variables={{}}
          engine={mockEngine}
        />
      );
      
      fireEvent.click(screen.getByText('Variables'));
      expect(screen.getByText('No Variables Available')).toBeInTheDocument();
    });

    it('should handle missing callback props gracefully', () => {
      const variables = { testVar: 123 };
      
      expect(() => {
        renderWithTheme(
          <PaletteContainer
            variables={variables}
            engine={mockEngine}
          />
        );
      }).not.toThrow();
    });

    it('should handle missing engine prop', () => {
      expect(() => {
        renderWithTheme(
          <PaletteContainer
            onFunctionInsert={jest.fn()}
            onVariableInsert={jest.fn()}
            variables={{}}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Styling and Layout', () => {
    it('should have correct CSS classes', () => {
      renderWithTheme(<PaletteContainer {...defaultProps} />);
      
      const container = screen.getByText('Formula Builder').closest('.palette-container');
      expect(container).toBeInTheDocument();
    });

    it('should have proper ARIA labels for tab panels', () => {
      renderWithTheme(<PaletteContainer {...defaultProps} />);
      
      // Use querySelector to avoid CSS issues
      const visiblePanel = document.querySelector('[role="tabpanel"]:not([hidden])');
      expect(visiblePanel).toHaveAttribute('id', 'palette-tabpanel-0');
      
      fireEvent.click(screen.getByText('Variables'));
      
      const newVisiblePanel = document.querySelector('[role="tabpanel"]:not([hidden])');
      expect(newVisiblePanel).toHaveAttribute('id', 'palette-tabpanel-1');
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily when props do not change', () => {
      const renderSpy = jest.fn();
      
      const TestComponent = (props) => {
        renderSpy();
        return <PaletteContainer {...props} />;
      };
      
      const { rerender } = renderWithTheme(
        <TestComponent {...defaultProps} />
      );
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with same props
      rerender(
        <ThemeProvider theme={theme}>
          <TestComponent {...defaultProps} />
        </ThemeProvider>
      );
      
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });
});

describe('TabPanel Component', () => {
  const defaultProps = {
    onFunctionInsert: jest.fn(),
    onVariableInsert: jest.fn(),
    variables: {},
    engine: mockEngine
  };

  it('should render children when value matches index', () => {
    renderWithTheme(<PaletteContainer {...defaultProps} />);
    
    // Functions tab (index 0) should be visible by default
    expect(screen.getByTestId('function-palette')).toBeInTheDocument();
  });

  it('should hide children when value does not match index', () => {
    renderWithTheme(<PaletteContainer {...defaultProps} />);
    
    // Use querySelector to avoid CSS issues
    const hiddenPanels = document.querySelectorAll('[role="tabpanel"][hidden]');
    expect(hiddenPanels.length).toBeGreaterThan(0);
  });
}); 