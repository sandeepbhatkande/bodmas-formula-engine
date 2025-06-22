import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Tooltip,
  Badge,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GetApp as ExportIcon,
  Publish as ImportIcon,
} from '@mui/icons-material';

const ITEMS_PER_PAGE = 50;

const VariablePalette = ({ 
  variableManager, 
  onVariableInsert, 
  onVariableEdit,
  onVariableDelete,
  onVariableAdd 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCategories, setExpandedCategories] = useState(new Set(['user']));
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [viewMode, setViewMode] = useState('categorized'); // 'categorized' | 'list'

  // Get variables and categories
  const categories = useMemo(() => {
    return variableManager?.getCategories() || [];
  }, [variableManager]);

  const filteredVariables = useMemo(() => {
    if (!variableManager) return [];

    if (searchTerm.trim()) {
      return variableManager.searchVariables(searchTerm, {
        category: selectedCategory !== 'all' ? selectedCategory : null,
        type: selectedType !== 'all' ? selectedType : null,
        limit: 1000 // Get all for search
      });
    }

    // Get variables by category
    if (selectedCategory !== 'all') {
      return variableManager.getVariablesByCategory(selectedCategory)
        .filter(v => selectedType === 'all' || v.type === selectedType);
    }

    // Get all variables
    const allVars = [];
    for (const category of categories) {
      const categoryVars = variableManager.getVariablesByCategory(category)
        .filter(v => selectedType === 'all' || v.type === selectedType);
      allVars.push(...categoryVars);
    }
    
    return allVars;
  }, [variableManager, searchTerm, selectedCategory, selectedType, categories]);

  // Pagination
  const paginatedVariables = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredVariables.slice(start, end);
  }, [filteredVariables, currentPage]);

  const totalPages = Math.ceil(filteredVariables.length / ITEMS_PER_PAGE);

  // Update stats
  useEffect(() => {
    if (variableManager) {
      variableManager.getStats();
    }
  }, [variableManager, filteredVariables]);

  // Event handlers
  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleCategoryChange = useCallback((event) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleTypeChange = useCallback((event) => {
    setSelectedType(event.target.value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((event, page) => {
    setCurrentPage(page);
  }, []);

  const handleVariableClick = useCallback((variable) => {
    onVariableInsert?.(variable.name);
  }, [onVariableInsert]);

  const handleCategoryToggle = useCallback((category) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedType('all');
    setCurrentPage(1);
  }, []);

  // Categorized view
  const CategorizedView = () => (
    <Box>
      {categories.map(category => {
        const categoryVars = variableManager.getVariablesByCategory(category)
          .filter(v => 
            (selectedType === 'all' || v.type === selectedType) &&
            (searchTerm === '' || 
             v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             v.metadata.description.toLowerCase().includes(searchTerm.toLowerCase()))
          );

        if (categoryVars.length === 0) return null;

        return (
          <Accordion 
            key={category}
            expanded={expandedCategories.has(category)}
            onChange={() => handleCategoryToggle(category)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="subtitle2">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <List dense>
                {categoryVars.slice(0, 20).map(variable => ( // Limit to 20 per category for performance
                  <ListItem
                    key={variable.name}
                    button
                    onClick={() => handleVariableClick(variable)}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontFamily="monospace">
                            {variable.name}
                          </Typography>
                          <Chip label={variable.type} size="small" variant="outlined" />
                        </Box>
                      }
                      secondary={formatValue(variable.value)}
                    />
                  </ListItem>
                ))}
                {categoryVars.length > 20 && (
                  <ListItem>
                    <ListItemText 
                      primary={
                        <Typography variant="caption" color="textSecondary">
                          ... and {categoryVars.length - 20} more. Use search to find specific variables.
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );

  // Simple List View
  const ListView = () => (
    <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
      <List dense>
        {paginatedVariables.map(variable => (
          <ListItem
            key={variable.name}
            button
            onClick={() => handleVariableClick(variable)}
            sx={{
              borderBottom: '1px solid rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
              }
            }}
            secondaryAction={
              <Box display="flex" gap={0.5}>
                <Tooltip title="Edit Variable">
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onVariableEdit?.(variable);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Variable">
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onVariableDelete?.(variable.name);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          >
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" fontFamily="monospace" fontWeight="bold">
                    {variable.name}
                  </Typography>
                  <Chip 
                    label={variable.type} 
                    size="small" 
                    variant="outlined" 
                    sx={{ minWidth: 60, height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    {variable.metadata.description || 'No description'}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Typography variant="caption" fontFamily="monospace">
                      {formatValue(variable.value)}
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            size="small"
          />
        </Box>
      )}
    </Box>
  );

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'string') return `"${value.length > 20 ? value.slice(0, 20) + '...' : value}"`;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'object') return JSON.stringify(value).slice(0, 30) + '...';
    return String(value);
  };

  return (
    <Box className="variable-palette" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Search */}
      <Box mb={2}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search variables..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Filters */}
      <Box display="flex" gap={1} mb={2}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Category</InputLabel>
          <Select value={selectedCategory} onChange={handleCategoryChange} label="Category">
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map(cat => (
              <MenuItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Type</InputLabel>
          <Select value={selectedType} onChange={handleTypeChange} label="Type">
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="number">Number</MenuItem>
            <MenuItem value="string">String</MenuItem>
            <MenuItem value="boolean">Boolean</MenuItem>
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="array">Array</MenuItem>
            <MenuItem value="object">Object</MenuItem>
          </Select>
        </FormControl>

        {(searchTerm || selectedCategory !== 'all' || selectedType !== 'all') && (
          <Button size="small" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </Box>

      {/* Results count */}
      <Typography variant="caption" color="textSecondary" mb={1}>
        {filteredVariables.length} variable{filteredVariables.length !== 1 ? 's' : ''} found
      </Typography>

      {/* Variable List */}
      <Box flex={1} minHeight={0}>
        {viewMode === 'categorized' && !searchTerm ? (
          <CategorizedView />
        ) : (
          <ListView />
        )}
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        <MenuItem onClick={() => setViewMode('categorized')}>
          Categorized View
        </MenuItem>
        <MenuItem onClick={() => setViewMode('list')}>
          List View
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => console.log('Export variables')}>
          <ExportIcon sx={{ mr: 1 }} />
          Export Variables
        </MenuItem>
        <MenuItem onClick={() => console.log('Import variables')}>
          <ImportIcon sx={{ mr: 1 }} />
          Import Variables
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default VariablePalette; 