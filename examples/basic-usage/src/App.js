import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Typography, Box, Paper, Alert } from '@mui/material';
import { FormulaBuilder } from 'bodmas-formula-engine';

const theme = createTheme();

function App() {
  const [formula, setFormula] = useState('');
  const [result, setResult] = useState(null);
  const [isValid, setIsValid] = useState(true);

  // Sample variables for the formula
  const variables = {
    price: 100,
    quantity: 5,
    discount: 0.1,
    taxRate: 0.08,
    shippingCost: 15
  };

  const handleFormulaChange = (newFormula, validation) => {
    setFormula(newFormula);
    setIsValid(validation.valid);
    
    if (validation.valid && validation.result !== undefined) {
      setResult(validation.result);
    } else {
      setResult(null);
    }
    
    console.log('Formula:', newFormula);
    console.log('Validation:', validation);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Formula Builder - Basic Usage
        </Typography>
        
        <Typography variant="h6" color="text.secondary" paragraph align="center">
          This example demonstrates the basic usage of the BODMAS Formula Engine.
          Try building formulas using the available variables and functions.
        </Typography>

        <Box mb={3}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Available Variables:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {Object.entries(variables).map(([key, value]) => (
                <Box key={key} sx={{ 
                  px: 2, 
                  py: 1, 
                  bgcolor: 'primary.light', 
                  color: 'primary.contrastText',
                  borderRadius: 1,
                  fontSize: '0.875rem'
                }}>
                  {key}: {value}
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        <FormulaBuilder
          initialFormula={formula}
          onFormulaChange={handleFormulaChange}
          variables={variables}
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
                    <strong>Result:</strong> {result}
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
              Try These Example Formulas:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li><code>price * quantity</code> - Simple multiplication</li>
              <li><code>price * quantity * (1 - discount)</code> - Apply discount</li>
              <li><code>price * quantity * (1 - discount) * (1 + taxRate)</code> - With tax</li>
              <li><code>(price * quantity * (1 - discount) * (1 + taxRate)) + shippingCost</code> - Final total</li>
              <li><code>ROUND(price * quantity * (1 - discount), 2)</code> - Using functions</li>
              <li><code>IF(quantity > 3, price * 0.9, price)</code> - Conditional pricing</li>
              <li><code>MAX(price * quantity, 50)</code> - Minimum order value</li>
            </Box>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App; 