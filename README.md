# BUNTHEON Application

## Railway Deployment Instructions

### Prerequisites
- [Railway account](https://railway.app/)
- Git repository (GitHub, GitLab, etc.)

### Deployment Steps

1. **Push your code to a Git repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repository-url>
   git push -u origin main
   ```

2. **Create a new project in Railway**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Connect your GitHub account if you haven't
   - Select this repository

3. **Configure environment variables (if needed)**
   - Go to your project settings in Railway
   - Add any necessary environment variables

4. **Verify deployment**
   - Railway will automatically deploy your application
   - Once complete, you can access your app via the provided URL

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Visit `http://localhost:3000` in your browser
