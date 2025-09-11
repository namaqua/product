# Contributing to PIM Backend

We love your input! We want to make contributing to PIM Backend as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## We Develop with GitHub

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## We Use [GitHub Flow](https://guides.github.com/introduction/flow/index.html)

Pull requests are the best way to propose changes to the codebase:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](LICENSE) that covers the project.

## Report bugs using GitHub's [issue tracker](https://github.com/yourusername/pim-backend/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/yourusername/pim-backend/issues/new).

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Development Process

1. **Setup your development environment**
   ```bash
   git clone https://github.com/yourusername/pim-backend.git
   cd engines-backend
   ./start-pim.sh
   cd engines && npm install
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write meaningful commit messages
   - Add tests for new features
   - Update documentation

4. **Run tests**
   ```bash
   npm test
   npm run test:e2e
   npm run lint
   ```

5. **Submit a pull request**
   - Provide a clear description of the problem and solution
   - Include the relevant issue number if applicable
   - Add screenshots for UI changes

## Code Style

- We use [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/)
- Run `npm run lint` to check your code
- Run `npm run format` to auto-format your code
- Follow the existing code style

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, missing semicolons, etc)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example:
```
feat: add product import functionality

- Add CSV import endpoint
- Add validation for imported data
- Add unit tests for import service

Closes #123
```

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

## References

This document was adapted from the open-source contribution guidelines for [Facebook's Draft](https://github.com/facebook/draft-js/blob/master/CONTRIBUTING.md)
