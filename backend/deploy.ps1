# ShaadiOS Backend Deployment Script for Windows
# Run this script to deploy to Vercel

Write-Host @"
╔════════════════════════════════════════════════════════════╗
║     🚀 ShaadiOS Backend Deployment Script                  ║
╚════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Check if we're in the backend directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Run this script from the backend directory" -ForegroundColor Red
    exit 1
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No .env file found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file. Please edit it with your Neon database URLs!" -ForegroundColor Green
    Write-Host "   Get your URLs from: https://console.neon.tech" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press any key to open .env in Notepad..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    notepad ".env"
    exit 0
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if Prisma client is generated
if (-not (Test-Path "node_modules/.prisma/client")) {
    Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
    npm run db:generate
}

Write-Host ""
Write-Host "Choose deployment platform:" -ForegroundColor Cyan
Write-Host "1. Vercel (Recommended - Free tier available)"
Write-Host "2. Railway (Free tier + easy database)"
Write-Host "3. Build Docker image"
Write-Host "4. Run locally first"
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Green
        
        # Check if Vercel CLI is installed
        $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
        if (-not $vercelInstalled) {
            Write-Host "📥 Installing Vercel CLI..." -ForegroundColor Yellow
            npm install -g vercel
        }

        Write-Host ""
        Write-Host "Step 1: Push code to GitHub (if not done)" -ForegroundColor Yellow
        Write-Host "  git init"
        Write-Host "  git add ."
        Write-Host "  git commit -m 'Prepare for deployment'"
        Write-Host "  git remote add origin https://github.com/YOUR_USERNAME/shaadios-backend.git"
        Write-Host "  git push -u origin main"
        Write-Host ""
        
        $pushed = Read-Host "Have you pushed to GitHub? (y/n)"
        if ($pushed -ne "y") {
            Write-Host "Please push to GitHub first, then run this script again." -ForegroundColor Yellow
            exit 0
        }

        Write-Host ""
        Write-Host "Step 2: Deploy to Vercel" -ForegroundColor Yellow
        Write-Host "  1. Go to https://vercel.com"
        Write-Host "  2. Sign up with GitHub"
        Write-Host "  3. Import your repository"
        Write-Host "  4. Add environment variables from your .env file"
        Write-Host "  5. Click Deploy"
        Write-Host ""
        Write-Host "Environment variables to add:" -ForegroundColor Cyan
        Get-Content ".env" | ForEach-Object {
            if ($_ -match "^([^#][^=]+)=(.*)$") {
                Write-Host "  $($matches[1]) = [your value]"
            }
        }
        Write-Host ""
        Write-Host "✅ After deployment, run database migrations:" -ForegroundColor Green
        Write-Host "  vercel login"
        Write-Host "  vercel link"
        Write-Host "  npx prisma migrate deploy"
        Write-Host ""
        Write-Host "Opening Vercel..." -ForegroundColor Cyan
        Start-Process "https://vercel.com"
    }

    "2" {
        Write-Host ""
        Write-Host "🚂 Deploying to Railway..." -ForegroundColor Green
        
        Write-Host "Step 1: Push code to GitHub (if not done)" -ForegroundColor Yellow
        Write-Host "  git init"
        Write-Host "  git add ."
        Write-Host "  git commit -m 'Prepare for deployment'"
        Write-Host "  git remote add origin https://github.com/YOUR_USERNAME/shaadios-backend.git"
        Write-Host "  git push -u origin main"
        Write-Host ""
        
        $pushed = Read-Host "Have you pushed to GitHub? (y/n)"
        if ($pushed -ne "y") {
            Write-Host "Please push to GitHub first, then run this script again." -ForegroundColor Yellow
            exit 0
        }

        Write-Host ""
        Write-Host "Step 2: Deploy to Railway" -ForegroundColor Yellow
        Write-Host "  1. Go to https://railway.app"
        Write-Host "  2. Sign up with GitHub"
        Write-Host "  3. Click 'New Project'"
        Write-Host "  4. Select 'Deploy from GitHub repo'"
        Write-Host "  5. Choose shaadios-backend"
        Write-Host "  6. Add environment variables"
        Write-Host ""
        Write-Host "Environment variables to add:" -ForegroundColor Cyan
        Get-Content ".env" | ForEach-Object {
            if ($_ -match "^([^#][^=]+)=(.*)$") {
                Write-Host "  $($matches[1]) = [your value]"
            }
        }
        Write-Host ""
        Write-Host "Opening Railway..." -ForegroundColor Cyan
        Start-Process "https://railway.app"
    }

    "3" {
        Write-Host ""
        Write-Host "🐳 Building Docker image..." -ForegroundColor Green
        
        # Check if Docker is installed
        $dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
        if (-not $dockerInstalled) {
            Write-Host "❌ Docker is not installed. Install from https://docker.com" -ForegroundColor Red
            exit 1
        }

        Write-Host "Building image..." -ForegroundColor Yellow
        docker build -t shaadios-backend .
        
        Write-Host ""
        Write-Host "✅ Docker image built successfully!" -ForegroundColor Green
        Write-Host "Run locally with:" -ForegroundColor Yellow
        Write-Host "  docker run -p 3001:3001 --env-file .env shaadios-backend"
        Write-Host ""
        
        $run = Read-Host "Run container now? (y/n)"
        if ($run -eq "y") {
            docker run -p 3001:3001 --env-file .env shaadios-backend
        }
    }

    "4" {
        Write-Host ""
        Write-Host "🏠 Running locally..." -ForegroundColor Green
        
        # Check database connection
        Write-Host "Checking database connection..." -ForegroundColor Yellow
        try {
            npm run db:migrate
            Write-Host "✅ Database connected and migrated!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Database connection failed. Check your .env file." -ForegroundColor Red
            exit 1
        }

        # Seed database
        Write-Host ""
        $seed = Read-Host "Seed database with demo data? (y/n)"
        if ($seed -eq "y") {
            npm run db:seed
        }

        Write-Host ""
        Write-Host "🚀 Starting development server..." -ForegroundColor Green
        Write-Host "API will be available at: http://localhost:3001" -ForegroundColor Cyan
        Write-Host ""
        npm run dev
    }

    default {
        Write-Host "Invalid choice. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✨ Done!" -ForegroundColor Green
