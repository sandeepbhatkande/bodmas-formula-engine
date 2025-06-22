import React from 'react';
import {
  Box,
  Typography,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const ValidationPanel = ({ validation }) => {
  const getValidationIcon = () => {
    if (validation.valid) {
      return <CheckCircleIcon color="success" />;
    }
    return <ErrorIcon color="error" />;
  };

  const getValidationMessage = () => {
    if (validation.valid) {
      return 'Formula is valid and ready to use';
    }
    return validation.error || 'Invalid formula syntax';
  };

  const getSuggestions = () => {
    if (validation.valid) return [];

    const suggestions = [];
    const error = validation.error?.toLowerCase() || '';

    // Common error patterns and suggestions
    if (error.includes('unexpected')) {
      suggestions.push({
        type: 'error',
        message: 'Check for missing or extra parentheses, commas, or operators',
        icon: <ErrorIcon color="error" />,
      });
    }

    if (error.includes('function') && error.includes('not defined')) {
      suggestions.push({
        type: 'warning',
        message: 'Function name might be misspelled or not available',
        icon: <WarningIcon color="warning" />,
      });
    }

    if (error.includes('parenthes')) {
      suggestions.push({
        type: 'error',
        message: 'Check that all parentheses are properly matched',
        icon: <ErrorIcon color="error" />,
      });
    }

    if (error.includes('comma') || error.includes('argument')) {
      suggestions.push({
        type: 'info',
        message: 'Verify function parameters are separated by commas',
        icon: <InfoIcon color="info" />,
      });
    }

    if (error.includes('string') || error.includes('quote')) {
      suggestions.push({
        type: 'warning',
        message: 'Ensure text values are enclosed in quotes',
        icon: <WarningIcon color="warning" />,
      });
    }

    // Default suggestions if no specific error pattern matched
    if (suggestions.length === 0 && !validation.valid) {
      suggestions.push(
        {
          type: 'info',
          message: 'Check function names and parameter count',
          icon: <InfoIcon color="info" />,
        },
        {
          type: 'info',
          message: 'Ensure proper use of operators and parentheses',
          icon: <InfoIcon color="info" />,
        }
      );
    }

    return suggestions;
  };

  const getValidationSeverity = () => {
    return validation.valid ? 'success' : 'error';
  };

  const suggestions = getSuggestions();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Validation
      </Typography>
      
      <Paper variant="outlined" sx={{ p: 2 }}>
        {/* Main validation status */}
        <Alert 
          severity={getValidationSeverity()}
          icon={getValidationIcon()}
          sx={{ mb: suggestions.length > 0 ? 2 : 0 }}
        >
          <Typography variant="body2">
            {getValidationMessage()}
          </Typography>
        </Alert>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
              Suggestions:
            </Typography>
            <List dense>
              {suggestions.map((suggestion, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {suggestion.icon}
                  </ListItemIcon>
                  <ListItemText>
                    <Typography variant="body2" color="textSecondary">
                      {suggestion.message}
                    </Typography>
                  </ListItemText>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Formula complexity indicators */}
        {validation.valid && validation.ast && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Formula Analysis:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              <Chip 
                size="small" 
                label={`${getNodeCount(validation.ast)} operations`}
                variant="outlined"
                color="info"
              />
              {hasNestedFunctions(validation.ast) && (
                <Chip 
                  size="small" 
                  label="Nested functions"
                  variant="outlined"
                  color="warning"
                />
              )}
              {hasConditionals(validation.ast) && (
                <Chip 
                  size="small" 
                  label="Conditional logic"
                  variant="outlined"
                  color="primary"
                />
              )}
            </Box>
          </Box>
        )}

        {/* BODMAS order hint */}
        {validation.valid && hasArithmeticOperations(validation.ast) && (
          <Box mt={2}>
            <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
              <Typography variant="caption">
                <strong>BODMAS Order:</strong> Brackets → Orders (powers) → Division/Multiplication → Addition/Subtraction
              </Typography>
            </Alert>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

// Helper functions to analyze AST
const getNodeCount = (node) => {
  if (!node) return 0;
  if (typeof node === 'string' || typeof node === 'number') return 1;
  if (node.type === 'OperatorNode' || node.type === 'FunctionNode') {
    return 1 + (node.args || []).reduce((sum, arg) => sum + getNodeCount(arg), 0);
  }
  return 1;
};

const hasNestedFunctions = (node) => {
  if (!node || typeof node === 'string' || typeof node === 'number') return false;
  if (node.type === 'FunctionNode') {
    return (node.args || []).some(arg => 
      arg.type === 'FunctionNode' || hasNestedFunctions(arg)
    );
  }
  if (node.args) {
    return node.args.some(arg => hasNestedFunctions(arg));
  }
  return false;
};

const hasConditionals = (node) => {
  if (!node || typeof node === 'string' || typeof node === 'number') return false;
  if (node.type === 'FunctionNode' && ['IF', 'AND', 'OR', 'NOT'].includes(node.fn?.name)) {
    return true;
  }
  if (node.args) {
    return node.args.some(arg => hasConditionals(arg));
  }
  return false;
};

const hasArithmeticOperations = (node) => {
  if (!node || typeof node === 'string' || typeof node === 'number') return false;
  if (node.type === 'OperatorNode' && ['+', '-', '*', '/', '^'].includes(node.op)) {
    return true;
  }
  if (node.args) {
    return node.args.some(arg => hasArithmeticOperations(arg));
  }
  return false;
};

export { ValidationPanel }; 