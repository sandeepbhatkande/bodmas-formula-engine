import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Functions as FunctionsIcon,
  Calculate as CalculateIcon,
  Code as CodeIcon,
  DateRange as DateRangeIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Build as BuildIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const FunctionPalette = ({ 
  onFunctionInsert, 
  onVariableInsert, 
  variables = [], 
  engine,
  showVariables = true,
  showHeader = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPanel, setExpandedPanel] = useState('string');
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState(null);

  // Dynamically build function categories from engine metadata
  const functionCategories = useMemo(() => {
    if (!engine) return {};
    
    const metadata = engine.getFunctionSuggestions();
    const categories = {};
    
    // Category configuration with icons and display names
    const categoryConfig = {
      string: {
        name: 'String Functions',
        icon: <CodeIcon />,
        order: 1
      },
      math: {
        name: 'Math Functions',
        icon: <CalculateIcon />,
        order: 2
      },
      statistical: {
        name: 'Statistical Functions',
        icon: <TrendingUpIcon />,
        order: 3
      },
      logical: {
        name: 'Logical Functions',
        icon: <FunctionsIcon />,
        order: 4
      },
      date: {
        name: 'Date Functions',
        icon: <DateRangeIcon />,
        order: 5
      },
      financial: {
        name: 'Financial Functions',
        icon: <AccountBalanceIcon />,
        order: 6
      },
      utility: {
        name: 'Utility Functions',
        icon: <BuildIcon />,
        order: 7
      }
    };
    
    // Group functions by category
    metadata.forEach(func => {
      const category = func.category || 'utility';
      if (!categories[category]) {
        categories[category] = {
          ...categoryConfig[category] || {
            name: category.charAt(0).toUpperCase() + category.slice(1) + ' Functions',
            icon: <FunctionsIcon />,
            order: 99
          },
          functions: []
        };
      }
      
      categories[category].functions.push({
        name: func.name,
        signature: func.signature,
        description: func.description,
        insertText: func.insertText,
        example: func.example,
      });
    });
    
    // Sort functions within each category alphabetically
    Object.values(categories).forEach(category => {
      category.functions.sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return categories;
  }, [engine]);

  const operators = [
    { symbol: '+', name: 'Addition', insertText: ' + ' },
    { symbol: '-', name: 'Subtraction', insertText: ' - ' },
    { symbol: '*', name: 'Multiplication', insertText: ' * ' },
    { symbol: '/', name: 'Division', insertText: ' / ' },
    { symbol: '^', name: 'Exponentiation', insertText: ' ^ ' },
    { symbol: '%', name: 'Modulo', insertText: ' % ' },
    { symbol: '(', name: 'Open Parenthesis', insertText: '(' },
    { symbol: ')', name: 'Close Parenthesis', insertText: ')' },
    { symbol: '=', name: 'Equal', insertText: ' = ' },
    { symbol: '>', name: 'Greater Than', insertText: ' > ' },
    { symbol: '<', name: 'Less Than', insertText: ' < ' },
    { symbol: '>=', name: 'Greater Than or Equal', insertText: ' >= ' },
    { symbol: '<=', name: 'Less Than or Equal', insertText: ' <= ' },
    { symbol: '!=', name: 'Not Equal', insertText: ' != ' },
  ];

  // Filter functions based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return functionCategories;
    
    const filtered = {};
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    Object.entries(functionCategories).forEach(([key, category]) => {
      const filteredFunctions = category.functions.filter(func =>
        func.name.toLowerCase().includes(lowerSearchTerm) ||
        func.description.toLowerCase().includes(lowerSearchTerm) ||
        func.signature.toLowerCase().includes(lowerSearchTerm)
      );
      
      if (filteredFunctions.length > 0) {
        filtered[key] = {
          ...category,
          functions: filteredFunctions
        };
      }
    });
    
    return filtered;
  }, [functionCategories, searchTerm]);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const handleFunctionClick = (func) => {
    onFunctionInsert(func.insertText);
  };

  const handleOperatorClick = (operator) => {
    onFunctionInsert(operator.insertText);
  };

  const handleVariableClick = (variable) => {
    onVariableInsert(variable);
  };

  const handleHelpClick = (func, event) => {
    event.stopPropagation();
    setSelectedFunction(func);
    setHelpDialogOpen(true);
  };

  const handleHelpClose = () => {
    setHelpDialogOpen(false);
    setSelectedFunction(null);
  };

  // Sort categories by order
  const sortedCategories = Object.entries(filteredCategories).sort(([,a], [,b]) => 
    (a.order || 99) - (b.order || 99)
  );

  return (
    <Box className="function-palette">
      {showHeader && (
        <Typography variant="h6" gutterBottom>
          Function Palette
        </Typography>
      )}
      
      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search functions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 2 }}
      />

      {/* Variables - only show if showVariables is true */}
      {showVariables && variables.length > 0 && (
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            Variables
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {variables.map((variable) => (
              <Chip
                key={variable}
                label={variable}
                size="small"
                onClick={() => handleVariableClick(variable)}
                clickable
                color="secondary"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Operators */}
      <Box mb={2}>
        <Typography variant="subtitle2" gutterBottom>
          Operators
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {operators.map((operator) => (
            <Tooltip
              key={operator.symbol}
              title={operator.name}
              placement="bottom"
            >
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleOperatorClick(operator)}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                {operator.symbol}
              </Button>
            </Tooltip>
          ))}
        </Box>
      </Box>

      {/* Function Categories */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Functions
        </Typography>
        <Box sx={{ 
          maxHeight: '270px', 
          overflow: 'auto',
          pr: 1 // Add some padding to account for scrollbar
        }}>
          {sortedCategories.map(([categoryKey, category]) => (
            <Accordion
              key={categoryKey}
              expanded={expandedPanel === categoryKey}
              onChange={handleAccordionChange(categoryKey)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1}>
                  {category.icon}
                  <Typography variant="body2" fontWeight="medium">
                    {category.name} ({category.functions.length})
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="flex" flexDirection="column" gap={1}>
                  {category.functions.map((func) => (
                    <Box key={func.name} sx={{ position: 'relative' }}>
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        onClick={() => handleFunctionClick(func)}
                        sx={{ 
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          mb: 0.5,
                          pr: 5, // Add padding to make room for help icon
                        }}
                      >
                        <Box sx={{ textAlign: 'left', width: '100%' }}>
                          <Typography variant="body2" component="div" sx={{ fontWeight: 'bold' }}>
                            {func.name}
                          </Typography>
                          <Typography variant="caption" component="div" color="text.secondary">
                            {func.description}
                          </Typography>
                        </Box>
                      </Button>
                      <Tooltip title="Function Help" placement="top">
                        <IconButton
                          size="small"
                          onClick={(e) => handleHelpClick(func, e)}
                          className="function-help-icon"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            zIndex: 1,
                          }}
                        >
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>

      {/* Help Dialog */}
      <Dialog
        open={helpDialogOpen}
        onClose={handleHelpClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Function Help: {selectedFunction?.name}
            </Typography>
            <IconButton
              onClick={handleHelpClose}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedFunction && (
            <Box>
              <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Signature
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', backgroundColor: 'grey.100', p: 1, borderRadius: 1 }}>
                  {selectedFunction.signature}
                </Typography>
              </Paper>

              <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Description
                </Typography>
                <Typography variant="body1">
                  {selectedFunction.description}
                </Typography>
              </Paper>

              {selectedFunction.example && (
                <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Example
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', backgroundColor: 'grey.100', p: 1, borderRadius: 1 }}>
                    {selectedFunction.example}
                  </Typography>
                </Paper>
              )}

              {selectedFunction.returnType && (
                <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Return Type
                  </Typography>
                  <Chip 
                    label={selectedFunction.returnType} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </Paper>
              )}

              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Parameters
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedFunction.signature?.match(/\((.*?)\)/)?.[1] || 'No parameters'}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              handleFunctionClick(selectedFunction);
              handleHelpClose();
            }}
            variant="contained"
            disabled={!selectedFunction}
          >
            Insert Function
          </Button>
          <Button onClick={handleHelpClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export { FunctionPalette }; 