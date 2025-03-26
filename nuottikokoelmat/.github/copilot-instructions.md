# Copilot Instructions

Welcome to the project! Here are some guidelines to help you get started with GitHub Copilot:

1. **Code Style**: Follow the existing code style and conventions used in the project.
    - Use 2 spaces for indentation.
    - Use single quotes for strings.
    - Place opening braces on the same line as the statement.
    - Use semicolons at the end of statements.
    - Use camelCase for variable and function names.
2. **Components**: Follow these guidelines when working with components:
    - Organize components in the `components` folder.
    - Use functional components with hooks where possible.
    - Ensure components are reusable and modular.
    - Use PropTypes or TypeScript for type checking.
    - Ensure properties are typed correctly when creating components.
3. **Usage in Pages**: Follow these guidelines when using components in pages:
    - Import components at the top of the file.
    - Use descriptive names for component props.
    - Keep the page logic separate from component logic.
    - Ensure proper data flow between components and pages.
    - Make API calls using `swr` using custom hook for each api model, and save these hooks into `models/swrApi`.
    - Store API responses in the component's state using hooks like `useSWR`.
    - Handle loading and error states appropriately.
4. **Comments**: Add comments to explain complex logic and important sections of the code.
5. **Testing**: Ensure that all new code is covered by tests. Write unit tests for new features and bug fixes.
6. **Documentation**: Update the documentation whenever you add new features or make significant changes.
7. **Pull Requests**: When submitting a pull request, provide a clear description of the changes and the motivation behind them.

Thank you for contributing to the project!
