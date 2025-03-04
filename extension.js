const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

/**
 * @type {vscode.TextEditorDecorationType[]}
 */
let decorationTypes = [];

/**
 * @type {Object.<string, string>}
 */
let wordColorMap = {};

/**
 * Activates the extension
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Word Highlighter extension activated');

    // Load the configuration initially
    loadConfiguration();

    // Register command to reload configuration
    let reloadCommand = vscode.commands.registerCommand('word-highlighter.reload', () => {
        loadConfiguration();
        updateDecorations(vscode.window.activeTextEditor);
    });

    // Watch for changes to the active text editor
    let activeEditorDisposable = vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            updateDecorations(editor);
        }
    });

    // Watch for changes to the document text
    let documentChangeDisposable = vscode.workspace.onDidChangeTextDocument(event => {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && event.document === activeEditor.document) {
            updateDecorations(activeEditor);
        }
    });

    // Watch for changes to the configuration
    let configChangeDisposable = vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('wordHighlighter.configPath')) {
            loadConfiguration();
            updateDecorations(vscode.window.activeTextEditor);
        }
    });

    context.subscriptions.push(
        reloadCommand,
        activeEditorDisposable,
        documentChangeDisposable,
        configChangeDisposable
    );
}

/**
 * Loads the configuration from the JSON file
 */
function loadConfiguration() {
    try {
        // Dispose of existing decoration types
        disposeDecorationTypes();
        
        // Get the configuration file path
        const configPath = vscode.workspace.getConfiguration('wordHighlighter').get('configPath');
        
        if (!configPath) {
            vscode.window.showInformationMessage('Word Highlighter: Configuration path not set');
            return;
        }

        // Read the configuration file
        const configContent = fs.readFileSync(configPath, 'utf8');
        wordColorMap = JSON.parse(configContent);

        // Create decoration types for each word
        Object.entries(wordColorMap).forEach(([word, color]) => {
            const decorationType = vscode.window.createTextEditorDecorationType({
                backgroundColor: color,
                overviewRulerColor: color,
                overviewRulerLane: vscode.OverviewRulerLane.Right,
            });
            decorationTypes.push({ word, decorationType });
        });

        vscode.window.showInformationMessage(`Word Highlighter: Loaded ${Object.keys(wordColorMap).length} word(s) from configuration`);
    } catch (error) {
        vscode.window.showErrorMessage(`Word Highlighter: Error loading configuration - ${error.message}`);
        console.error(error);
    }
}

/**
 * Updates the decorations in the given editor
 * @param {vscode.TextEditor} editor 
 */
function updateDecorations(editor) {
    if (!editor || decorationTypes.length === 0) {
        return;
    }

    const text = editor.document.getText();
    
    // Apply each decoration type
    for (const { word, decorationType } of decorationTypes) {
        const decorationRanges = findAllOccurrences(text, word, editor.document);
        editor.setDecorations(decorationType, decorationRanges);
    }
}

/**
 * Finds all occurrences of a word in the document
 * @param {string} text 
 * @param {string} word 
 * @param {vscode.TextDocument} document 
 * @returns {vscode.Range[]}
 */
function findAllOccurrences(text, word, document) {
    const ranges = [];
    const wordRegex = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'g');
    
    let match;
    while ((match = wordRegex.exec(text)) !== null) {
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(match.index + word.length);
        ranges.push(new vscode.Range(startPos, endPos));
    }
    
    return ranges;
}

/**
 * Escapes special characters in a string for use in a regular expression
 * @param {string} string 
 * @returns {string}
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Disposes of all decoration types
 */
function disposeDecorationTypes() {
    decorationTypes.forEach(({ decorationType }) => {
        decorationType.dispose();
    });
    decorationTypes = [];
}

/**
 * Deactivates the extension
 */
function deactivate() {
    disposeDecorationTypes();
}

module.exports = {
    activate,
    deactivate
};
