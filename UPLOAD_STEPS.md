# Step-by-Step Guide to Upload to GitHub

## Step 1: Create GitHub Account (if you don't have one)
- Go to https://github.com
- Sign up for a free account (or sign in if you already have one)

## Step 2: Create a New Repository on GitHub

1. **Go to GitHub**: https://github.com
2. **Click the "+" icon** (top right corner) → Select "New repository"
3. **Fill in the details**:
   - **Repository name**: `taskmanagement` (or any name you like)
   - **Description**: "Task Management System with role-based access"
   - **Visibility**: Choose **Public** (anyone can see) or **Private** (only you)
   - **DO NOT** check:
     - ❌ Add a README file
     - ❌ Add .gitignore
     - ❌ Choose a license
   - (We already have these files!)
4. **Click "Create repository"**

## Step 3: Copy the Repository URL

After creating the repository, GitHub will show you a page with setup instructions.
You'll see a URL like:
- `https://github.com/YOUR_USERNAME/taskmanagement.git`

**Copy this URL** - you'll need it in the next step!

## Step 4: Connect Your Local Project to GitHub

Open your terminal/command prompt in the project folder and run these commands:

### Replace `YOUR_USERNAME` with your actual GitHub username!

```bash
# Add GitHub as remote repository
git remote add origin https://github.com/YOUR_USERNAME/taskmanagement.git

# Push your code to GitHub
git push -u origin main
```

**Example** (if your username is "johnsmith"):
```bash
git remote add origin https://github.com/johnsmith/taskmanagement.git
git push -u origin main
```

## Step 5: Enter Your Credentials

When you run `git push`, you'll be asked for:
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (NOT your GitHub password)

### How to Create a Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: "Team Management Project"
4. Select scopes: Check **"repo"** (this gives full repository access)
5. Click **"Generate token"**
6. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)
7. Use this token as your password when pushing

## Step 6: Verify Upload

After pushing, go to your GitHub repository page:
`https://github.com/YOUR_USERNAME/taskmanagement`

You should see all your files there! ✅

## Troubleshooting

### If you get "remote origin already exists" error:
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/taskmanagement.git
git push -u origin main
```

### If you get authentication errors:
- Make sure you're using a Personal Access Token, not your password
- Check that the token has "repo" permissions

### If you want to update your code later:
```bash
git add .
git commit -m "Updated project"
git push
```

## That's it! 🎉

Your project is now on GitHub and can be shared with others!

