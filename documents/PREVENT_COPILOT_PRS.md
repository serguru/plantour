# How to Prevent GitHub Copilot from Creating Pull Requests

This guide provides comprehensive instructions for preventing GitHub Copilot from automatically creating pull requests in your repository.

## Quick Answer

The most effective way to prevent Copilot from creating PRs is to **restrict GitHub Actions permissions** in your repository settings:

1. Go to: https://github.com/serguru/plantour/settings/actions
2. Under "Workflow permissions", select **"Read repository contents and packages permissions"**
3. **Uncheck** "Allow GitHub Actions to create and approve pull requests"
4. Click **Save**

## Detailed Methods

### Method 1: Repository Settings (Most Effective)

This is the recommended approach as it prevents any automated tool (including Copilot) from creating PRs.

**Steps:**
1. Navigate to your repository settings: https://github.com/serguru/plantour/settings
2. Click on **"Actions"** in the left sidebar
3. Select **"General"**
4. Scroll down to **"Workflow permissions"**
5. Select **"Read repository contents and packages permissions"**
6. Ensure **"Allow GitHub Actions to create and approve pull requests"** is **UNCHECKED**
7. Click **"Save"**

**Result:** Copilot will not be able to create pull requests, but can still provide code suggestions.

### Method 2: GitHub Copilot Access Configuration

Control which repositories Copilot can access:

**Steps:**
1. Go to GitHub Apps settings: https://github.com/settings/installations
2. Find **"GitHub Copilot"** or **"Copilot Workspace"** in the list
3. Click **"Configure"**
4. Under **"Repository access"**, you have options:
   - **All repositories**: Copilot can access all repos (NOT recommended for preventing PRs)
   - **Only select repositories**: Choose specific repos (exclude plantour)
5. Click **"Save"**

**Result:** Copilot won't have access to create PRs in excluded repositories.

### Method 3: Branch Protection Rules

Add an extra layer of protection to your main branch:

**Steps:**
1. Go to: https://github.com/serguru/plantour/settings/branches
2. Click **"Add branch protection rule"**
3. In "Branch name pattern", enter: `main` (or your default branch)
4. Enable these settings:
   - ✅ **Require a pull request before merging**
   - ✅ **Require approvals** (set to at least 1)
   - ✅ **Dismiss stale pull request approvals when new commits are pushed**
   - ✅ **Require review from Code Owners** (optional)
5. Click **"Create"** or **"Save changes"**

