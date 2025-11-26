# ZKWatch - Deployment Guide

## GitHub Repository
Repository has been successfully created and pushed to:
**https://github.com/Demerzels-lab/ZKWatch**

## Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Visit [https://vercel.com](https://vercel.com)
2. Log in with your GitHub account
3. Click "Add New Project"
4. Import repository "Demerzels-lab/ZKWatch"
5. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `pnpm build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `pnpm install` (default)
6. Click "Deploy"

Vercel will automatically detect Node.js version from `.nvmrc` file (20.9.0+) and use the correct version.

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd /workspace/zkwatch
vercel --prod
```

### Option 3: Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Demerzels-lab/ZKWatch)

## Environment Variables

No environment variables are required for current deployment as the application uses mock data.

To integrate with WalletConnect, add:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: Your WalletConnect Project ID

## Post-Deployment

After successful deployment:
1. Vercel will provide a deployment URL (e.g., `zkwatch.vercel.app`)
2. Test all features:
   - Landing page
   - Dashboard
   - Agent deployment
   - Monitoring feed
   - Agent management
   - Portfolio
   - Settings
3. Wallet connection will work on production URL

## Custom Domain (Optional)

To add a custom domain:
1. Open Vercel Dashboard > Project Settings > Domains
2. Add your domain
3. Update DNS records according to Vercel instructions

## Troubleshooting

### Build Errors
- Ensure Node.js version >= 20.9.0
- Vercel automatically uses version from `.nvmrc`
- Check build logs in Vercel Dashboard

### RainbowKit Warnings
- Peer dependency warnings are safe to ignore
- Application will continue to function normally

## Monitoring

- View deployment logs: Vercel Dashboard > Deployments
- View analytics: Vercel Dashboard > Analytics
- Set up notifications for deployment failures

---

**Repository**: https://github.com/Demerzels-lab/ZKWatch
**Status**: ✅ Ready for Deployment
