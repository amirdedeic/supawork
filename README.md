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
- Hugging Face Inference API (Gemma-7b-it)
- GitHub Pages for hosting

## Setup

1. Clone this repository
2. Open `index.html` in your browser
3. Enter your Hugging Face API key when prompted
4. Start creating your goal roadmap!

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
2. Drag and drop all the project files (`index.html`, `styles.css`, `script.js`, `favicon.svg`, `CNAME`, etc.)
3. Add a commit message like "Initial commit"
4. Click "Commit changes"

### Option 2: Using Git Command Line

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/yourusername/supawork-xyz.git
   cd supawork-xyz