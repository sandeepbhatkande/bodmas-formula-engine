import React, { useCallback, useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Box, Typography, Alert, IconButton, Tooltip } from '@mui/material';
import { 
  Clear as ClearIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ContentCopy as CopyIcon,
  ContentPaste as PasteIcon
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';

const FormulaEditor = forwardRef(({ value, onChange, validation, engine }, ref) => {
  const editorRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [hasSelection, setHasSelection] = useState(false);

  // Method to insert text at cursor position (used by parent components)
  const insertAtCursor = useCallback((text) => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      editorRef.current.executeEdits('insert', [
        {
          range: selection,
          text: text,
          forceMoveMarkers: true,
        },
      ]);
      editorRef.current.focus();
    }
  }, []);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    insertAtCursor,
    focus: () => editorRef.current?.focus(),
    getSelection: () => editorRef.current?.getSelection(),
    getValue: () => editorRef.current?.getValue(),
    getEditor: () => editorRef.current,
  }), [insertAtCursor]);

  const handleEditorDidMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    // Store monaco globally for marker management
    window.monaco = monaco;

    // Register custom language for formula syntax
    monaco.languages.register({ id: 'formula' });

    // Define syntax highlighting rules
    monaco.languages.setMonarchTokensProvider('formula', {
      tokenizer: {
        root: [
          [/[a-zA-Z_]\w*(?=\()/, 'function'],
          [/[a-zA-Z_]\w*/, 'variable'],
          [/\d+\.?\d*/, 'number'],
          [/"[^"]*"/, 'string'],
          [/'[^']*'/, 'string'],
          [/[+\-*/()]/, 'operator'],
          [/[<>=!&|]/, 'operator'],
          [/,/, 'delimiter'],
          [/\s+/, 'white'],
        ],
      },
    });

    // Define enhanced theme
    monaco.editor.defineTheme('formulaTheme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'function', foreground: '0066cc', fontStyle: 'bold' },
        { token: 'variable', foreground: '008000', fontStyle: 'italic' },
        { token: 'number', foreground: '098658' },
        { token: 'string', foreground: 'a31515' },
        { token: 'operator', foreground: '0000ff', fontStyle: 'bold' },
        { token: 'delimiter', foreground: '000000' },
        { token: 'white', foreground: '000000' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.selectionBackground': '#add6ff4d',
        'editor.lineHighlightBackground': '#f5f5f5',
        'editorCursor.foreground': '#0066cc',
      },
    });

    // Enhanced autocomplete with better suggestions
    monaco.languages.registerCompletionItemProvider('formula', {
      provideCompletionItems: (model, position) => {
        const suggestions = [];
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
        
        // Add function suggestions
        const functions = engine.getFunctionSuggestions();
        functions.forEach(func => {
          suggestions.push({
            label: func.name,
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: func.insertText,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: {
              value: `**${func.signature}**\n\n${func.description}\n\n*Example:* \`${func.example}\``
            },
            detail: func.signature,
            range: range,
            sortText: '1' + func.name, // Prioritize functions
          });
        });

        // Add operator suggestions
        const operators = [
          { label: '+', insertText: ' + ', detail: 'Addition', sortText: '2+' },
          { label: '-', insertText: ' - ', detail: 'Subtraction', sortText: '2-' },
          { label: '*', insertText: ' * ', detail: 'Multiplication', sortText: '2*' },
          { label: '/', insertText: ' / ', detail: 'Division', sortText: '2/' },
          // eslint-disable-next-line no-template-curly-in-string
          { label: '(', insertText: '(${1})', detail: 'Parentheses', sortText: '2(' },
          { label: '==', insertText: ' == ', detail: 'Equal to', sortText: '3==' },
          { label: '!=', insertText: ' != ', detail: 'Not equal to', sortText: '3!=' },
          { label: '>', insertText: ' > ', detail: 'Greater than', sortText: '3>' },
          { label: '<', insertText: ' < ', detail: 'Less than', sortText: '3<' },
          { label: '>=', insertText: ' >= ', detail: 'Greater than or equal', sortText: '3>=' },
          { label: '<=', insertText: ' <= ', detail: 'Less than or equal', sortText: '3<=' },
        ];

        operators.forEach(op => {
          suggestions.push({
            label: op.label,
            kind: monaco.languages.CompletionItemKind.Operator,
            insertText: op.insertText,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: op.detail,
            range: range,
            sortText: op.sortText,
          });
        });

        return { suggestions };
      },
    });

    // Enhanced hover provider
    monaco.languages.registerHoverProvider('formula', {
      provideHover: (model, position) => {
        const word = model.getWordAtPosition(position);
        if (word) {
          const functionInfo = engine.getFunctionInfo(word.word);
          if (functionInfo) {
            return {
              range: new monaco.Range(
                position.lineNumber,
                word.startColumn,
                position.lineNumber,
                word.endColumn
              ),
              contents: [
                { value: `**${functionInfo.signature}**` },
                { value: functionInfo.description },
                { value: `*Example:* \`${functionInfo.example}\`` },
                { value: `*Returns:* ${functionInfo.returnType}` },
              ],
            };
          }
        }
        return null;
      },
    });

    // Track cursor position and selection
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column
      });
    });

    editor.onDidChangeCursorSelection((e) => {
      setHasSelection(!e.selection.isEmpty());
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
      editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
    });

    // Focus the editor
    editor.focus();
  }, [engine]);

  const handleEditorChange = useCallback((newValue) => {
    onChange(newValue || '');
  }, [onChange]);

  // Interactive toolbar functions
  const handleClear = () => {
    if (editorRef.current) {
      editorRef.current.setValue('');
      editorRef.current.focus();
    }
  };

  const handleUndo = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'undo', {});
      editorRef.current.focus();
    }
  };

  const handleRedo = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'redo', {});
      editorRef.current.focus();
    }
  };

  const handleCopy = () => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      if (!selection.isEmpty()) {
        const selectedText = editorRef.current.getModel().getValueInRange(selection);
        navigator.clipboard.writeText(selectedText);
      } else {
        navigator.clipboard.writeText(editorRef.current.getValue());
      }
    }
  };

  const handlePaste = async () => {
    if (editorRef.current) {
      try {
        const text = await navigator.clipboard.readText();
        const selection = editorRef.current.getSelection();
        editorRef.current.executeEdits('paste', [
          {
            range: selection,
            text: text,
            forceMoveMarkers: true,
          },
        ]);
        editorRef.current.focus();
      } catch (err) {
        console.warn('Failed to paste from clipboard:', err);
      }
    }
  };

  useEffect(() => {
    if (editorRef.current && !validation.valid && window.monaco) {
      const markers = [{
        severity: 8, // Error severity
        message: validation.error,
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: value.length + 1,
      }];
      
      window.monaco.editor.setModelMarkers(editorRef.current.getModel(), 'formula', markers);
    } else if (editorRef.current && validation.valid && window.monaco) {
      // Clear markers when valid
      window.monaco.editor.setModelMarkers(editorRef.current.getModel(), 'formula', []);
    }
  }, [validation, value]);

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: 'clamp(200px, 30vh, 350px)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} sx={{ 
        flexShrink: 0,
        flexWrap: 'wrap',
        gap: 1
      }}>
        <Typography variant="h6" sx={{ flexShrink: 0 }}>
          Formula Editor
        </Typography>
        
        {/* Interactive Toolbar */}
        <Box display="flex" gap={0.5} sx={{ flexWrap: 'wrap' }}>
          <Tooltip title="Clear all (Ctrl+A, Delete)">
            <IconButton size="small" onClick={handleClear}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Undo (Ctrl+Z)">
            <IconButton size="small" onClick={handleUndo}>
              <UndoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Redo (Ctrl+Y)">
            <IconButton size="small" onClick={handleRedo}>
              <RedoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy (Ctrl+C)">
            <IconButton size="small" onClick={handleCopy}>
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Paste (Ctrl+V)">
            <IconButton size="small" onClick={handlePaste}>
              <PasteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {!validation.valid && (
        <Alert severity="error" sx={{ mb: 2, flexShrink: 0 }}>
          {validation.error}
        </Alert>
      )}
      
      <Box 
        border={1} 
        borderColor={validation.valid ? 'grey.300' : 'error.main'}
        borderRadius={1}
        sx={{ 
          width: '100%',
          maxWidth: '100%',
          height: 'clamp(150px, 25vh, 300px)',
          minHeight: 'clamp(150px, 25vh, 300px)',
          maxHeight: 'clamp(150px, 25vh, 300px)',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
          '& .monaco-editor': { 
            borderRadius: 1,
            width: '100% !important',
            maxWidth: '100% !important',
            height: '100% !important',
            minHeight: '100% !important',
            maxHeight: '100% !important'
          },
          '& .monaco-editor .cursor': {
            animation: 'blink 1s infinite'
          },
          '& .monaco-editor .overflow-guard': {
            width: '100% !important',
            height: '100% !important'
          },
          '& .monaco-editor .monaco-scrollable-element': {
            width: '100% !important',
            height: '100% !important'
          }
        }}
      >
        <Editor
          height="100%"
          width="100%"
          language="formula"
          theme="formulaTheme"
          value={value}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            lineNumbers: 'off',
            folding: false,
            wordWrap: 'on',
            fontSize: 18,
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            padding: { top: '2rem', bottom: '2rem' },
            suggestOnTriggerCharacters: true,
            quickSuggestions: { other: true, comments: false, strings: false },
            parameterHints: { enabled: true },
            hover: { enabled: true, delay: 500 },
            scrollBeyondLastLine: false,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            renderLineHighlight: 'line',
            selectOnLineNumbers: true,
            roundedSelection: false,
            cursorStyle: 'line',
            cursorWidth: 2,
            cursorBlinking: 'blink',
            automaticLayout: true,
            lineHeight:2,
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              bracketPairsHorizontal: true,
            },
            scrollbar: {
              horizontal: 'auto',
              vertical: 'auto',
              horizontalScrollbarSize: 'clamp(8px, 1.5vw, 12px)',
              verticalScrollbarSize: 'clamp(8px, 1.5vw, 12px)',
            },
            wordWrapColumn: 120,
            rulers: [],
            glyphMargin: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            showFoldingControls: 'never',
            matchBrackets: 'never',
            fixedOverflowWidgets: true,
            contextmenu: false,
          }}
        />
      </Box>
      
      {/* Status Bar */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center"
        sx={{ 
          mt: 1, 
          flexShrink: 0, 
          minHeight: '1.25rem',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Typography variant="caption" color="textSecondary" sx={{ 
          fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)',
          flexShrink: 0
        }}>
          Press Ctrl+Space for autocomplete • Ctrl+K for suggestions • Hover for help
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ 
          fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)',
          flexShrink: 0
        }}>
          Line {cursorPosition.line}, Column {cursorPosition.column}
          {hasSelection && ' • Text selected'}
        </Typography>
      </Box>
    </Box>
  );
});

FormulaEditor.displayName = 'FormulaEditor';

export { FormulaEditor }; 