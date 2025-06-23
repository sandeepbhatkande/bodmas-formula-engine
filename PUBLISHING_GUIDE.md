# Publishing Guide - BODMAS Formula Engine

This guide will help you publish the BODMAS Formula Engine to npm and maintain it as a public package.

## Prerequisites

1. **Node.js and npm**: Ensure you have Node.js 18+ and npm installed
2. **npm Account**: Create an account at [npmjs.com](https://www.npmjs.com/)
3. **Git Repository**: Your code should be in a Git repository (preferably GitHub)

## Step 1: Prepare for Publishing

### 1.1 Install Build Dependencies

```bash
npm install
```

### 1.2 Build the Package

```bash
npm run build
```

This will create a `dist` folder with the compiled library files.

### 1.3 Test the Build

```bash
# Test that the build works
node -e "console.log(require('./dist/index.js'))"
```

## Step 2: Configure npm

### 2.1 Login to npm

```bash
npm login
```

Enter your npm username, password, and email.

### 2.2 Verify Login

```bash
npm whoami
```

## Step 3: Publish to npm

### 3.1 First Time Publishing

```bash
npm publish
```

### 3.2 Publishing Updates

For subsequent releases:

1. Update the version in `package.json`:
   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

2. Publish the new version:
   ```bash
   npm publish
   ```

## Step 4: Verify Publication

1. Check your package on npm: `https://www.npmjs.com/package/bodmas-formula-engine`
2. Test installation in a new project:
   ```bash
   mkdir test-install
   cd test-install
   npm init -y
   npm install bodmas-formula-engine
   ```

## Step 5: Usage in Projects

### 5.1 Installation

```bash
npm install bodmas-formula-engine
```

### 5.2 Install Peer Dependencies

```bash
npm install react react-dom @mui/material @emotion/react @emotion/styled @mui/icons-material @mui/lab
```

### 5.3 Basic Usage

```jsx
import React, { useState } from 'react';
import { FormulaBuilder } from 'bodmas-formula-engine';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme();

function App() {
  const [formula, setFormula] = useState('');
  const variables = { price: 100, quantity: 5 };

  const handleFormulaChange = (newFormula, validation) => {
    setFormula(newFormula);
    console.log('Result:', validation.result);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FormulaBuilder
        initialFormula={formula}
        onFormulaChange={handleFormulaChange}
        variables={variables}
      />
    </ThemeProvider>
  );
}

export default App;
```

## Step 6: Package Maintenance

### 6.1 Updating Dependencies

Regularly update dependencies:

```bash
npm update
npm audit fix
```

### 6.2 Version Management

Follow semantic versioning:
- **Patch** (1.0.1): Bug fixes
- **Minor** (1.1.0): New features, backward compatible
- **Major** (2.0.0): Breaking changes

### 6.3 Documentation Updates

Keep README.md and examples up to date with each release.

## Step 7: Advanced Publishing Options

### 7.1 Publishing Beta Versions

```bash
npm version prerelease --preid=beta
npm publish --tag beta
```

### 7.2 Publishing with Scoped Packages

If you want to publish under your organization:

```json
{
  "name": "@your-org/bodmas-formula-engine"
}
```

Then publish:
```bash
npm publish --access public
```

## Step 8: Continuous Integration

### 8.1 GitHub Actions (Optional)

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Step 9: Package Statistics and Monitoring

### 9.1 Monitor Downloads

- Check npm stats: `https://www.npmjs.com/package/bodmas-formula-engine`
- Use npm-stat: `https://npm-stat.com/charts.html?package=bodmas-formula-engine`

### 9.2 Bundle Size Analysis

Monitor your package size:
```bash
npx bundlephobia bodmas-formula-engine
```

## Troubleshooting

### Common Issues

1. **Build Errors**: Check Rollup configuration and dependencies
2. **Peer Dependency Warnings**: Ensure peer dependencies are correctly specified
3. **Version Conflicts**: Use `npm ls` to check dependency tree
4. **Publishing Errors**: Verify npm login and package name availability

### Support

- Create issues on GitHub for bug reports
- Update documentation for common questions
- Consider creating a Discord/Slack community for users

## Best Practices

1. **Semantic Versioning**: Always follow semver
2. **Changelog**: Maintain a CHANGELOG.md file
3. **Testing**: Run tests before publishing
4. **Documentation**: Keep README and examples current
5. **Security**: Regularly audit dependencies
6. **Performance**: Monitor bundle size and performance

## Examples and Demos

The `examples/` directory contains various usage examples:
- Basic usage
- Custom functions
- E-commerce calculator
- Advanced integrations

Users can clone the repository and run examples locally:

```bash
git clone https://github.com/sandeepbhatkande/bodmas-formula-engine.git
cd bodmas-formula-engine/examples/basic-usage
npm install
npm start
```

---

## Quick Commands Reference

```bash
# Build the package
npm run build

# Test the build
npm test

# Publish to npm
npm publish

# Update version
npm version patch|minor|major

# Check package info
npm info bodmas-formula-engine

# View package files
npm pack --dry-run
```

Remember to test thoroughly before publishing and maintain good documentation for your users! 