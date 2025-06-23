import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  Container, Typography, Box, Paper, Alert, Chip, 
  Grid, TextField, MenuItem, Card, CardContent,
  Divider, List, ListItem, ListItemText
} from '@mui/material';
import { FormulaBuilder } from 'bodmas-formula-engine';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [formula, setFormula] = useState('');
  const [result, setResult] = useState(null);
  const [isValid, setIsValid] = useState(true);
  
  // E-commerce variables that can be modified
  const [variables, setVariables] = useState({
    basePrice: 99.99,
    quantity: 2,
    customerTier: 'GOLD',
    shippingWeight: 1.5,
    destination: 'domestic',
    couponCode: 'SAVE10',
    loyaltyPoints: 850,
    orderValue: 199.98,
    isFirstOrder: false,
    seasonalPeriod: 'holiday'
  });

  // Predefined pricing formulas
  const pricingFormulas = {
    basic: 'basePrice * quantity',
    withDiscount: 'basePrice * quantity * (1 - TIER_DISCOUNT(customerTier))',
    withTax: 'basePrice * quantity * (1 - TIER_DISCOUNT(customerTier)) * (1 + TAX_RATE(destination))',
    withShipping: 'basePrice * quantity * (1 - TIER_DISCOUNT(customerTier)) * (1 + TAX_RATE(destination)) + SHIPPING_COST(shippingWeight, destination)',
    complete: `
      (basePrice * quantity * SEASONAL_MULTIPLIER(seasonalPeriod) * (1 - TIER_DISCOUNT(customerTier)) * (1 + TAX_RATE(destination))) +
      SHIPPING_COST(shippingWeight, destination) -
      COUPON_DISCOUNT(couponCode, orderValue) -
      LOYALTY_DISCOUNT(loyaltyPoints) +
      IF(isFirstOrder, -10, 0)
    `.replace(/\s+/g, ' ').trim()
  };

  // E-commerce specific custom functions
  const customFunctions = {
    TIER_DISCOUNT: {
      name: 'TIER_DISCOUNT',
      description: 'Customer tier discount rates',
      category: 'E-commerce',
      syntax: 'TIER_DISCOUNT(tier)',
      examples: ['TIER_DISCOUNT("GOLD")', 'TIER_DISCOUNT(customerTier)'],
      execute: (tier) => {
        const rates = { PLATINUM: 0.20, GOLD: 0.15, SILVER: 0.10, BRONZE: 0.05 };
        return rates[tier] || 0;
      }
    },
    
    TAX_RATE: {
      name: 'TAX_RATE',
      description: 'Tax rate based on destination',
      category: 'E-commerce',
      syntax: 'TAX_RATE(destination)',
      examples: ['TAX_RATE("domestic")', 'TAX_RATE(destination)'],
      execute: (dest) => {
        const rates = { domestic: 0.08, international: 0.0, eu: 0.20 };
        return rates[dest] || 0.05;
      }
    },
    
    SHIPPING_COST: {
      name: 'SHIPPING_COST',
      description: 'Calculate shipping cost',
      category: 'E-commerce',
      syntax: 'SHIPPING_COST(weight, destination)',
      examples: ['SHIPPING_COST(1.5, "domestic")'],
      execute: (weight, dest) => {
        const baseCosts = { domestic: 5, international: 25, eu: 15 };
        const baseCost = baseCosts[dest] || 10;
        return baseCost + (weight * 2);
      }
    },
    
    COUPON_DISCOUNT: {
      name: 'COUPON_DISCOUNT',
      description: 'Apply coupon discount',
      category: 'E-commerce',
      syntax: 'COUPON_DISCOUNT(code, orderValue)',
      examples: ['COUPON_DISCOUNT("SAVE10", 100)'],
      execute: (code, orderValue) => {
        const coupons = {
          'SAVE10': Math.min(orderValue * 0.1, 50),
          'SAVE20': Math.min(orderValue * 0.2, 100),
          'FLAT15': 15,
          'NEWUSER': 25
        };
        return coupons[code] || 0;
      }
    },
    
    LOYALTY_DISCOUNT: {
      name: 'LOYALTY_DISCOUNT',
      description: 'Loyalty points discount',
      category: 'E-commerce',
      syntax: 'LOYALTY_DISCOUNT(points)',
      examples: ['LOYALTY_DISCOUNT(850)'],
      execute: (points) => {
        return Math.floor(points / 100) * 2.5; // $2.50 per 100 points
      }
    },
    
    SEASONAL_MULTIPLIER: {
      name: 'SEASONAL_MULTIPLIER',
      description: 'Seasonal pricing adjustment',
      category: 'E-commerce',
      syntax: 'SEASONAL_MULTIPLIER(period)',
      examples: ['SEASONAL_MULTIPLIER("holiday")'],
      execute: (period) => {
        const multipliers = { 
          holiday: 1.1, 
          summer: 0.95, 
          backtoschool: 1.05, 
          regular: 1.0 
        };
        return multipliers[period] || 1.0;
      }
    },
    
    BULK_TIER: {
      name: 'BULK_TIER',
      description: 'Bulk purchase tier discount',
      category: 'E-commerce',
      syntax: 'BULK_TIER(quantity)',
      examples: ['BULK_TIER(10)'],
      execute: (qty) => {
        if (qty >= 50) return 0.25;
        if (qty >= 20) return 0.15;
        if (qty >= 10) return 0.10;
        if (qty >= 5) return 0.05;
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

  const handleVariableChange = (key, value) => {
    setVariables(prev => ({
      ...prev,
      [key]: key === 'isFirstOrder' ? value === 'true' : 
             ['basePrice', 'quantity', 'shippingWeight', 'loyaltyPoints', 'orderValue'].includes(key) 
             ? parseFloat(value) || 0 : value
    }));
  };

  const loadFormula = (formulaKey) => {
    setFormula(pricingFormulas[formulaKey]);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          E-commerce Pricing Calculator
        </Typography>
        
        <Typography variant="h6" color="text.secondary" paragraph align="center">
          Advanced pricing formula builder for e-commerce platforms with real-world business logic.
        </Typography>

        <Grid container spacing={3}>
          {/* Left Panel - Variables Control */}
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Product & Order Variables
              </Typography>
              
              <TextField
                fullWidth
                label="Base Price"
                type="number"
                value={variables.basePrice}
                onChange={(e) => handleVariableChange('basePrice', e.target.value)}
                sx={{ mb: 2 }}
                inputProps={{ step: 0.01 }}
              />
              
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={variables.quantity}
                onChange={(e) => handleVariableChange('quantity', e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                select
                label="Customer Tier"
                value={variables.customerTier}
                onChange={(e) => handleVariableChange('customerTier', e.target.value)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="BRONZE">Bronze (5%)</MenuItem>
                <MenuItem value="SILVER">Silver (10%)</MenuItem>
                <MenuItem value="GOLD">Gold (15%)</MenuItem>
                <MenuItem value="PLATINUM">Platinum (20%)</MenuItem>
              </TextField>
              
              <TextField
                fullWidth
                label="Shipping Weight (kg)"
                type="number"
                value={variables.shippingWeight}
                onChange={(e) => handleVariableChange('shippingWeight', e.target.value)}
                sx={{ mb: 2 }}
                inputProps={{ step: 0.1 }}
              />
              
              <TextField
                fullWidth
                select
                label="Destination"
                value={variables.destination}
                onChange={(e) => handleVariableChange('destination', e.target.value)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="domestic">Domestic (8% tax)</MenuItem>
                <MenuItem value="international">International (0% tax)</MenuItem>
                <MenuItem value="eu">EU (20% tax)</MenuItem>
              </TextField>
              
              <TextField
                fullWidth
                select
                label="Coupon Code"
                value={variables.couponCode}
                onChange={(e) => handleVariableChange('couponCode', e.target.value)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="">No Coupon</MenuItem>
                <MenuItem value="SAVE10">SAVE10 (10% up to $50)</MenuItem>
                <MenuItem value="SAVE20">SAVE20 (20% up to $100)</MenuItem>
                <MenuItem value="FLAT15">FLAT15 ($15 off)</MenuItem>
                <MenuItem value="NEWUSER">NEWUSER ($25 off)</MenuItem>
              </TextField>
              
              <TextField
                fullWidth
                label="Loyalty Points"
                type="number"
                value={variables.loyaltyPoints}
                onChange={(e) => handleVariableChange('loyaltyPoints', e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                select
                label="First Order"
                value={variables.isFirstOrder.toString()}
                onChange={(e) => handleVariableChange('isFirstOrder', e.target.value)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="false">No</MenuItem>
                <MenuItem value="true">Yes ($10 discount)</MenuItem>
              </TextField>
              
              <TextField
                fullWidth
                select
                label="Seasonal Period"
                value={variables.seasonalPeriod}
                onChange={(e) => handleVariableChange('seasonalPeriod', e.target.value)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="regular">Regular (1.0x)</MenuItem>
                <MenuItem value="holiday">Holiday (1.1x)</MenuItem>
                <MenuItem value="summer">Summer (0.95x)</MenuItem>
                <MenuItem value="backtoschool">Back to School (1.05x)</MenuItem>
              </TextField>
            </Paper>

            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Quick Formula Templates
              </Typography>
              <List dense>
                <ListItem button onClick={() => loadFormula('basic')}>
                  <ListItemText primary="Basic Pricing" secondary="Price × Quantity" />
                </ListItem>
                <ListItem button onClick={() => loadFormula('withDiscount')}>
                  <ListItemText primary="With Tier Discount" secondary="Apply customer tier discount" />
                </ListItem>
                <ListItem button onClick={() => loadFormula('withTax')}>
                  <ListItemText primary="With Tax" secondary="Include tax calculation" />
                </ListItem>
                <ListItem button onClick={() => loadFormula('withShipping')}>
                  <ListItemText primary="With Shipping" secondary="Add shipping costs" />
                </ListItem>
                <ListItem button onClick={() => loadFormula('complete')}>
                  <ListItemText primary="Complete Formula" secondary="All discounts & fees" />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Right Panel - Formula Builder */}
          <Grid item xs={12} md={9}>
            <FormulaBuilder
              initialFormula={formula}
              onFormulaChange={handleFormulaChange}
              variables={variables}
              customFunctions={customFunctions}
            />

            {/* Results Panel */}
            {formula && (
              <Box mt={3}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Pricing Calculation Result
                    </Typography>
                    
                    <Typography variant="body1" fontFamily="monospace" sx={{ 
                      bgcolor: 'grey.100', 
                      p: 1, 
                      borderRadius: 1,
                      mb: 2,
                      fontSize: '0.875rem'
                    }}>
                      {formula}
                    </Typography>
                    
                    {result !== null && isValid && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <Typography variant="h6">
                          <strong>Final Price: ${typeof result === 'number' ? result.toFixed(2) : result}</strong>
                        </Typography>
                      </Alert>
                    )}
                    
                    {!isValid && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="body1">
                          Formula contains errors. Please check the validation panel.
                        </Typography>
                      </Alert>
                    )}

                    {/* Price Breakdown */}
                    {result !== null && isValid && (
                      <Box>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          Price Breakdown:
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2">
                              Base Price: ${variables.basePrice.toFixed(2)} × {variables.quantity}
                            </Typography>
                            <Typography variant="body2">
                              Subtotal: ${(variables.basePrice * variables.quantity).toFixed(2)}
                            </Typography>
                            <Typography variant="body2">
                              Tier Discount ({variables.customerTier}): -${(variables.basePrice * variables.quantity * customFunctions.TIER_DISCOUNT.execute(variables.customerTier)).toFixed(2)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">
                              Tax ({variables.destination}): +${(variables.basePrice * variables.quantity * customFunctions.TAX_RATE.execute(variables.destination)).toFixed(2)}
                            </Typography>
                            <Typography variant="body2">
                              Shipping: +${customFunctions.SHIPPING_COST.execute(variables.shippingWeight, variables.destination).toFixed(2)}
                            </Typography>
                            <Typography variant="body2">
                              Loyalty Discount: -${customFunctions.LOYALTY_DISCOUNT.execute(variables.loyaltyPoints).toFixed(2)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App; 