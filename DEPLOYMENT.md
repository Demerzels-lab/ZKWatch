# ZKWatch - Deployment Guide

## GitHub Repository
Repository telah berhasil dibuat dan di-push ke:
**https://github.com/Demerzels-lab/ZKWatch**

## Deployment ke Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Kunjungi [https://vercel.com](https://vercel.com)
2. Login dengan akun GitHub Anda
3. Click "Add New Project"
4. Import repository "Demerzels-lab/ZKWatch"
5. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `pnpm build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `pnpm install` (default)
6. Click "Deploy"

Vercel akan otomatis mendeteksi Node.js version dari `.nvmrc` file (20.9.0+) dan menggunakan versi yang benar.

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy
cd /workspace/zkwatch
vercel --prod
```

### Option 3: Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Demerzels-lab/ZKWatch)

## Environment Variables

Tidak ada environment variables yang diperlukan untuk deployment saat ini karena aplikasi menggunakan mock data.

Jika ingin mengintegrasikan dengan WalletConnect, tambahkan:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: Your WalletConnect Project ID

## Post-Deployment

Setelah deployment sukses:
1. Vercel akan memberikan URL deployment (misalnya: `zkwatch.vercel.app`)
2. Test semua fitur:
   - Landing page
   - Dashboard
   - Agent deployment
   - Monitoring feed
   - Agent management
   - Portfolio
   - Settings
3. Wallet connection akan berfungsi di production URL

## Custom Domain (Optional)

Untuk menambahkan custom domain:
1. Buka Vercel Dashboard > Project Settings > Domains
2. Tambahkan domain Anda
3. Update DNS records sesuai instruksi Vercel

## Troubleshooting

### Build Errors
- Pastikan Node.js version >= 20.9.0
- Vercel otomatis menggunakan version dari `.nvmrc`
- Check build logs di Vercel Dashboard

### RainbowKit Warnings
- Peer dependency warnings aman untuk diabaikan
- Aplikasi akan tetap berfungsi normal

## Monitoring

- View deployment logs: Vercel Dashboard > Deployments
- View analytics: Vercel Dashboard > Analytics
- Set up notifications untuk deployment failures

---

**Repository**: https://github.com/Demerzels-lab/ZKWatch
**Status**: ✅ Ready for Deployment
