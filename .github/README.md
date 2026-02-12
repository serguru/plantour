# GitHub Configuration

This directory contains GitHub-specific configuration files for the plantour repository.

## Files

### CODEOWNERS
Defines code ownership and automatic reviewer assignment.

- All changes require review from @serguru
- Prevents automated PRs from being merged without human oversight
- Applies to PRs created by GitHub Copilot and other automation tools

## Purpose

These configurations help:
- Ensure code quality through mandatory reviews
- Prevent unauthorized automated changes
- Maintain oversight of all code modifications
- Control GitHub Copilot's ability to modify the repository

## Additional Recommended Settings

To fully prevent GitHub Copilot from creating PRs, also configure:

1. **Repository Settings** → **Actions** → **General**:
   - Set "Workflow permissions" to "Read repository contents and packages permissions"
   - Uncheck "Allow GitHub Actions to create and approve pull requests"

2. **Repository Settings** → **Branches**:
   - Add branch protection rule for `main`
   - Enable "Require a pull request before merging"
   - Enable "Require review from Code Owners"

See [../documents/PREVENT_COPILOT_PRS.md](../documents/PREVENT_COPILOT_PRS.md) for detailed instructions.
