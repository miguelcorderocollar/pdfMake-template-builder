# AGENTS.MD - PDFMake Template Builder

This file contains instructions and best practices for AI coding agents working on this project.

## ⚠️ IMPORTANT: Human-in-the-Loop Development

**The human developer (user) is in charge of running all terminal commands and managing the development environment.** Do not execute terminal commands yourself. Only provide the commands for the user to run.

## 📋 Project Overview

This is a PDFMake Template Builder - a modern web application for creating and customizing PDFMake templates through a visual drag-and-drop interface. The application is built with Next.js, TypeScript, and Tailwind CSS.

### Key Features
- Visual drag-and-drop template builder
- Real-time PDF preview
- Element customization (text, tables, images, lists)
- Template import/export
- Local storage persistence
- Responsive design with dark mode

## 🚀 Development Environment Setup

### Prerequisites
- Node.js 18+
- Bun (recommended) or npm
- Git

### Setup Commands (Run by Human)
```bash
# Install dependencies
bun install

# Set up @shadcn/ui
bunx shadcn@latest init --yes

# Start development server
bun dev

# Build for production
bun build

# Start production server
bun start

# Run linting
bun lint

# Run TypeScript checking
bun type-check
```

## 📁 Project Structure

```
pdfmake-builder/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   │   ├── ui/              # Reusable UI components
│   │   ├── elements/        # Template element components
│   │   ├── canvas/          # Canvas and drag-drop logic
│   │   └── preview/         # PDF preview system
│   ├── services/           # Business logic and utilities
│   ├── types/              # TypeScript type definitions
│   ├── lib/                # External library configurations
│   └── utils/              # Utility functions
├── docs/                   # Documentation and examples
│   ├── plan/               # Development planning docs
│   └── examples/           # pdfMake example templates
├── public/                 # Static assets
└── package.json
```

## 🎨 Code Style Guidelines

### TypeScript
- **Strict mode enabled** - All TypeScript strict checks must pass
- **Explicit types** - Avoid `any` type, use proper type definitions
- **Interface over type** - Use interfaces for object shapes
- **Type imports** - Use `import type` for type-only imports

### React
- **Functional components** - Use modern React patterns
- **Custom hooks** - Extract reusable logic into custom hooks
- **Component composition** - Prefer composition over inheritance
- **Props interface** - Define props interfaces for all components

### Styling
- **Tailwind CSS** - Use utility-first approach
- **Consistent naming** - Follow Tailwind conventions
- **Responsive design** - Mobile-first approach
- **Dark mode support** - Use CSS custom properties for theming

### General
- **Single quotes** - Use single quotes for strings
- **No semicolons** - Omit semicolons where possible
- **ES6+ features** - Use modern JavaScript features
- **Descriptive names** - Use clear, descriptive variable/function names

## 🧪 Testing Instructions

### Testing Strategy
- **Unit tests** - Test individual functions and components
- **Integration tests** - Test component interactions
- **E2E tests** - Test complete user workflows
- **Visual regression** - Ensure UI consistency

### Test Commands (Run by Human)
```bash
# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests with coverage
bun test:coverage

# Run specific test file
bun test -- <filename>
```

### Testing Guidelines
- **Test component behavior** - Focus on user interactions
- **Mock external dependencies** - Isolate unit tests
- **Test error states** - Ensure error handling works
- **Accessibility testing** - Include a11y in tests
- **Performance testing** - Monitor bundle size and render performance

## 🔧 Development Best Practices

### Git Workflow
- **Feature branches** - Create branches for each feature/milestone
- **Descriptive commits** - Write clear commit messages
- **Pull request reviews** - Submit work for human review
- **Squash commits** - Clean up commit history before merge

### Code Organization
- **Single responsibility** - Each file has one clear purpose
- **DRY principle** - Don't repeat yourself
- **SOLID principles** - Follow software design principles
- **Clean architecture** - Separate concerns properly

### Performance
- **Code splitting** - Use dynamic imports for large components
- **Memoization** - Use React.memo and useMemo appropriately
- **Image optimization** - Compress and lazy load images
- **Bundle analysis** - Monitor bundle size regularly

### Error Handling
- **Graceful degradation** - Handle errors without breaking the app
- **User feedback** - Provide clear error messages
- **Logging** - Log errors for debugging (development only)
- **Recovery options** - Allow users to recover from errors

## 🛠️ Tools & Libraries

### Core Dependencies
- **Next.js 15+** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **@shadcn/ui** - Modern UI component library
- **pdfMake** - PDF generation library
- **React DnD** - Drag and drop functionality

### Development Tools
- **Bun** - Fast JavaScript runtime and package manager
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript Compiler** - Type checking

## 🚨 Critical Considerations

### Security
- **Input validation** - Sanitize all user inputs
- **XSS prevention** - Escape HTML content
- **Content Security Policy** - Implement CSP headers
- **File upload safety** - Validate uploaded files

### Accessibility
- **WCAG compliance** - Follow accessibility guidelines
- **Keyboard navigation** - Support keyboard-only usage
- **Screen readers** - Ensure compatibility with screen readers
- **Color contrast** - Maintain proper contrast ratios

### Browser Compatibility
- **Modern browsers** - Chrome, Firefox, Safari, Edge
- **Progressive enhancement** - Core functionality works everywhere
- **Polyfills** - Add only when necessary
- **Mobile support** - Test on various screen sizes

## 📝 Documentation Requirements

### Code Documentation
- **JSDoc comments** - Document complex functions
- **Component props** - Document all component props
- **Type definitions** - Clear type descriptions
- **Usage examples** - Include examples in comments

### Project Documentation
- **README updates** - Keep README current
- **API documentation** - Document public APIs
- **Architecture decisions** - Record important decisions
- **Change log** - Track significant changes

## 🔄 Development Workflow

### Daily Workflow
1. **Check current milestone** - Review development-plan.md
2. **Implement features** - Focus on current milestone only
3. **Test thoroughly** - Ensure all requirements are met
4. **Code review** - Submit for human review
5. **Iterate** - Fix issues and improve based on feedback

### Communication
- **Clear instructions** - Provide specific implementation details
- **Progress updates** - Report completion of tasks
- **Blockers** - Immediately report any blocking issues
- **Questions** - Ask for clarification when needed

### Quality Assurance
- **Self-review** - Check code against guidelines
- **Testing** - Thoroughly test implemented features
- **Edge cases** - Consider and handle edge cases
- **Performance** - Ensure good performance
- **Accessibility** - Verify accessibility compliance

## 🎯 Success Criteria

### Code Quality
- ✅ No TypeScript errors
- ✅ No ESLint warnings
- ✅ All tests passing
- ✅ Good performance metrics
- ✅ Accessibility compliant

### Feature Completeness
- ✅ Meets milestone requirements
- ✅ Handles edge cases
- ✅ Provides good user experience
- ✅ Integrates well with existing code
- ✅ Follows established patterns

### Documentation
- ✅ Code is well-documented
- ✅ README is updated
- ✅ Changes are recorded
- ✅ Examples are provided
- ✅ Tests are included

Remember: **Always wait for human approval before proceeding to the next milestone.** The human developer controls the development environment and testing process.
