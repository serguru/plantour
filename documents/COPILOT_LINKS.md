# Direct Links: Prohibit Copilot from Writing to Your Repos

## 🔗 Quick Links

### Option 1: Repository-Level Control (Recommended)
**Prevent Copilot from creating PRs in THIS repository:**

👉 **https://github.com/serguru/plantour/settings/actions**

**What to do:**
1. Scroll to "Workflow permissions"
2. Select: **"Read repository contents and packages permissions"**
3. **Uncheck**: "Allow GitHub Actions to create and approve pull requests"
4. Click **Save**

---

### Option 2: Organization/Account-Level Control
**Control Copilot's access to ALL your repositories:**

👉 **https://github.com/settings/installations**

**What to do:**
1. Find "GitHub Copilot" in the list
2. Click **"Configure"**
3. Under "Repository access":
   - Select **"Only select repositories"**
   - Remove any repos you want to protect
   - Or choose specific repos to allow
4. Click **Save**

---

### Option 3: Copilot Settings
**Manage Copilot features:**

👉 **https://github.com/settings/copilot**

**What to do:**
- Review your Copilot subscription and settings
- Control which features are enabled

---

## 📋 Which Link Should I Use?

| **Scenario** | **Use This Link** |
|--------------|-------------------|
| Block PRs in plantour repo only | [Repository Actions Settings](https://github.com/serguru/plantour/settings/actions) |
| Block Copilot from ALL repos | [GitHub Apps Installations](https://github.com/settings/installations) |
| Adjust Copilot features | [Copilot Settings](https://github.com/settings/copilot) |

---

## ✅ Recommended: Option 1 (Repository Actions)

**Best for:** Preventing automated PRs while keeping Copilot's helpful features

**Link:** https://github.com/serguru/plantour/settings/actions

**Takes:** 2 minutes

**Result:** 
- ✅ Copilot can't create PRs
- ✅ Copilot still works for code suggestions in your IDE
- ✅ No other functionality affected

---

## 📚 More Information

For detailed instructions, see:
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Step-by-step guide
- [PREVENT_COPILOT_PRS.md](./PREVENT_COPILOT_PRS.md) - Comprehensive documentation

---

**Last Updated:** 2026-02-12  
**Repository:** serguru/plantour