**Result:** All PRs (including Copilot's) will require your approval before merging.

### Method 4: CODEOWNERS File

Ensure you're always notified and required to review PRs:

**Steps:**
1. Create a file: `.github/CODEOWNERS`
2. Add the following content:
```
# All files require review from @serguru
* @serguru

# Specific paths (examples)
/plantour-server/* @serguru
/plantour-client/* @serguru
```
3. Commit and push the file
4. Configure branch protection to **"Require review from Code Owners"**

**Result:** You'll be automatically assigned as a reviewer on all PRs.

### Method 5: Disable Copilot Workspace

If you're using GitHub Copilot Workspace (the feature that creates PRs):

**Steps:**
1. In your IDE or GitHub interface, disable Copilot Workspace features
2. Use only Copilot's code completion features
3. Don't invoke Copilot commands that modify repository state

**Result:** Copilot will only provide inline suggestions, not create PRs.

### Method 6: Use Local Copilot Only

Configure your development environment to use Copilot locally without repository write access:

**For VS Code:**
1. Install the GitHub Copilot extension
2. Use Copilot for code suggestions only
3. Don't grant additional permissions when prompted
4. Manually commit and push your changes

**For GitHub CLI:**
1. Don't use `gh copilot` commands that create PRs
2. Use `gh copilot suggest` for command suggestions: `gh copilot suggest "your command"`
3. Review and execute commands manually

**Result:** Copilot assists you locally but doesn't create PRs automatically.

## Recommended Configuration

For the **plantour** repository, we recommend this setup:

### 1. Create `.github/CODEOWNERS`
```bash
cd /home/runner/work/plantour/plantour
mkdir -p .github
cat > .github/CODEOWNERS << 'EOF'
# Require @serguru review for all changes
* @serguru
EOF
git add .github/CODEOWNERS
git commit -m "Add CODEOWNERS file"
git push
```

### 2. Configure Repository Settings
- ✅ Set Actions to "Read repository contents" only
- ✅ Uncheck "Allow GitHub Actions to create and approve pull requests"

### 3. Set Up Branch Protection
- ✅ Require pull request reviews
- ✅ Require review from Code Owners
- ✅ Require status checks to pass

## Testing Your Configuration

After implementing these changes, test that Copilot cannot create PRs:

### Test 1: Verify Actions Permissions
```bash
# Check current Actions permissions via GitHub CLI
gh api repos/serguru/plantour/actions/permissions
```
Expected result: Should show `"default_workflow_permissions": "read"` and `"can_approve_pull_request_reviews": false`

### Test 2: Attempt to Use Copilot Commands
Try commands that would normally create PRs (these should now fail):

**In GitHub Copilot Workspace:**
- Try: "Create a PR to fix X"
- Expected: Permission denied or no PR created

**In GitHub CLI:**
```bash
# This should fail with permissions error
gh copilot-workspace create-pr --title "Test PR"
```

### Test 3: Verify Local Copilot Still Works
**In VS Code or your IDE:**
1. Open a code file
2. Start typing code
3. Verify Copilot suggestions appear
4. Accept a suggestion

Expected result: ✅ Code suggestions work normally

### Test 4: Check Branch Protection
```bash
# View branch protection rules
gh api repos/serguru/plantour/branches/main/protection
```

### Test 5: Verify CODEOWNERS
1. Create a test branch: `git checkout -b test-codeowners`
2. Make a small change: `echo "test" >> README.md`
3. Push and create a PR: `gh pr create --title "Test CODEOWNERS"`
4. Check that @serguru is automatically assigned as reviewer

Expected result: You should see yourself as required reviewer

## What Still Works

Even with these restrictions, Copilot will still:
- ✅ Provide inline code completions in your IDE
- ✅ Offer code suggestions and explanations
- ✅ Help with code reviews (read-only)
- ✅ Generate code snippets locally
- ✅ Answer programming questions

What won't work:
- ❌ Automatic pull request creation
- ❌ Direct commits to your repository
- ❌ Automated code changes without your review

## Handling Existing Copilot PRs

If you already have Copilot-created PRs:

1. **Review them carefully**:
   - Check what changes they propose
   - Verify the changes are safe and desired

2. **Close unwanted PRs**:
   ```bash
   gh pr close 37 --comment "Closing automated PR"
   ```

3. **Delete the branches**:
   ```bash
   git push origin --delete copilot/branch-name
   ```

4. **Merge useful ones** (if any):
   - Review the code
   - Test the changes
   - Merge via GitHub UI or CLI

## Troubleshooting

### Copilot Still Creating PRs?

1. **Check GitHub App permissions**:
   - Verify Copilot doesn't have write access
   - Review installed GitHub Apps

2. **Verify Actions permissions**:
   - Ensure Actions are set to "Read" only
   - Check that PR creation is disabled

3. **Review team settings**:
   - Check if other team members have granted Copilot access
   - Review organization-level Copilot settings

### Can't Find Copilot Settings?

GitHub Copilot settings may be in different locations depending on your subscription:

- **Individual account**: https://github.com/settings/copilot
- **Organization account**: https://github.com/organizations/ORG_NAME/settings/copilot
- **Enterprise**: Contact your enterprise admin

## Additional Security

For extra security, consider:

1. **Enable audit logs**: Track all repository changes
2. **Set up notifications**: Get alerted for new PRs
3. **Use signed commits**: Require GPG signatures
4. **Regular reviews**: Periodically check open PRs

## Summary

To prevent Copilot from creating PRs:

1. ✅ **Primary**: Disable PR creation in Actions settings
2. ✅ **Secondary**: Configure Copilot repository access
3. ✅ **Backup**: Use branch protection and CODEOWNERS
4. ✅ **Best Practice**: Use Copilot locally for suggestions only

**Remember**: These settings don't disable Copilot's helpful features—they just prevent it from automatically modifying your repository.

## Need Help?

- Review GitHub's official documentation: https://docs.github.com/en/copilot
- Check repository settings carefully
- Test changes in a fork first if unsure
- Contact GitHub Support if issues persist

---

**Related Documentation:**
- [COPILOT_PRS_EXPLANATION.md](./COPILOT_PRS_EXPLANATION.md) - Understanding existing Copilot PRs
- [GitHub Actions Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
