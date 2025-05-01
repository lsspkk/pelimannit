# Cursor AI Instructions for Nuottikokoelmat

## Project Overview

This is a music sheet collection management system built with Next.js, MongoDB, and TypeScript. The system manages archives of music sheets, collections, and user interactions.

## Code Style Guidelines

- Use TypeScript for all new code
- Follow the existing component structure in the `components` directory
- Use functional components with hooks
- Implement proper error handling and loading states
- Use SWR for data fetching
- Follow the existing model structure in the `models` directory

## TypeScript Guidelines

- Always define types for all variables, parameters, and return values
- Use strict type checking (enabled in tsconfig.json)
- Follow these specific type rules:
  - Use single quotes for strings (from dprint.json)
  - Use 2 spaces for indentation (from dprint.json)
  - Place opening braces on the same line (from dprint.json)
  - Use ASI (Automatic Semicolon Insertion) style (from dprint.json)
  - Use trailing commas only in multi-line (from dprint.json)
  - Use type assertions with space before expression (from dprint.json)
  - Use type annotations without space before colon (from dprint.json)
- For MongoDB models:
  - Always extend Partial<Document> for model interfaces
  - Use Types.ObjectId for MongoDB IDs
  - Define all model fields with proper types
  - Use Schema.Types.ObjectId for references
- For React components:
  - Define props interface for each component
  - Use proper event types for handlers
  - Type all hooks and their return values
  - Use proper types for SWR responses
- For API responses:
  - Define interfaces for all API responses
  - Use proper error types
  - Type all API parameters
- For utility functions:
  - Define return types explicitly
  - Use proper generic types where applicable
  - Type all parameters
  - Document complex type relationships

## Documentation Requirements

- Keep the docs folder updated with any significant changes
- Document new features in the appropriate markdown files
- Update data model documentation when schema changes occur
- Maintain clear API documentation

## Testing Guidelines

- Test pages are located in `/app/test/`
- Ensure new features have corresponding test pages
- Document test cases and expected behavior

## Security Considerations

- Handle sensitive data appropriately
- Implement proper authentication checks
- Follow security best practices for file handling
- Protect API endpoints

## File Organization

- Keep related components together
- Maintain clear separation of concerns
- Use appropriate file naming conventions
- Follow the existing directory structure

## Common Tasks

1. When adding new features:

   - Create appropriate test pages
   - Update documentation
   - Follow the existing patterns
   - Implement proper error handling

2. When fixing bugs:

   - Document the issue
   - Provide clear solution
   - Update tests if necessary
   - Verify the fix

3. When refactoring:
   - Maintain backward compatibility
   - Update documentation
   - Test thoroughly
   - Follow existing patterns

## Communication Style

- Be clear and concise
- Provide context for changes
- Explain complex decisions
- Use appropriate technical terminology

## Special Instructions

- Always check for existing similar functionality before implementing new features
- Consider mobile responsiveness in UI changes
- Maintain consistent error handling patterns
- Follow the existing authentication flow
- Use the established state management patterns
