#!/bin/bash

# GitHub Repository Creation Helper
echo "📋 GitHub Repository Setup Instructions"
echo "========================================"
echo ""
echo "1️⃣  Go to GitHub:"
echo "   https://github.com/new"
echo ""
echo "2️⃣  Create a new repository with these settings:"
echo "   • Repository name: pim-backend (or your preferred name)"
echo "   • Description: Product Information Management System - NestJS Backend"
echo "   • Visibility: Public or Private (your choice)"
echo "   • ⚠️  DO NOT initialize with README (we already have one)"
echo "   • ⚠️  DO NOT add .gitignore (we already have one)"
echo "   • ⚠️  DO NOT add license (we already have MIT license)"
echo ""
echo "3️⃣  After creating, GitHub will show you commands."
echo "   We'll use the 'push an existing repository' option"
echo ""
echo "========================================"
echo ""
read -p "Have you created the GitHub repository? (y/n): " created

if [[ $created =~ ^[Yy]$ ]]; then
    echo ""
    echo "Great! Now let's connect your local repo to GitHub."
    echo ""
    echo "📝 Enter your GitHub username:"
    read -p "GitHub username: " github_username
    
    echo ""
    echo "📝 Enter your repository name (e.g., pim-backend):"
    read -p "Repository name: " repo_name
    
    # Construct the GitHub URL
    github_url="https://github.com/${github_username}/${repo_name}.git"
    
    echo ""
    echo "🔗 Using GitHub URL: $github_url"
    echo ""
    
    # Add remote origin
    echo "Adding GitHub as remote origin..."
    git remote add origin "$github_url" 2>/dev/null || git remote set-url origin "$github_url"
    
    # Push to GitHub
    echo "Pushing to GitHub..."
    echo ""
    
    # Try to push
    if git push -u origin main; then
        echo ""
        echo "✅ Successfully pushed to GitHub!"
        echo ""
        echo "🎉 Your repository is now live at:"
        echo "   https://github.com/${github_username}/${repo_name}"
        echo ""
        echo "📊 GitHub Actions CI/CD pipeline will run automatically on push"
        echo ""
    else
        echo ""
        echo "⚠️  Push failed. This might be because:"
        echo ""
        echo "1. Authentication required. Try:"
        echo "   • Using GitHub Personal Access Token"
        echo "   • Setting up SSH keys"
        echo "   • Using GitHub CLI: gh auth login"
        echo ""
        echo "2. Repository doesn't exist or wrong name"
        echo ""
        echo "3. You might need to use:"
        echo "   git push --set-upstream origin main --force"
        echo ""
        echo "To set up authentication:"
        echo "• Personal Access Token: https://github.com/settings/tokens"
        echo "• SSH Keys: https://github.com/settings/keys"
        echo "• GitHub CLI: brew install gh && gh auth login"
    fi
else
    echo ""
    echo "📝 No problem! Here's what to do:"
    echo ""
    echo "1. Create a repository on GitHub"
    echo "2. Run this script again, or manually add remote:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo "3. Push your code:"
    echo "   git push -u origin main"
fi

echo ""
echo "========================================"
echo "📚 Next Steps:"
echo "• Set up GitHub Secrets for CI/CD (if using Docker Hub)"
echo "• Configure branch protection rules"
echo "• Add collaborators if needed"
echo "• Set up GitHub Pages for documentation"
echo "• Configure GitHub Actions secrets"
