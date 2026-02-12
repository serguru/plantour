# GitHub Copilot Pull Requests Explanation

## Issue
You noticed 2 pull requests in your repository that you didn't manually create.

## What Are These PRs?

These are **automated pull requests created by GitHub Copilot**:

### PR #37: "Remove WeatherForecast template boilerplate"
- **Creator**: GitHub Copilot (Bot)
- **Purpose**: Removes default ASP.NET template files (WeatherForecast.cs and WeatherForecastController.cs)
- **Status**: Open (Draft)
- **Branch**: copilot/delete-unwanted-entity
- **Changes**: Deleted 2 files with 37 lines removed

### PR #38: "[WIP] Investigate and remove unauthorized pull requests"  
- **Creator**: GitHub Copilot (Bot)
- **Purpose**: Investigating and documenting these Copilot-generated PRs
- **Status**: Open (Work in Progress)
- **Branch**: copilot/investigate-and-remove-unauthorized-pull-requests

## Why Were These Created?

These PRs were created automatically when you:
- Used GitHub Copilot features to work on your repository
- Invoked Copilot to perform tasks like cleaning up template code
- Asked Copilot to investigate issues

**Important**: These are NOT unauthorized or malicious PRs. They are legitimate automation from GitHub's Copilot service.

## How to Close These PRs

Since you cannot "delete" PRs on GitHub (they remain in history), you can **close** them:

### Method 1: Via GitHub Web Interface
1. Navigate to: https://github.com/serguru/plantour/pulls
2. Click on the PR you want to close
3. Scroll to the bottom of the PR page
4. Click the **"Close pull request"** button

### Method 2: Via GitHub CLI (gh)
```bash
# Close PR #37
gh pr close 37 --repo serguru/plantour --comment "Closing Copilot-generated PR"

# Close PR #38  
gh pr close 38 --repo serguru/plantour --comment "Closing Copilot-generated PR"
```

### Method 3: Via Git API (using curl)
```bash
# You'll need a GitHub Personal Access Token
curl -X PATCH \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/serguru/plantour/pulls/37 \
  -d '{"state":"closed"}'
```

## Should You Merge or Close These?

### PR #37 (WeatherForecast removal)
**Review the changes first:**
- If you're not using WeatherForecast template code, it's safe to merge
- If you need those files, close this PR instead

### PR #38 (This investigation)
- This PR creates this documentation file
- You can merge it to keep the documentation
- Or close it if you don't want the documentation

## How to Prevent Copilot from Creating Pull Requests

There are several methods to prevent GitHub Copilot from automatically creating pull requests:

### Method 1: Configure Repository Settings (Recommended)

GitHub Copilot respects repository permissions. To prevent Copilot from creating PRs:

1. **Go to Repository Settings**:
   - Navigate to https://github.com/serguru/plantour/settings
   - Click on "Actions" → "General" in the left sidebar

2. **Restrict Workflow Permissions**:
   - Under "Workflow permissions", select "Read repository contents and packages permissions"
   - Uncheck "Allow GitHub Actions to create and approve pull requests"
   - Click "Save"

### Method 2: Use GitHub Copilot in Read-Only Mode

Configure your GitHub Copilot workspace settings:

1. **In GitHub Settings**:
   - Go to https://github.com/settings/copilot
   - Look for repository access settings
   - Review which repositories Copilot can write to

2. **For VS Code/IDE**:
   - Use Copilot for code suggestions only
   - Don't grant Copilot permission to commit or create PRs
   - Review extension permissions in your IDE

### Method 3: Create a .github/copilot-settings.yml Configuration

Create a repository-level configuration file to control Copilot behavior:

```yaml
# .github/copilot-settings.yml
# Disable automatic PR creation
auto_pr: false
auto_commit: false
```

**Note**: This configuration file format may vary based on GitHub's current Copilot implementation.

### Method 4: Branch Protection Rules

Prevent direct PR creation by configuring branch protection:

1. Go to: https://github.com/serguru/plantour/settings/branches
2. Add a branch protection rule for your default branch
3. Enable "Require pull request reviews before merging"
4. This won't prevent PR creation but adds oversight

### Method 5: Revoke Copilot Access

If you want to completely disable Copilot's repository access:

1. Go to: https://github.com/settings/installations
2. Find "GitHub Copilot"
3. Click "Configure"
4. Under "Repository access", select specific repositories
5. Remove "plantour" from the list or select "Only select repositories" and exclude it

### Method 6: Use CODEOWNERS File

Create a `.github/CODEOWNERS` file to require approval:

```
# Require your approval for all changes
* @serguru
```

This ensures you're notified and can review any PR, including those from Copilot.

### Best Practices

1. **Review Copilot PRs Before Merging**: Always review automated PRs carefully
2. **Close Unwanted PRs Immediately**: Don't let them accumulate
3. **Use Branch Naming Conventions**: Set up rules to auto-label Copilot branches
4. **Monitor Repository Activity**: Enable notifications for new PRs
5. **Educate Team Members**: Ensure everyone knows how Copilot works

### Understanding Copilot's PR Creation

Copilot creates PRs when:
- You explicitly ask it to perform tasks via GitHub Copilot Chat or Workspace
- You grant it permissions to modify your repository
- You invoke Copilot commands that result in code changes

To use Copilot safely:
- Use it for **suggestions only** in your local development environment
- Manually review and commit changes yourself
- Only grant write access when you specifically want automation

## Related Branches

After closing these PRs, you may also want to delete their branches:
```bash
git push origin --delete copilot/delete-unwanted-entity
git push origin --delete copilot/investigate-and-remove-unauthorized-pull-requests
```

## Summary

✅ These PRs are safe and legitimate (created by GitHub Copilot)  
❌ They are NOT security threats or unauthorized access  
🔧 You can close them via GitHub web interface or CLI  
📋 This documentation explains what happened and how to handle them
