# Benedict Cafe Loyalty Frontend

## Deployment

### Vercel Configuration

**Repository:** https://github.com/benedicttashkent-rgb/loyalty-frontend.git

**Environment Variables:**
- `VITE_API_BASE_URL` - Backend API URL (e.g., `https://web-production-9dbea.up.railway.app/api`)

**Build Settings:**
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `build`

### API Configuration

The app uses `VITE_API_BASE_URL` environment variable with fallback:
1. If `VITE_API_BASE_URL` is set → uses it
2. If in development → uses `/api` (Vite proxy)
3. If in production without env var → uses Railway URL fallback

### Backend

**Repository:** https://github.com/azamoviich/loyaltyback.git  
**URL:** https://web-production-9dbea.up.railway.app
