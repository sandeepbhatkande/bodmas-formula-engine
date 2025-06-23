# Demo Guide - BODMAS Formula Engine

This guide shows you how to create and share interactive demos of your npm package across different platforms.

## 🚀 Live Demo Options

### 1. **GitHub Pages** (Primary Demo)
**URL**: https://sandeepbhatkande.github.io/bodmas-formula-engine

Deploy your main React app as a live demo:

```bash
# Build and deploy to GitHub Pages
npm run deploy:demo
```

### 2. **CodeSandbox Templates**
Create instant, editable examples:

#### Basic Usage
[![Open in CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/new?template=https://github.com/sandeepbhatkande/bodmas-formula-engine/tree/main/examples/basic-usage)

#### Custom Functions  
[![Open in CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/new?template=https://github.com/sandeepbhatkande/bodmas-formula-engine/tree/main/examples/custom-functions)

#### E-commerce Calculator
[![Open in CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/new?template=https://github.com/sandeepbhatkande/bodmas-formula-engine/tree/main/examples/ecommerce-calculator)

### 3. **Stackblitz Templates**
Instant online IDE experience:

#### Basic Usage
[![Open in Stackblitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/sandeepbhatkande/bodmas-formula-engine/tree/main/examples/basic-usage)

#### Custom Functions
[![Open in Stackblitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/sandeepbhatkande/bodmas-formula-engine/tree/main/examples/custom-functions)

### 4. **Storybook** (Component Documentation)
Interactive component playground:

```bash
# Install Storybook
npx storybook@latest init

# Add stories for your components
npm run storybook
```

## 📱 Demo Content Strategy

### **Landing Page Demo** (GitHub Pages)
- **Hero Section**: Interactive formula builder
- **Feature Showcase**: Key capabilities with live examples
- **Use Case Examples**: Real-world scenarios
- **API Playground**: Test different props and configurations

### **Quick Start Examples** (CodeSandbox/Stackblitz)
- **5-minute integration**: Minimal setup
- **Copy-paste ready**: Working code snippets
- **Instant feedback**: See results immediately
- **Shareable links**: Easy to send to colleagues

### **Advanced Examples** (Separate Demos)
- **E-commerce pricing**: Complex business logic
- **Financial calculator**: Investment calculations  
- **Analytics dashboard**: Custom metrics
- **Report builder**: Dynamic formulas

## 🎯 Demo Best Practices

### **1. Progressive Complexity**
```
Basic Usage → Custom Variables → Custom Functions → Real-world Apps
```

### **2. Interactive Elements**
- **Live editing**: Users can modify formulas
- **Real-time results**: Instant feedback
- **Variable controls**: Sliders, inputs, dropdowns
- **Formula templates**: Pre-built examples

### **3. Visual Appeal**
- **Screenshots**: Show the interface
- **GIFs**: Demonstrate interactions
- **Code highlighting**: Syntax highlighting
- **Responsive design**: Works on mobile

### **4. Documentation Integration**
- **Inline comments**: Explain code snippets
- **API links**: Link to documentation
- **Related examples**: Cross-reference demos
- **Getting started**: Clear next steps

## 🔧 Setting Up Demos

### **GitHub Pages Setup**
```bash
# 1. Build your demo app
npm run build:demo

# 2. Install gh-pages
npm install --save-dev gh-pages

# 3. Deploy
npm run deploy:demo
```

### **CodeSandbox Integration**
1. Push examples to GitHub
2. Create `.codesandbox/ci.json` configuration
3. CodeSandbox auto-creates sandboxes from your examples
4. Share the generated URLs

### **Stackblitz Integration**
1. Ensure `package.json` has correct dependencies
2. Use Stackblitz GitHub integration
3. Create direct links: `https://stackblitz.com/github/[username]/[repo]/tree/main/examples/[example-name]`

## 📊 Demo Analytics

### **Track Demo Usage**
- **Google Analytics**: Page views, user interactions
- **GitHub Insights**: Repository traffic
- **npm stats**: Package downloads
- **Social sharing**: Track referrals

### **Key Metrics**
- **Demo engagement**: Time spent, interactions
- **Conversion rate**: Demo → npm install  
- **Popular examples**: Most viewed demos
- **User feedback**: Issues, questions

## 🎪 Demo Content Ideas

### **Interactive Tutorials**
```jsx
// Step-by-step guided tour
const TutorialDemo = () => (
  <div>
    <Step1>Install the package</Step1>
    <Step2>Basic setup</Step2>
    <Step3>Add variables</Step3>
    <Step4>Custom functions</Step4>
  </div>
);
```

### **Comparison Demos**
- **Before/After**: Show the problem your package solves
- **Feature comparison**: Different configuration options
- **Performance**: Speed comparisons

### **Industry-Specific Examples**
- **E-commerce**: Pricing calculators
- **Finance**: Investment tools
- **Healthcare**: Dosage calculators
- **Education**: Grade calculators

## 🚀 Promoting Your Demos

### **npm Package Page**
- **README badges**: Link to live demos
- **Screenshots**: Visual examples
- **Quick start**: Copy-paste code

### **Social Media**
- **Twitter**: Share GIFs of your demos
- **LinkedIn**: Professional use cases
- **Dev.to**: Tutorial posts with embedded demos
- **Reddit**: r/reactjs, r/javascript

### **Developer Communities**
- **Product Hunt**: Launch your package
- **Hacker News**: Share interesting examples
- **Discord/Slack**: Developer communities
- **GitHub Discussions**: Engage with users

## 📝 Demo Checklist

- [ ] **GitHub Pages** deployed and working
- [ ] **CodeSandbox** templates created
- [ ] **Stackblitz** links working
- [ ] **README** updated with demo links
- [ ] **Screenshots** added to documentation
- [ ] **GIFs** showing key interactions
- [ ] **Mobile responsive** demos
- [ ] **Error handling** in demos
- [ ] **Loading states** implemented
- [ ] **Analytics** tracking setup

## 🎉 Demo Launch Strategy

### **Phase 1: Core Demos**
1. Deploy GitHub Pages demo
2. Create basic CodeSandbox examples
3. Update README with demo links

### **Phase 2: Advanced Examples**
1. Build industry-specific demos
2. Create tutorial content
3. Add interactive features

### **Phase 3: Community Engagement**
1. Share on social media
2. Submit to showcases
3. Engage with users
4. Iterate based on feedback

---

**Remember**: Great demos turn visitors into users! Make them interactive, visually appealing, and easy to understand. 🌟 