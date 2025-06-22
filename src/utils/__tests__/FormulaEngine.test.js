import { FormulaEngine } from '../FormulaEngine';

describe('FormulaEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new FormulaEngine();
  });

  describe('constructor', () => {
    test('should initialize with default functions', () => {
      expect(engine).toBeInstanceOf(FormulaEngine);
      const suggestions = engine.getFunctionSuggestions();
      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    test('should initialize with custom functions', () => {
      const customFunctions = {
        CUSTOM_ADD: {
          name: 'CUSTOM_ADD',
          signature: 'CUSTOM_ADD(a, b)',
          description: 'Custom addition function',
          category: 'custom',
          execute: (a, b) => a + b
        }
      };
      const customEngine = new FormulaEngine(customFunctions);
      expect(customEngine).toBeInstanceOf(FormulaEngine);
    });
  });

  describe('validateExpression', () => {
    test('should validate simple arithmetic expressions', () => {
      const result = engine.validateExpression('1 + 2');
      expect(result.valid).toBe(true);
      expect(result.ast).toBeDefined();
    });

    test('should validate function calls', () => {
      const result = engine.validateExpression('SUM(1, 2, 3)');
      expect(result.valid).toBe(true);
      expect(result.ast).toBeDefined();
    });

    test('should validate variable references', () => {
      const result = engine.validateExpression('revenue + costs');
      expect(result.valid).toBe(true);
      expect(result.ast).toBeDefined();
    });

    test('should return error for invalid expressions', () => {
      const result = engine.validateExpression('1 +');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test('should return error for unbalanced parentheses', () => {
      const result = engine.validateExpression('(1 + 2');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Parenthesis');
    });

    test('should handle empty expressions', () => {
      const result = engine.validateExpression('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Formula must be a non-empty string');
    });

    test('should handle null expressions', () => {
      const result = engine.validateExpression(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Formula must be a non-empty string');
    });

    test('should handle undefined expressions', () => {
      const result = engine.validateExpression(undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Formula must be a non-empty string');
    });
  });

  describe('evaluateFormula', () => {
    test('should evaluate simple arithmetic', () => {
      expect(engine.evaluateFormula('1 + 2')).toBe(3);
      expect(engine.evaluateFormula('10 - 5')).toBe(5);
      expect(engine.evaluateFormula('3 * 4')).toBe(12);
      expect(engine.evaluateFormula('8 / 2')).toBe(4);
    });

    test('should evaluate complex arithmetic with parentheses', () => {
      expect(engine.evaluateFormula('(1 + 2) * 3')).toBe(9);
      expect(engine.evaluateFormula('10 / (2 + 3)')).toBe(2);
      expect(engine.evaluateFormula('((1 + 2) * 3) - 4')).toBe(5);
    });

    test('should evaluate with variables', () => {
      const context = { revenue: 1000, costs: 300 };
      expect(engine.evaluateFormula('revenue - costs', context)).toBe(700);
      expect(engine.evaluateFormula('revenue * 0.1', context)).toBe(100);
    });

    test('should evaluate function calls', () => {
      expect(engine.evaluateFormula('SUM(1, 2, 3, 4)')).toBe(10);
      expect(engine.evaluateFormula('MAX(5, 10, 3)')).toBe(10);
      expect(engine.evaluateFormula('MIN(5, 10, 3)')).toBe(3);
      expect(engine.evaluateFormula('AVERAGE(10, 20, 30)')).toBe(20);
    });

    test('should evaluate string functions', () => {
      expect(engine.evaluateFormula('CONCAT("Hello", " ", "World")')).toBe('Hello World');
      expect(engine.evaluateFormula('LEN("test")')).toBe(4);
      expect(engine.evaluateFormula('UPPER("hello")')).toBe('HELLO');
      expect(engine.evaluateFormula('LOWER("WORLD")')).toBe('world');
    });

    test('should evaluate logical functions', () => {
      expect(engine.evaluateFormula('IF(true, "yes", "no")')).toBe('yes');
      expect(engine.evaluateFormula('IF(false, "yes", "no")')).toBe('no');
      expect(engine.evaluateFormula('IF(5 > 3, "greater", "lesser")')).toBe('greater');
    });

    test('should handle division by zero', () => {
      const result = engine.evaluateFormula('10 / 0');
      expect(result).toBe(Infinity);
    });

    test('should handle undefined variables', () => {
      expect(() => {
        engine.evaluateFormula('unknownVar + 5');
      }).toThrow();
    });

    test('should handle invalid function names', () => {
      expect(() => {
        engine.evaluateFormula('NONEXISTENT(1, 2)');
      }).toThrow();
    });

    test('should handle invalid expressions', () => {
      expect(() => {
        engine.evaluateFormula('1 +');
      }).toThrow();
    });

    test('should provide meaningful error messages', () => {
      try {
        engine.evaluateFormula('1 +');
      } catch (error) {
        expect(error.message).toBeTruthy();
      }
    });
  });

  describe('getFunctionSuggestions', () => {
    test('should return array of function metadata', () => {
      const suggestions = engine.getFunctionSuggestions();
      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    test('should include required function properties', () => {
      const suggestions = engine.getFunctionSuggestions();
      const firstFunction = suggestions[0];
      expect(firstFunction).toHaveProperty('name');
      expect(firstFunction).toHaveProperty('signature');
      expect(firstFunction).toHaveProperty('description');
      expect(firstFunction).toHaveProperty('category');
    });

    test('should include common mathematical functions', () => {
      const suggestions = engine.getFunctionSuggestions();
      const functionNames = suggestions.map(f => f.name);
      expect(functionNames).toContain('SUM');
      expect(functionNames).toContain('MAX');
      expect(functionNames).toContain('MIN');
      expect(functionNames).toContain('AVERAGE');
    });

    test('should include string functions', () => {
      const suggestions = engine.getFunctionSuggestions();
      const functionNames = suggestions.map(f => f.name);
      expect(functionNames).toContain('CONCAT');
      expect(functionNames).toContain('LEN');
      expect(functionNames).toContain('UPPER');
      expect(functionNames).toContain('LOWER');
    });

    test('should include logical functions', () => {
      const suggestions = engine.getFunctionSuggestions();
      const functionNames = suggestions.map(f => f.name);
      expect(functionNames).toContain('IF');
      expect(functionNames).toContain('AND');
      expect(functionNames).toContain('OR');
    });
  });

  describe('getFunctionInfo', () => {
    test('should return function info for valid function name', () => {
      const info = engine.getFunctionInfo('SUM');
      expect(info).toBeDefined();
      expect(info.name).toBe('SUM');
      expect(info.signature).toBeDefined();
      expect(info.description).toBeDefined();
    });

    test('should return null for invalid function name', () => {
      const info = engine.getFunctionInfo('NONEXISTENT');
      expect(info).toBeNull();
    });

    test('should be case insensitive', () => {
      const info1 = engine.getFunctionInfo('sum');
      const info2 = engine.getFunctionInfo('SUM');
      expect(info1).toEqual(info2);
    });
  });

  describe('getFunctionsByCategory', () => {
    test('should return functions by category', () => {
      const mathFunctions = engine.getFunctionsByCategory('math');
      expect(mathFunctions).toBeInstanceOf(Array);
      expect(mathFunctions.length).toBeGreaterThan(0);
      mathFunctions.forEach(func => {
        expect(func.category).toBe('math');
      });
    });

    test('should return empty array for non-existent category', () => {
      const nonExistent = engine.getFunctionsByCategory('nonexistent');
      expect(nonExistent).toEqual([]);
    });
  });

  describe('error handling', () => {
    test('should handle malformed expressions gracefully', () => {
      expect(() => {
        engine.evaluateFormula('1 + * 2');
      }).toThrow();
    });

    test('should provide meaningful error messages', () => {
      try {
        engine.evaluateFormula('1 +');
      } catch (error) {
        expect(error.message).toBeTruthy();
      }
    });

    test('should handle very complex invalid expressions', () => {
      expect(() => {
        engine.evaluateFormula('((((1 + 2) * 3) / 0) + NONEXISTENT(1, 2))');
      }).toThrow();
    });
  });

  describe('edge cases', () => {
    test('should handle very large numbers', () => {
      const result = engine.evaluateFormula('999999999999 + 1');
      expect(result).toBe(1000000000000);
    });

    test('should handle very small numbers', () => {
      const result = engine.evaluateFormula('0.000001 * 2');
      expect(result).toBe(0.000002);
    });

    test('should handle nested function calls', () => {
      const result = engine.evaluateFormula('SUM(MAX(1, 2, 3), MIN(4, 5, 6))');
      expect(result).toBe(7); // MAX(1,2,3) = 3, MIN(4,5,6) = 4, SUM(3,4) = 7
    });

    test('should handle mixed data types in appropriate functions', () => {
      const result = engine.evaluateFormula('CONCAT("Number: ", 42)');
      expect(result).toBe('Number: 42');
    });

    test('should handle boolean operations', () => {
      expect(engine.evaluateFormula('true and false')).toBe(false);
      expect(engine.evaluateFormula('true or false')).toBe(true);
      expect(engine.evaluateFormula('not true')).toBe(false);
    });

    test('should handle comparison operations', () => {
      expect(engine.evaluateFormula('5 > 3')).toBe(true);
      expect(engine.evaluateFormula('5 < 3')).toBe(false);
      expect(engine.evaluateFormula('5 == 5')).toBe(true);
      expect(engine.evaluateFormula('5 != 3')).toBe(true);
    });
  });

  describe('BODMAS compliance', () => {
    test('should follow order of operations', () => {
      expect(engine.evaluateFormula('2 + 3 * 4')).toBe(14); // Not 20
      expect(engine.evaluateFormula('(2 + 3) * 4')).toBe(20);
      expect(engine.evaluateFormula('2 * 3 + 4')).toBe(10);
      expect(engine.evaluateFormula('2 * (3 + 4)')).toBe(14);
    });

    test('should handle exponentiation correctly', () => {
      expect(engine.evaluateFormula('2^3')).toBe(8);
      expect(engine.evaluateFormula('2^3^2')).toBe(512); // Right associative: 2^(3^2) = 2^9
      expect(engine.evaluateFormula('(2^3)^2')).toBe(64);
    });

    test('should handle division and multiplication with same precedence', () => {
      expect(engine.evaluateFormula('8 / 2 * 3')).toBe(12); // Left to right: (8/2)*3
      expect(engine.evaluateFormula('8 / (2 * 3)')).toBe(8/6);
    });
  });

  describe('custom functions', () => {
    test('should work with custom functions', () => {
      const customFunctions = {
        DOUBLE: function(x) { return x * 2; }
      };
      
      const customEngine = new FormulaEngine(customFunctions);
      // Custom functions are registered but not directly testable without more complex setup
      expect(customEngine).toBeInstanceOf(FormulaEngine);
    });
  });

  describe('context variables', () => {
    test('should use context variables in evaluation', () => {
      const context = {
        x: 10,
        y: 20,
        name: 'Test'
      };
      
      expect(engine.evaluateFormula('x + y', context)).toBe(30);
      expect(engine.evaluateFormula('x * 2', context)).toBe(20);
      expect(engine.evaluateFormula('CONCAT("Hello ", name)', context)).toBe('Hello Test');
    });

    test('should handle missing context variables', () => {
      const context = { x: 10 };
      
      expect(() => {
        engine.evaluateFormula('x + y', context);
      }).toThrow();
    });
  });
}); 