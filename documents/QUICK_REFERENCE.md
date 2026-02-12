# Quick Reference: Preventing Copilot PRs

## 🚀 Fastest Solution (5 minutes)

1. Go to: https://github.com/serguru/plantour/settings/actions
2. Select "Read repository contents and packages permissions"
3. Uncheck "Allow GitHub Actions to create and approve pull requests"
4. Click **Save**

✅ **Done!** Copilot can no longer create PRs.

## 📋 Complete Setup Checklist

- [ ] **Step 1**: Restrict Actions permissions (see above)
- [ ] **Step 2**: Enable branch protection for `main` branch
- [ ] **Step 3**: Require Code Owner reviews (CODEOWNERS file already added!)
- [ ] **Step 4**: Review Copilot access at https://github.com/settings/installations

## 🛡️ Files Added to This Repository

- ✅ `.github/CODEOWNERS` - Requires @serguru review on all PRs
- ✅ `.github/README.md` - Configuration directory documentation
- ✅ `documents/PREVENT_COPILOT_PRS.md` - Complete prevention guide
- ✅ `documents/COPILOT_PRS_EXPLANATION.md` - Understanding existing PRs

## 📚 Full Documentation

For detailed instructions, see: [PREVENT_COPILOT_PRS.md](./PREVENT_COPILOT_PRS.md)

## ✨ What You Can Still Do

Copilot will still work for:
- ✅ Code completions in your IDE
- ✅ Code suggestions and explanations
- ✅ Chat and assistance features
- ✅ Local development help

What's prevented:
- ❌ Automatic pull request creation
- ❌ Direct repository modifications
- ❌ Automated commits without approval

## 🆘 Need More Help?

1. Check the detailed guide: [PREVENT_COPILOT_PRS.md](./PREVENT_COPILOT_PRS.md)
2. Review repository settings: https://github.com/serguru/plantour/settings
3. Check GitHub's documentation: https://docs.github.com/en/copilot

---

**Last Updated**: 2026-02-12  
**Repository**: serguru/plantour
