# Word Highlighter

A VS Code extension that highlights words in the editor based on a JSON configuration file.

## Features

- Highlight specific words with custom colors
- Configuration via a simple JSON file
- Automatically updates when the document changes
- Command to reload the configuration

## Usage

1. Install the extension
2. Create a JSON configuration file (e.g., `highlight-words.json`) with the following format:

```json
{
  "some-word": "#00FF00",
  "another-word": "#FF0000",
  "third-word": "rgba(0, 0, 255, 0.5)"
}
```

3. Configure the path to your JSON file in VS Code settings:
   - Open Settings (Ctrl+,)
   - Search for "Word Highlighter"
   - Set the "Word Highlighter: Config Path" to the full path of your JSON file

4. Open a file in the editor, and the words specified in your configuration will be highlighted

## Commands

- **Word Highlighter: Reload configuration** - Reload the configuration file manually

## Extension Settings

* `wordHighlighter.configPath`: Path to the JSON configuration file

## Building and Installing

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `vscode:package` to create a .vsix file
4. Install the .vsix file in VS Code using the "Install from VSIX" command in the Extensions view

## License

MIT
