# 📤 Push to GitHub - Step by Step

## Prerequisites

1. Create GitHub account (if you don't have one)
2. Install Git: https://git-scm.com/download/win
3. Create new repository on GitHub (don't initialize with README)

## Setup Git Repository

### Step 1: Configure Git (First Time Only)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 2: Initialize Local Repository

Navigate to project directory:
```bash
cd C:\Users\johns\Projects\arc-cross-border-payments
```

Initialize git:
```bash
git init
```

### Step 3: Add Remote Repository

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME`:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

Verify:
```bash
git remote -v
```

### Step 4: Create .gitignore (Already Done)

Check it includes:
```
node_modules/
.env
.env.local
.next/
artifacts/
cache/
```

### Step 5: Add and Commit Files

```bash
# Stage all files
git add .

# Commit
git commit -m "Initial commit: Arc cross-border payments platform"
```

### Step 6: Push to GitHub

For the first push:
```bash
git branch -M main
git push -u origin main
```

For subsequent pushes:
```bash
git push origin main
```

---

## After First Push

### Making Updates

```bash
# Make changes to files
# Then:

git add .
git commit -m "Your descriptive message"
git push origin main
```

### Create GitHub Release

On GitHub:
1. Go to your repository
2. Click "Releases" tab
3. Click "Create a new release"
4. Add version tag (e.g., v1.0.0)
5. Add description
6. Click "Publish release"

---

## Important Files to Update

Before pushing, update these for your repository:

### README.md
- Replace `yourusername` with your GitHub username
- Update links to your deployed contract
- Add your contact info

### DEPLOYMENT_GUIDE.md
- Update GitHub clone URL
- Add your specific deployment instructions

### .env.example
- Verify all example values are correct
- Add any additional config needed

---

## GitHub Best Practices

### Branches
```bash
# Create feature branch
git checkout -b feature/new-feature

# Push feature branch
git push origin feature/new-feature

# Create Pull Request on GitHub
# After review, merge to main
```

### Commit Messages
```
Good: "Add currency conversion to payment form"
Bad: "fixed stuff"

Good: "Fix: Handle token approval for non-USD currencies"
Bad: "Fix"
```

### `.gitignore` Verification

Make sure these are in `.gitignore`:
```
node_modules/
.env
.env.local
frontend/.env.local
.next/
out/
build/
artifacts/
cache/
.DS_Store
```

---

## Full Push Command Summary

```bash
# 1. Configure (first time)
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# 2. Initialize
cd your-project-directory
git init

# 3. Add remote
git remote add origin https://github.com/YOUR_USERNAME/arc-cross-border-payments.git

# 4. Verify .gitignore exists

# 5. Add and commit
git add .
git commit -m "Initial commit: Arc cross-border payments"

# 6. Push
git branch -M main
git push -u origin main
```

---

## If You Already Have Git Set Up

Just do this:

```bash
cd C:\Users\johns\Projects\arc-cross-border-payments
git add .
git commit -m "Initial commit: Arc cross-border payments platform"
git push origin main
```

---

## Troubleshooting

**Error: "Permission denied"**
- Generate SSH key: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
- Or use token authentication

**Error: "Already exists"**
- Repository already exists on GitHub
- Run: `git push -f origin main` (force push)

**Error: "Nothing to commit"**
- All files already committed
- Make changes first, then add/commit again

---

## What Gets Pushed

✅ **Will be pushed:**
- Smart contract (Solidity)
- Frontend (React/Next.js)
- Configuration files
- Documentation
- Documentation guides

❌ **Will NOT be pushed (in .gitignore):**
- node_modules/
- .env files
- .next build folder
- Private keys
- API keys
- Build artifacts

---

**Ready to share your project with the world? 🚀**
