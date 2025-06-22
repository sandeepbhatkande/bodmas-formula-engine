import React, { useState, useCallback, useRef } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { FormulaEditor } from './FormulaEditor';
import { PaletteContainer } from './PaletteContainer';
import { ValidationPanel } from './ValidationPanel';
import { PreviewPanel } from './PreviewPanel';
import { FormulaEngine } from '../../utils/FormulaEngine';
import './FormulaBuilder.scss';

const FormulaBuilder = ({ 
  initialFormula = '', 
  variables = {}, 
  customVariables = {},
  customVariableComponent: CustomVariableComponent = null,
  onFormulaChange,
  customFunctions = {} 
}) => {
  const [formula, setFormula] = useState(initialFormula);
  const [validation, setValidation] = useState({ valid: true, error: null });
  const [previewResult, setPreviewResult] = useState(null);
  const [engine] = useState(() => new FormulaEngine(customFunctions));
  const editorRef = useRef(null);

  // Merge default variables with custom variables, custom variables take precedence
  const allVariables = { ...variables, ...customVariables };

  const handleFormulaChange = useCallback((newFormula) => {
    setFormula(newFormula);
    
    // Validate formula
    const validationResult = engine.validateExpression(newFormula);
    setValidation(validationResult);
    
    // Try to evaluate for preview
    if (validationResult.valid && newFormula.trim()) {
      try {
        const result = engine.evaluateFormula(newFormula, allVariables);
        setPreviewResult(result);
      } catch (error) {
        setPreviewResult(`Error: ${error.message}`);
      }
    } else {
      setPreviewResult(null);
    }
    
    // Notify parent component
    if (onFormulaChange) {
      onFormulaChange(newFormula, validationResult);
    }
  }, [engine, allVariables, onFormulaChange]);

  const handleFunctionInsert = useCallback((functionSignature) => {
    // Use the editor's insertAtCursor method for better UX
    if (editorRef.current && editorRef.current.insertAtCursor) {
      editorRef.current.insertAtCursor(functionSignature);
    } else {
      // Fallback to appending if ref not available
      const newFormula = formula + functionSignature;
      handleFormulaChange(newFormula);
    }
  }, [formula, handleFormulaChange]);

  const handleVariableInsert = useCallback((variableName) => {
    // Use the editor's insertAtCursor method for better UX
    if (editorRef.current && editorRef.current.insertAtCursor) {
      editorRef.current.insertAtCursor(variableName);
    } else {
      // Fallback to appending if ref not available
      const newFormula = formula + variableName;
      handleFormulaChange(newFormula);
    }
  }, [formula, handleFormulaChange]);

  return (
    <Paper elevation={2} className="formula-builder">
      <Box p={3}>
        <Typography variant="h5" gutterBottom>
          Formula Builder
        </Typography>
        
        {/* Alternative: Using CSS Grid for better stability */}
        <Box className="formula-builder-layout">
          {/* Palette Container with Tabs - Pass customVariableComponent to replace only Variables tab */}
          <Box className="function-palette-section">
            <PaletteContainer
              onFunctionInsert={handleFunctionInsert}
              onVariableInsert={handleVariableInsert}
              variables={allVariables}
              engine={engine}
              customVariableComponent={CustomVariableComponent}
            />
          </Box>
          
          {/* Main Editor Area */}
          <Box className="main-editor-section">
            <Box mb={2} sx={{ 
              minHeight: '280px', 
              display: 'flex', 
              flexDirection: 'column',
              width: '100%'
            }}>
              <FormulaEditor
                ref={editorRef}
                value={formula}
                onChange={handleFormulaChange}
                validation={validation}
                engine={engine}
              />
            </Box>
            
            {/* Sub-panels using CSS Grid */}
            <Box className="sub-panels-layout">
              <Box className="validation-section">
                <ValidationPanel validation={validation} />
              </Box>
              <Box className="preview-section">
                <PreviewPanel 
                  result={previewResult}
                  formula={formula}
                  variables={allVariables}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export { FormulaBuilder };
export default FormulaBuilder; 