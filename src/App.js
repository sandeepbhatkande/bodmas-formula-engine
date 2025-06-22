import React, { useState } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Container, 
  Typography, 
  Box,
  AppBar,
  Toolbar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Calculate as CalculateIcon,
  Add as AddIcon,
  SwapHoriz as SwapIcon
} from '@mui/icons-material';
import FormulaBuilder from './components/FormulaBuilder';
import CustomVariablePanel from './components/CustomVariablePanel';
import './App.scss';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  const [formula, setFormula] = useState('');
  const [variables, setVariables] = useState({
    price: 100,
    quantity: 5,
    discount: 0.1,
    taxRate: 0.08,
    customerName: 'John Doe',
    isVIP: true,
  });
  const [variableDialogOpen, setVariableDialogOpen] = useState(false);
  const [newVarName, setNewVarName] = useState('');
  const [newVarValue, setNewVarValue] = useState('');
  const [useCustomVariablePanel, setUseCustomVariablePanel] = useState(false);

  // Custom variables that can override default variables
  const customVariables = {
    // These could come from an external API or user configuration
    businessRules: {
      maxDiscount: 0.5,
      minOrderAmount: 50,
      vipDiscountMultiplier: 1.2
    },
    // Override some default variables
    taxRate: 0.12, // This will override the default taxRate
    shippingCost: 15.99
  };

  // Custom functions for the formula engine
  const customFunctions = {
    DISCOUNT: function(price, discountPercent) {
      return price * (1 - discountPercent);
    },
    TAX: function(amount, taxRate) {
      return amount * taxRate;
    },
    TOTAL: function(subtotal, tax) {
      return subtotal + tax;
    },
  };

  const handleFormulaChange = (newFormula, validationResult) => {
    setFormula(newFormula);
  };

  const handleAddVariable = () => {
    if (newVarName && newVarValue !== '') {
      let value = newVarValue;
      
      // Try to parse as number
      if (!isNaN(newVarValue) && newVarValue !== '') {
        value = parseFloat(newVarValue);
      }
      // Try to parse as boolean
      else if (newVarValue.toLowerCase() === 'true') {
        value = true;
      } else if (newVarValue.toLowerCase() === 'false') {
        value = false;
      }
      
      setVariables(prev => ({
        ...prev,
        [newVarName]: value
      }));
      
      setNewVarName('');
      setNewVarValue('');
      setVariableDialogOpen(false);
    }
  };

  const handleRemoveVariable = (varName) => {
    const newVars = { ...variables };
    delete newVars[varName];
    setVariables(newVars);
  };

  // Merge all variables for display (custom variables override default ones)
  const allVariables = { ...variables, ...customVariables };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <CalculateIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              BODMAS Formula Builder
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={useCustomVariablePanel}
                  onChange={(e) => setUseCustomVariablePanel(e.target.checked)}
                  color="secondary"
                />
              }
              label="Custom Panel"
              sx={{ color: 'white', mr: 2 }}
            />
            <Button 
              color="inherit" 
              startIcon={<AddIcon />}
              onClick={() => setVariableDialogOpen(true)}
            >
              Add Variable
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* Header Section */}
          <Box mb={4}>
            <Typography variant="h4" gutterBottom>
              Build Complex Formulas Visually
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Create and test mathematical expressions with real-time validation, 
              syntax highlighting, and BODMAS compliance. Perfect for business rules, 
              calculations, and data transformations.
            </Typography>
            
            {/* Panel Type Indicator */}
            <Box mb={2}>
              <Chip
                icon={<SwapIcon />}
                label={useCustomVariablePanel ? "Using Custom Variable Panel" : "Using Default Variable Panel"}
                color={useCustomVariablePanel ? "secondary" : "primary"}
                variant="outlined"
              />
            </Box>
            
            {/* Current Variables */}
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Available Variables:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {Object.entries(allVariables).map(([name, value]) => (
                  <Chip
                    key={name}
                    label={`${name}: ${JSON.stringify(value)}`}
                    variant="outlined"
                    size="small"
                    onDelete={variables.hasOwnProperty(name) ? () => handleRemoveVariable(name) : undefined}
                    color={customVariables.hasOwnProperty(name) ? "secondary" : "primary"}
                    title={customVariables.hasOwnProperty(name) ? "Custom Variable" : "Default Variable"}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          {/* Formula Builder */}
          <FormulaBuilder
            initialFormula={formula}
            variables={variables}
            customVariables={customVariables}
            customVariableComponent={useCustomVariablePanel ? CustomVariablePanel : null}
            customFunctions={customFunctions}
            onFormulaChange={handleFormulaChange}
          />
        </Container>

        {/* Add Variable Dialog */}
        <Dialog open={variableDialogOpen} onClose={() => setVariableDialogOpen(false)}>
          <DialogTitle>Add New Variable</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} minWidth={300}>
              <TextField
                label="Variable Name"
                value={newVarName}
                onChange={(e) => setNewVarName(e.target.value)}
                fullWidth
                helperText="Use letters, numbers, and underscores only"
              />
              <TextField
                label="Variable Value"
                value={newVarValue}
                onChange={(e) => setNewVarValue(e.target.value)}
                fullWidth
                helperText="Enter a number, text (in quotes), true, or false"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setVariableDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddVariable} 
              variant="contained"
              disabled={!newVarName || newVarValue === ''}
            >
              Add Variable
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default App; 