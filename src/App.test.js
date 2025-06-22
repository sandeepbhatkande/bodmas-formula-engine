import { render, screen } from '@testing-library/react';
import App from './App';


test('renders main heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Build Complex Formulas Visually/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders Add Variable button', () => {
  render(<App />);
  const buttonElement = screen.getByText(/Add Variable/i);
  expect(buttonElement).toBeInTheDocument();
});

test('renders Custom Panel switch', () => {
  render(<App />);
  const switchElement = screen.getByText(/Custom Panel/i);
  expect(switchElement).toBeInTheDocument();
}); 