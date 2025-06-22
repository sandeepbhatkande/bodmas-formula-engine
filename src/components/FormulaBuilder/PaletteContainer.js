import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import {
  Functions as FunctionsIcon,
  Storage as VariablesIcon,
} from '@mui/icons-material';
import { FunctionPalette } from './FunctionPalette';
import VariablePalette from './VariablePalette';

// Simple Variables Manager for handling basic variables
class SimpleVariableManager {
  constructor(variables = {}) {
    this.variables = new Map();
    this.categories = new Map();
    
    // Initialize with provided variables
    Object.entries(variables).forEach(([name, value]) => {
      this.addVariable(name, value, 'user', { description: `Variable: ${name}` });
    });
  }

  addVariable(name, value, category = 'user', metadata = {}) {
    const variable = {
      name,
      value,
      category,
      type: this.inferType(value),
      metadata: {
        description: '',
        tags: [],
        lastModified: new Date(),
        ...metadata
      }
    };

    this.variables.set(name, variable);
    
    // Add to category
    if (!this.categories.has(category)) {
      this.categories.set(category, new Set());
    }
    this.categories.get(category).add(name);
  }

  inferType(value) {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date) return 'date';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'unknown';
  }

  getCategories() {
    return Array.from(this.categories.keys());
  }

  getVariablesByCategory(category) {
    const variableNames = this.categories.get(category) || new Set();
    return Array.from(variableNames).map(name => this.variables.get(name)).filter(Boolean);
  }

  searchVariables(searchTerm, options = {}) {
    const results = [];
    const lowerSearch = searchTerm.toLowerCase();
    
    for (const variable of this.variables.values()) {
      const matchesName = variable.name.toLowerCase().includes(lowerSearch);
      const matchesDescription = variable.metadata.description.toLowerCase().includes(lowerSearch);
      const matchesCategory = !options.category || variable.category === options.category;
      const matchesType = !options.type || variable.type === options.type;
      
      if ((matchesName || matchesDescription) && matchesCategory && matchesType) {
        results.push(variable);
      }
    }
    
    return results.slice(0, options.limit || 100);
  }

  getStats() {
    return {
      totalVariables: this.variables.size,
      categories: this.categories.size,
      byType: this.getTypeStats()
    };
  }

  getTypeStats() {
    const stats = {};
    for (const variable of this.variables.values()) {
      stats[variable.type] = (stats[variable.type] || 0) + 1;
    }
    return stats;
  }

  updateVariables(newVariables) {
    // Clear existing user variables
    const userVars = this.categories.get('user') || new Set();
    userVars.forEach(name => {
      this.variables.delete(name);
    });
    this.categories.set('user', new Set());

    // Add new variables
    Object.entries(newVariables).forEach(([name, value]) => {
      this.addVariable(name, value, 'user', { description: `Variable: ${name}` });
    });
  }
}

const PaletteContainer = ({ 
  onFunctionInsert, 
  onVariableInsert, 
  variables = {}, 
  engine,
  customVariableComponent: CustomVariableComponent = null
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [variableManager] = useState(() => new SimpleVariableManager(variables));

  // Update variable manager when variables prop changes
  useEffect(() => {
    variableManager.updateVariables(variables);
  }, [variables, variableManager]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleVariableAdd = () => {
    console.log('Add variable clicked');
  };

  const handleVariableEdit = (variable) => {
    console.log('Edit variable:', variable);
  };

  const handleVariableDelete = (variableName) => {
    console.log('Delete variable:', variableName);
  };

  const variableCount = Object.keys(variables).length;

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`palette-tabpanel-${index}`}
      aria-labelledby={`palette-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ 
          pt: 2, 
          height: 'calc(100% - 48px)', 
          overflow: 'hidden',
          px: 2
        }}>
          {children}
        </Box>
      )}
    </div>
  );

  return (
    <Box className="palette-container" sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#fafafa',
      borderRadius: 2,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Formula Builder
        </Typography>
        
        {/* Tabs */}
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ minHeight: 40}}
        >
          <Tab 
            icon={<FunctionsIcon />} 
            label="Functions"
            iconPosition="start"
            sx={{ minHeight: 40, fontSize: '0.875rem' }}
          />
          <Tab 
            icon={<VariablesIcon />} 
            label="Variables"
            iconPosition="start"
            sx={{ minHeight: 40, fontSize: '0.875rem' }}
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <TabPanel value={activeTab} index={0}>
          <FunctionPalette
            onFunctionInsert={onFunctionInsert}
            onVariableInsert={onVariableInsert}
            variables={Object.keys(variables)}
            engine={engine}
            showVariables={false}
            showHeader={false}
          />
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          {/* Use custom variable component if provided, otherwise use default */}
          {CustomVariableComponent ? (
            <CustomVariableComponent
              variables={variables}
              onVariableInsert={onVariableInsert}
              onFunctionInsert={onFunctionInsert}
              engine={engine}
            />
          ) : (
            variableCount > 0 ? (
              <VariablePalette
                variableManager={variableManager}
                onVariableInsert={onVariableInsert}
                onVariableEdit={handleVariableEdit}
                onVariableDelete={handleVariableDelete}
                onVariableAdd={handleVariableAdd}
              />
            ) : (
              <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center"
                sx={{ height: '100%', p: 3, textAlign: 'center' }}
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
            )
          )}
        </TabPanel>
      </Box>
    </Box>
  );
};

export { PaletteContainer }; 