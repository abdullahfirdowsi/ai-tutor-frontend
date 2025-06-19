# GitHub Setup Commands

## 1. Initialize Git (if not already done)
```bash
git init
```

## 2. Add all files
```bash
git add .
```

## 3. Make initial commit
```bash
git commit -m "Initial commit - AI Tutor React App"
```

## 4. Create main branch
```bash
git branch -M main
```

## 5. Add GitHub remote (replace with your repo URL)
```bash
git remote add origin https://github.com/yourusername/ai-tutor-frontend.git
```

## 6. Push to GitHub
```bash
git push -u origin main
```

## 7. Optional: Add .nvmrc for Node version
```bash
echo "18" > .nvmrc
git add .nvmrc
git commit -m "Add Node version specification"
git push
```

## Next Steps:
1. Go to your Netlify site settings
2. Navigate to Build & deploy → Continuous Deployment
3. Click "Link site to Git"
4. Select GitHub and your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Add environment variables in Site settings → Environment variables