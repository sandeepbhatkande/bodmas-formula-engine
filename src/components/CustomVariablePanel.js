import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Storage as VariablesIcon,
} from '@mui/icons-material';

const CustomVariablePanel = ({ 
  variables = {}, 
  onVariableInsert, 
  onFunctionInsert, 
  engine 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter variables based on search term
  const filteredVariables = Object.entries(variables).filter(([name, value]) =>
    !searchTerm || 
    name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(value).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group variables by type
  const groupedVariables = filteredVariables.reduce((acc, [name, value]) => {
    const type = typeof value === 'object' && value !== null ? 'object' : typeof value;
    if (!acc[type]) acc[type] = [];
    acc[type].push([name, value]);
    return acc;
  }, {});

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'number': return 'primary';
      case 'string': return 'secondary';
      case 'boolean': return 'success';
      case 'object': return 'warning';
      default: return 'default';
    }
  };

  const variableCount = Object.keys(variables).length;

  return (
    <Box className="variable-palette" sx={{ 
      padding: '0 1rem 1rem 1rem',
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Search for Variables */}
      <Box className="search-input" sx={{ marginBottom: '1rem', width: '100%' }}>
        <TextField
          size="small"
          placeholder="Search variables..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchTerm('')}
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              background: 'white',
              width: '100%'
            }
          }}
        />
      </Box>

      <Box sx={{ height: 'calc(100% - 80px)', overflowY: 'auto' }}>
        {variableCount > 0 ? (
          Object.keys(groupedVariables).length === 0 ? (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center"
              sx={{ height: '60%', p: 3, textAlign: 'center' }}
            >
              <VariablesIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Variables Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search terms.
              </Typography>
            </Box>
          ) : (
            Object.entries(groupedVariables).map(([type, vars]) => (
              <Box key={type} className="variables-section" sx={{ marginBottom: '1rem', width: '100%' }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  {type.toUpperCase()} ({vars.length})
                </Typography>
                <Box className="variable-chips" sx={{ 
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.375rem',
                  marginTop: '0.5rem',
                  width: '100%'
                }}>
                  {vars.map(([name, value]) => (
                    <Chip
                      key={name}
                      className="variable-chip"
                      label={`${name}: ${formatValue(value)}`}
                      variant="outlined"
                      size="small"
                      color={getTypeColor(typeof value === 'object' && value !== null ? 'object' : typeof value)}
                      onClick={() => onVariableInsert?.(name)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onVariableInsert?.(name);
                        }
                      }}
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            ))
          )
        ) : (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center"
            sx={{ height: '60%', p: 3, textAlign: 'center' }}
          >
            <VariablesIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Variables Available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Variables will appear here when you provide them to the Formula Builder.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Variables can be numbers, text, dates, or other data types that you want to reference in your formulas.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CustomVariablePanel; 