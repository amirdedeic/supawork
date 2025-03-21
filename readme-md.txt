# SupaWork - Goal Achievement Roadmap Creator

A sleek, responsive web application that helps users achieve their goals by generating personalized roadmaps using AI.

## Features

- **Interactive Chat Interface**: Step-by-step goal planning process
- **AI-Generated Roadmaps**: Personalized plans with specific milestones
- **Timeline Visualization**: Clear, structured progress timeline
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode**: Sleek, modern dark interface
- **Local Storage**: Securely saves API keys in the browser
- **Download Option**: Export your roadmap as a text file

## Technologies Used

- HTML5
- CSS3 (with modern CSS variables and flexbox)
- Vanilla JavaScript (ES6+)
- Hugging Face Inference API (Mistral-7B-Instruct)
- GitHub Pages for hosting

## Setup

1. Clone this repository
2. Open `index.html` in your browser
3. Enter your Hugging Face API key when prompted
4. Start creating your goal roadmap!

## Deployment to GitHub Pages

See the "Deployment Guide" section below for step-by-step instructions on how to deploy this site to GitHub Pages.

## API Key

This application requires a Hugging Face API key to function. The key is stored locally in your browser and is never sent to our servers.

### Getting a Hugging Face API Key

1. Create a free account on [Hugging Face](https://huggingface.co/join)
2. Go to your [Settings > Access Tokens](https://huggingface.co/settings/tokens)
3. Create a new token with "read" access
4. Use this token in the SupaWork application

The application uses Hugging Face's free inference API with rate limits that should be sufficient for personal use.

## License

MIT

---

# Deployment Guide

Follow these steps to deploy the SupaWork website to GitHub Pages:

## 1. Create a GitHub Repository

1. Sign in to your GitHub account or create one if you don't have it already
2. Click on the "+" icon in the top-right corner and select "New repository"
3. Name your repository (for example, "supawork-xyz")
4. Choose "Public" for the repository visibility
5. Click "Create repository"

## 2. Upload Your Files

### Option 1: Using GitHub Web Interface

1. In your new repository, click the "Add file" button and select "Upload files"
2. Drag and drop all the project files (`index.html`, `styles.css`, `script.js`, etc.)
3. Add a commit message like "Initial commit"
4. Click "Commit changes"

### Option 2: Using Git Command Line

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/yourusername/supawork-xyz.git
   cd supawork-xyz
   ```

2. Copy all your project files to this directory

3. Add the files, commit, and push:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

## 3. Configure GitHub Pages

1. In your GitHub repository, go to "Settings"
2. Scroll down to the "GitHub Pages" section or click on "Pages" in the left sidebar
3. Under "Source", select "main" branch
4. Click "Save"
5. Wait a few minutes for GitHub to build your site
6. GitHub will provide you with a URL where your site is published (something like `https://yourusername.github.io/supawork-xyz/`)

## 4. Set Up Custom Domain (Optional)

To use your `supawork.xyz` domain:

1. In your domain registrar (like Namecheap, GoDaddy, etc.), add these DNS records:
   - Type: A Record, Host: @, Value: 185.199.108.153
   - Type: A Record, Host: @, Value: 185.199.109.153
   - Type: A Record, Host: @, Value: 185.199.110.153
   - Type: A Record, Host: @, Value: 185.199.111.153
   - Type: CNAME, Host: www, Value: yourusername.github.io

2. In your GitHub repository:
   - Go to "Settings" > "Pages"
   - Under "Custom domain", enter `supawork.xyz`
   - Click "Save"
   - Check "Enforce HTTPS" once the certificate is issued (may take up to 24 hours)

3. Create a file named `CNAME` in your repository with just this line:
   ```
   supawork.xyz
   ```

## 5. Verify Deployment

1. Visit your site at GitHub Pages URL or your custom domain
2. Test all features to ensure everything works properly
3. If needed, make changes to your files, commit, and push - GitHub Pages will automatically update

## Troubleshooting

- **404 Not Found**: Make sure your repository has an `index.html` file at the root level
- **CSS/JS Not Loading**: Check file paths in your HTML (they should be relative, not absolute)
- **Custom Domain Not Working**: DNS changes can take 24-48 hours to propagate

## Maintaining Your Site

To make changes to your site after deployment:

1. Edit the files locally
2. Commit and push changes to GitHub
3. GitHub Pages will automatically rebuild and update your site

Your SupaWork site should now be live and accessible to everyone!