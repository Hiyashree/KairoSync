# GitHub Upload Instructions

## After creating your GitHub repository, run these commands:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/taskmanagement.git

# Push to GitHub
git push -u origin main
```

## If you're using SSH instead of HTTPS:

```bash
git remote add origin git@github.com:YOUR_USERNAME/taskmanagement.git
git push -u origin main
```

## Alternative: Using GitHub CLI (if installed)

```bash
gh repo create taskmanagement --public --source=. --remote=origin --push
```

## Troubleshooting

### If you get authentication errors:
1. Use a Personal Access Token instead of password
2. Or set up SSH keys for GitHub

### If the repository already exists on GitHub:
```bash
git remote add origin https://github.com/YOUR_USERNAME/taskmanagement.git
git branch -M main
git push -u origin main
```

### To update the repository later:
```bash
git add .
git commit -m "Your commit message"
git push
```

