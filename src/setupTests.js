// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock ResizeObserver for components that use it (more robust implementation)
class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    // Do nothing
  }
  unobserve() {
    // Do nothing  
  }
  disconnect() {
    // Do nothing
  }
}

global.ResizeObserver = ResizeObserver;
window.ResizeObserver = ResizeObserver;

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollTo for components that use it
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock getComputedStyle for components that need styling calculations
const mockComputedStyle = {
  getPropertyValue: jest.fn().mockReturnValue(''),
  visibility: 'visible',
  pointerEvents: 'auto',
  display: 'block',
  position: 'static',
  top: '0px',
  left: '0px',
  width: '100px',
  height: '100px',
  margin: '0px',
  padding: '0px',
  border: '0px',
  fontSize: '16px',
  fontFamily: 'Arial',
  color: 'rgb(0, 0, 0)',
  backgroundColor: 'rgb(255, 255, 255)',
  // Add any other CSS properties that components might access
};

Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockComputedStyle),
});

// Suppress console warnings in tests unless explicitly testing for them
const originalWarn = console.warn;
const originalError = console.error;

beforeEach(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

// Global test utilities
global.testUtils = {
  // Helper to wait for async operations
  waitForAsyncOperations: () => new Promise(resolve => setTimeout(resolve, 0)),
  
  // Helper to create mock functions with common patterns
  createMockCallback: (returnValue) => jest.fn().mockReturnValue(returnValue),
  
  // Helper to simulate user interactions
  simulateKeyPress: (element, key) => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key }));
    element.dispatchEvent(new KeyboardEvent('keyup', { key }));
  },
  
  // Helper to check if element has specific class
  hasClass: (element, className) => element.classList.contains(className),
  
  // Helper to get element by test id with error message
  getByTestIdWithError: (container, testId) => {
    const element = container.querySelector(`[data-testid="${testId}"]`);
    if (!element) {
      throw new Error(`Element with data-testid="${testId}" not found`);
    }
    return element;
  }
};

// Custom jest matchers
expect.extend({
  toHaveValidationError(received, expectedError) {
    const hasError = received && received.error && received.error.includes(expectedError);
    if (hasError) {
      return {
        message: () => `expected validation not to have error "${expectedError}"`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected validation to have error "${expectedError}", but got ${received?.error || 'no error'}`,
        pass: false,
      };
    }
  },
  
  toBeValidFormula(received) {
    const isValid = received && received.valid === true && !received.error;
    if (isValid) {
      return {
        message: () => `expected formula validation to be invalid`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected formula validation to be valid, but got ${JSON.stringify(received)}`,
        pass: false,
      };
    }
  }
});

// Set up default timeout for async tests
jest.setTimeout(10000); 