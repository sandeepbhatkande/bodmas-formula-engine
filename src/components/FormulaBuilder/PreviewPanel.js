import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const PreviewPanel = ({ result, formula, variables = {} }) => {
  const hasResult = result !== null && result !== undefined;
  const isError = typeof result === 'string' && result.startsWith('Error:');
  
  const formatResult = (value) => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'number') {
      // Format numbers with appropriate precision
      if (Number.isInteger(value)) return value.toString();
      return value.toFixed(6).replace(/\.?0+$/, '');
    }
    if (typeof value === 'string') return `"${value}"`;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getResultType = (value) => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string' && !value.startsWith('Error:')) return 'string';
    if (value instanceof Date) return 'date';
    if (typeof value === 'object') return 'object';
    return 'unknown';
  };

  const getResultIcon = () => {
    if (isError) return <ErrorIcon color="error" />;
    if (hasResult) return <CheckCircleIcon color="success" />;
    return <PlayArrowIcon color="action" />;
  };

  const getResultSeverity = () => {
    if (isError) return 'error';
    if (hasResult) return 'success';
    return 'info';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Preview
      </Typography>
      
      <Paper variant="outlined" sx={{ p: 2 }}>
        {/* Formula Display */}
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            Current Formula:
          </Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 1.5, 
              backgroundColor: 'grey.50',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {formula || <Typography color="textSecondary">No formula entered</Typography>}
          </Paper>
        </Box>

        {/* Result Display */}
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            Result:
          </Typography>
          <Alert 
            severity={getResultSeverity()}
            icon={getResultIcon()}
            sx={{ 
              '& .MuiAlert-message': { 
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
              <Typography 
                variant="body2" 
                component="span"
                sx={{ 
                  fontFamily: hasResult && !isError ? 'monospace' : 'inherit',
                  fontWeight: hasResult && !isError ? 'bold' : 'normal'
                }}
              >
                {hasResult 
                  ? formatResult(result)
                  : formula 
                    ? 'Enter a valid formula to see the result'
                    : 'No formula to evaluate'
                }
              </Typography>
              {hasResult && !isError && (
                <Chip 
                  size="small" 
                  label={getResultType(result)}
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          </Alert>
        </Box>

        {/* Performance Info */}
        {hasResult && !isError && (
          <Box mt={2}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="textSecondary">
              Formula evaluated successfully. Results update in real-time as you type.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export { PreviewPanel }; 