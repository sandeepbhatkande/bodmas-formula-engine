import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Typography, Box, Paper, Alert, Chip } from '@mui/material';
import { FormulaBuilder } from 'bodmas-formula-engine';

const theme = createTheme();

function App() {
  const [formula, setFormula] = useState('');
  const [result, setResult] = useState(null);
  const [isValid, setIsValid] = useState(true);

  // Sample variables
  const variables = {
    price: 100,
    quantity: 5,
    customerType: 'VIP',
    orderDate: '2024-01-15',
    productCategory: 'Electronics',
    customerAge: 28,
    loyaltyPoints: 1500
  };

  // Custom functions for business logic
  const customFunctions = {
    DISCOUNT: {
      name: 'DISCOUNT',
      description: 'Calculate discount based on customer type',
      category: 'Business',
      syntax: 'DISCOUNT(amount, customerType)',
      examples: ['DISCOUNT(100, "VIP")', 'DISCOUNT(price, customerType)'],
      execute: (amount, customerType) => {
        const discountRates = { 
          VIP: 0.2, 
          PREMIUM: 0.15, 
          REGULAR: 0.1, 
          NEW: 0.05 
        };
        return amount * (discountRates[customerType] || 0);
      }
    },
    
    LOYALTY_BONUS: {
      name: 'LOYALTY_BONUS',
      description: 'Calculate loyalty bonus based on points',
      category: 'Business',
      syntax: 'LOYALTY_BONUS(points)',
      examples: ['LOYALTY_BONUS(1500)', 'LOYALTY_BONUS(loyaltyPoints)'],
      execute: (points) => {
        if (points >= 2000) return 50;
        if (points >= 1000) return 25;
        if (points >= 500) return 10;
        return 0;
      }
    },
    
    AGE_DISCOUNT: {
      name: 'AGE_DISCOUNT',
      description: 'Senior citizen or student discount',
      category: 'Business',
      syntax: 'AGE_DISCOUNT(age, amount)',
      examples: ['AGE_DISCOUNT(65, 100)', 'AGE_DISCOUNT(customerAge, price)'],
      execute: (age, amount) => {
        if (age >= 65) return amount * 0.15; // Senior discount
        if (age <= 25) return amount * 0.1;  // Student discount
        return 0;
      }
    },
    
    SEASONAL_MULTIPLIER: {
      name: 'SEASONAL_MULTIPLIER',
      description: 'Apply seasonal pricing multiplier',
      category: 'Business',
      syntax: 'SEASONAL_MULTIPLIER(date, amount)',
      examples: ['SEASONAL_MULTIPLIER("2024-12-25", 100)'],
      execute: (dateStr, amount) => {
        const date = new Date(dateStr);
        const month = date.getMonth() + 1;
        
        // Holiday season (Nov-Dec)
        if (month >= 11) return amount * 1.2;
        // Summer season (Jun-Aug)
        if (month >= 6 && month <= 8) return amount * 1.1;
        // Regular season
        return amount;
      }
    },
    
    CATEGORY_TAX: {
      name: 'CATEGORY_TAX',
      description: 'Calculate tax based on product category',
      category: 'Business',
      syntax: 'CATEGORY_TAX(category, amount)',
      examples: ['CATEGORY_TAX("Electronics", 100)', 'CATEGORY_TAX(productCategory, price)'],
      execute: (category, amount) => {
        const taxRates = {
          'Electronics': 0.08,
          'Clothing': 0.06,
          'Food': 0.02,
          'Books': 0.0,
          'Luxury': 0.15
        };
        return amount * (taxRates[category] || 0.05);
      }
    },
    
    BULK_DISCOUNT: {
      name: 'BULK_DISCOUNT',
      description: 'Volume-based discount calculation',
      category: 'Business',
      syntax: 'BULK_DISCOUNT(quantity, unitPrice)',
      examples: ['BULK_DISCOUNT(10, 50)', 'BULK_DISCOUNT(quantity, price)'],
      execute: (qty, unitPrice) => {
        const total = qty * unitPrice;
        if (qty >= 100) return total * 0.25;
        if (qty >= 50) return total * 0.20;
        if (qty >= 20) return total * 0.15;
        if (qty >= 10) return total * 0.10;
        return 0;
      }
    }
  };

  const handleFormulaChange = (newFormula, validation) => {
    setFormula(newFormula);
    setIsValid(validation.valid);
    
    if (validation.valid && validation.result !== undefined) {
      setResult(validation.result);
    } else {
      setResult(null);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Formula Builder - Custom Functions
        </Typography>
        
        <Typography variant="h6" color="text.secondary" paragraph align="center">
          This example demonstrates how to add custom business logic functions to the formula builder.
        </Typography>

        <Box mb={3}>
          <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Available Variables:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {Object.entries(variables).map(([key, value]) => (
                <Chip 
                  key={key} 
                  label={`${key}: ${value}`} 
                  variant="outlined" 
                  color="primary"
                />
              ))}
            </Box>
          </Paper>

          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Custom Business Functions:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {Object.keys(customFunctions).map((funcName) => (
                <Chip 
                  key={funcName} 
                  label={funcName} 
                  variant="filled" 
                  color="secondary"
                />
              ))}
            </Box>
          </Paper>
        </Box>

        <FormulaBuilder
          initialFormula={formula}
          onFormulaChange={handleFormulaChange}
          variables={variables}
          customFunctions={customFunctions}
        />

        {formula && (
          <Box mt={3}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Current Formula:
              </Typography>
              <Typography variant="body1" fontFamily="monospace" sx={{ 
                bgcolor: 'grey.100', 
                p: 1, 
                borderRadius: 1,
                mb: 2 
              }}>
                {formula || 'No formula entered'}
              </Typography>
              
              {result !== null && isValid && (
                <Alert severity="success">
                  <Typography variant="body1">
                    <strong>Result:</strong> {typeof result === 'number' ? result.toFixed(2) : result}
                  </Typography>
                </Alert>
              )}
              
              {!isValid && (
                <Alert severity="error">
                  <Typography variant="body1">
                    Formula contains errors. Please check the validation panel.
                  </Typography>
                </Alert>
              )}
            </Paper>
          </Box>
        )}

        <Box mt={4}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Try These Custom Function Examples:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li><code>DISCOUNT(price, customerType)</code> - Apply customer type discount</li>
              <li><code>price - DISCOUNT(price, customerType)</code> - Price after discount</li>
              <li><code>LOYALTY_BONUS(loyaltyPoints)</code> - Get loyalty bonus amount</li>
              <li><code>AGE_DISCOUNT(customerAge, price)</code> - Age-based discount</li>
              <li><code>SEASONAL_MULTIPLIER(orderDate, price)</code> - Seasonal pricing</li>
              <li><code>CATEGORY_TAX(productCategory, price)</code> - Category-based tax</li>
              <li><code>BULK_DISCOUNT(quantity, price)</code> - Volume discount</li>
              <li>
                <code>
                  price * quantity - DISCOUNT(price * quantity, customerType) + 
                  CATEGORY_TAX(productCategory, price * quantity) + 
                  LOYALTY_BONUS(loyaltyPoints)
                </code>
                <br />
                <small>- Complex pricing formula</small>
              </li>
            </Box>
          </Paper>
        </Box>

        <Box mt={4}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              How to Add Custom Functions:
            </Typography>
            <Typography variant="body2" component="pre" sx={{ 
              bgcolor: 'grey.50', 
              p: 2, 
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}>
{`const customFunctions = {
  DISCOUNT: {
    name: 'DISCOUNT',
    description: 'Calculate discount based on customer type',
    category: 'Business',
    syntax: 'DISCOUNT(amount, customerType)',
    examples: ['DISCOUNT(100, "VIP")'],
    execute: (amount, customerType) => {
      const discountRates = { VIP: 0.2, REGULAR: 0.1 };
      return amount * (discountRates[customerType] || 0);
    }
  }
};

<FormulaBuilder
  customFunctions={customFunctions}
  // ... other props
/>`}
            </Typography>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App; 