import React from 'react';
import { render, screen } from '@testing-library/react';
import { ValidationPanel } from '../ValidationPanel';

describe('ValidationPanel', () => {
  describe('rendering', () => {
    test('should render with valid validation', () => {
      const validation = { valid: true, error: null };
      render(<ValidationPanel validation={validation} />);
      
      expect(screen.getByText('Validation')).toBeInTheDocument();
      expect(screen.getByText('Formula is valid and ready to use')).toBeInTheDocument();
    });

    test('should render with invalid validation', () => {
      const validation = { valid: false, error: 'Syntax error: unexpected token' };
      render(<ValidationPanel validation={validation} />);
      
      expect(screen.getByText('Validation')).toBeInTheDocument();
      expect(screen.getByText('Syntax error: unexpected token')).toBeInTheDocument();
    });

    test('should render default error message when no error provided', () => {
      const validation = { valid: false };
      render(<ValidationPanel validation={validation} />);
      
      expect(screen.getByText('Invalid formula syntax')).toBeInTheDocument();
    });
  });

  describe('error suggestions', () => {
    test('should show default suggestions for unknown errors', () => {
      const validation = { valid: false, error: 'unknown error' };
      render(<ValidationPanel validation={validation} />);
      
      expect(screen.getByText('Suggestions:')).toBeInTheDocument();
      expect(screen.getByText('Check function names and parameter count')).toBeInTheDocument();
    });

    test('should not show suggestions for valid formulas', () => {
      const validation = { valid: true };
      render(<ValidationPanel validation={validation} />);
      
      expect(screen.queryByText('Suggestions:')).not.toBeInTheDocument();
    });
  });

  describe('formula analysis', () => {
    test('should show analysis for valid formula with AST', () => {
      const validation = { 
        valid: true, 
        ast: { 
          type: 'OperatorNode',
          fn: '+',
          args: [
            { type: 'ConstantNode', value: 1 },
            { type: 'ConstantNode', value: 2 }
          ]
        }
      };
      render(<ValidationPanel validation={validation} />);
      
      expect(screen.getByText('Formula Analysis:')).toBeInTheDocument();
      expect(screen.getByText(/operations/)).toBeInTheDocument();
    });

    test('should not show analysis for invalid formulas', () => {
      const validation = { valid: false, error: 'test error' };
      render(<ValidationPanel validation={validation} />);
      
      expect(screen.queryByText('Formula Analysis:')).not.toBeInTheDocument();
    });
  });
}); 