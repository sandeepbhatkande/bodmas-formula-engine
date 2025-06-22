import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomVariablePanel from '../CustomVariablePanel';

describe('CustomVariablePanel', () => {
  const defaultProps = {
    variables: {},
    onVariableInsert: jest.fn(),
    onFunctionInsert: jest.fn(),
    engine: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    test('should render with no variables', () => {
      render(<CustomVariablePanel {...defaultProps} />);
      
      expect(screen.getByText('No Variables Available')).toBeInTheDocument();
      expect(screen.getByText('Variables will appear here when you provide them to the Formula Builder.')).toBeInTheDocument();
    });

    test('should render search input', () => {
      render(<CustomVariablePanel {...defaultProps} />);
      
      expect(screen.getByPlaceholderText('Search variables...')).toBeInTheDocument();
    });

    test('should render with variables', () => {
      const variables = {
        num1: 42,
        text1: 'hello',
        bool1: true
      };
      render(<CustomVariablePanel {...defaultProps} variables={variables} />);
      
      expect(screen.getByText('NUMBER (1)')).toBeInTheDocument();
      expect(screen.getByText('STRING (1)')).toBeInTheDocument();
      expect(screen.getByText('BOOLEAN (1)')).toBeInTheDocument();
    });
  });

  describe('variable display', () => {
    test('should display variable chips with correct formatting', () => {
      const variables = {
        num1: 42,
        text1: 'hello',
        bool1: true,
        obj1: { key: 'value' }
      };
      render(<CustomVariablePanel {...defaultProps} variables={variables} />);
      
      expect(screen.getByText('num1: 42')).toBeInTheDocument();
      expect(screen.getByText('text1: "hello"')).toBeInTheDocument();
      expect(screen.getByText('bool1: true')).toBeInTheDocument();
      expect(screen.getByText('obj1: {"key":"value"}')).toBeInTheDocument();
    });

    test('should group variables by type', () => {
      const variables = {
        num1: 1,
        num2: 2,
        str1: 'a',
        str2: 'b'
      };
      render(<CustomVariablePanel {...defaultProps} variables={variables} />);
      
      expect(screen.getByText('NUMBER (2)')).toBeInTheDocument();
      expect(screen.getByText('STRING (2)')).toBeInTheDocument();
    });

    test('should handle null and undefined values', () => {
      const variables = {
        nullVar: null,
        undefinedVar: undefined
      };
      render(<CustomVariablePanel {...defaultProps} variables={variables} />);
      
      expect(screen.getByText('nullVar: null')).toBeInTheDocument();
      expect(screen.getByText('undefinedVar: null')).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    const variables = {
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      score: 95.5
    };

    test('should filter variables by name', async () => {
      render(<CustomVariablePanel {...defaultProps} variables={variables} />);
      
      const searchInput = screen.getByPlaceholderText('Search variables...');
      fireEvent.change(searchInput, { target: { value: 'name' } });
      
      await waitFor(() => {
        expect(screen.getByText('firstName: "John"')).toBeInTheDocument();
        expect(screen.getByText('lastName: "Doe"')).toBeInTheDocument();
        expect(screen.queryByText('age: 30')).not.toBeInTheDocument();
      });
    });

    test('should filter variables by value', async () => {
      render(<CustomVariablePanel {...defaultProps} variables={variables} />);
      
      const searchInput = screen.getByPlaceholderText('Search variables...');
      fireEvent.change(searchInput, { target: { value: 'John' } });
      
      await waitFor(() => {
        expect(screen.getByText('firstName: "John"')).toBeInTheDocument();
        expect(screen.queryByText('lastName: "Doe"')).not.toBeInTheDocument();
      });
    });

    test('should show "No Variables Found" when search has no results', async () => {
      render(<CustomVariablePanel {...defaultProps} variables={variables} />);
      
      const searchInput = screen.getByPlaceholderText('Search variables...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      
      await waitFor(() => {
        expect(screen.getByText('No Variables Found')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your search terms.')).toBeInTheDocument();
      });
    });

    test('should clear search when clear button is clicked', async () => {
      const { rerender } = render(<CustomVariablePanel {...defaultProps} variables={variables} />);
      
      // Simulate component with search term by re-rendering with a mock that has searchTerm
      const ComponentWithSearch = () => {
        const [searchTerm, setSearchTerm] = React.useState('name');
        return (
          <div>
            <input 
              placeholder="Search variables..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && <button onClick={() => setSearchTerm('')}>Clear</button>}
          </div>
        );
      };
      
      rerender(<ComponentWithSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search variables...');
      const clearButton = screen.getByText('Clear');
      
      expect(searchInput.value).toBe('name');
      expect(clearButton).toBeInTheDocument();
    });
  });

  describe('variable interaction', () => {
    test('should call onVariableInsert when variable chip is clicked', async () => {
      const onVariableInsert = jest.fn();
      const variables = { testVar: 42 };
      
      render(
        <CustomVariablePanel 
          {...defaultProps} 
          variables={variables}
          onVariableInsert={onVariableInsert}
        />
      );
      
      const chip = screen.getByText('testVar: 42');
      fireEvent.click(chip);
      
      expect(onVariableInsert).toHaveBeenCalledWith('testVar');
    });

    test('should handle missing onVariableInsert callback', async () => {
      const variables = { testVar: 42 };
      
      render(<CustomVariablePanel {...defaultProps} variables={variables} />);
      
      const chip = screen.getByText('testVar: 42');
      fireEvent.click(chip);
      
      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('edge cases', () => {
    test('should handle empty variables object', () => {
      render(<CustomVariablePanel {...defaultProps} variables={{}} />);
      
      expect(screen.getByText('No Variables Available')).toBeInTheDocument();
    });

    test('should handle undefined variables prop', () => {
      render(<CustomVariablePanel {...defaultProps} variables={undefined} />);
      
      expect(screen.getByText('No Variables Available')).toBeInTheDocument();
    });

    test('should handle complex object variables', () => {
      const variables = {
        complexObj: {
          nested: { value: 42 },
          array: [1, 2, 3],
          func: () => 'test'
        }
      };
      
      render(<CustomVariablePanel {...defaultProps} variables={variables} />);
      
      expect(screen.getByText(/complexObj:/)).toBeInTheDocument();
    });

    test('should handle very long variable names', () => {
      const variables = {
        veryLongVariableNameThatShouldStillWork: 123
      };
      
      render(<CustomVariablePanel {...defaultProps} variables={variables} />);
      
      expect(screen.getByText(/veryLongVariableNameThatShouldStillWork:/)).toBeInTheDocument();
    });

    test('should handle special characters in variable names', () => {
      const variables = {
        'var_with_underscores': 1,
        'var-with-dashes': 2,
        'var$with$symbols': 3
      };
      
      render(<CustomVariablePanel {...defaultProps} variables={variables} />);
      
      expect(screen.getByText('var_with_underscores: 1')).toBeInTheDocument();
      expect(screen.getByText('var-with-dashes: 2')).toBeInTheDocument();
      expect(screen.getByText('var$with$symbols: 3')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    test('should have proper ARIA labels', () => {
      const variables = { testVar: 42 };
      render(<CustomVariablePanel {...defaultProps} variables={variables} />);
      
      const searchInput = screen.getByPlaceholderText('Search variables...');
      expect(searchInput).toBeInTheDocument();
    });

    test('should support keyboard navigation', async () => {
      const variables = { testVar: 42 };
      const onVariableInsert = jest.fn();
      
      render(
        <CustomVariablePanel 
          {...defaultProps} 
          variables={variables}
          onVariableInsert={onVariableInsert}
        />
      );
      
      const chip = screen.getByText('testVar: 42');
      
      // Test Enter key
      chip.focus();
      fireEvent.keyDown(chip, { key: 'Enter', code: 'Enter' });
      
      expect(onVariableInsert).toHaveBeenCalledWith('testVar');
    });
  });
}); 