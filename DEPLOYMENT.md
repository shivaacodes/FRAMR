# 🚀 FRAMR DEPLOYMENT GUIDE

FRAMR consists of:
1. **Frontend**: Vite + React 19 SPA (Cyberpunk UI, Web Audio API Club Visualizer, Instagram Reel Player).
2. **Backend**: FastAPI + OpenCV (Optical flow & shot transitions) + FFmpeg 7.x (sub-second CFR video transcode & audio mixing).

---

## ⚡ ARCHITECTURE OVERVIEW

```
  [ User Browser / Mobile Device ]
                 │
        ┌────────┴────────┐
        │                 │
   (Static Web)       (API & Video Streams)
        ▼                 ▼
 ┌──────────────┐   ┌──────────────────────────────┐
 │ VERCEL / CDN │   │ RENDER / RAILWAY / DOCKER    │
 │ React 19 SPA │   │ FastAPI + OpenCV + FFmpeg 7  │
 └──────────────┘   └──────────────────────────────┘
```

> **Why split deployment?**
> Video highlight generation and audio stems synthesis require standard system **FFmpeg** and **OpenCV** system binaries. Serverless platforms (like basic Vercel Serverless Functions) do not support long-running FFmpeg transcode processes. Therefore, the optimal free architecture is **Frontend on Vercel** + **Backend on Render (Docker)**.

---

## 🌟 OPTION 1: 100% FREE CLOUD DEPLOY (RECOMMENDED)

### Step 1: Deploy Backend on Render.com (Docker)
1. Go to **[render.com](https://render.com/)** and sign in with GitHub.
2. Click **New +** $\rightarrow$ **Web Service**.
3. Select your **FRAMR** repository.
4. Fill in the configuration:
   - **Name**: `framr-api` (or any unique name)
   - **Region**: Choose the closest region (e.g., Frankfurt, Oregon, Singapore)
   - **Root Directory**: `backend`
   - **Runtime**: **Docker** *(Render will automatically build using `backend/Dockerfile` which bundles FFmpeg 7, OpenCV, and Python 3.11)*
   - **Instance Type**: **Free**
5. Click **Create Web Service**.
6. Render will build the container in ~2–3 minutes. Once live, copy your service URL (e.g., `https://framr-api.onrender.com`).
7. Test it by opening `https://framr-api.onrender.com/` in your browser. You should see:
   ```json
   {"message": "Welcome to the FRAMR API"}
   ```

---

### Step 2: Deploy Frontend on Vercel
1. Go to **[vercel.com](https://vercel.com/)** and sign in with GitHub.
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your **FRAMR** repository.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click "Edit" and choose `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables**:
   - **Key**: `VITE_API_BASE`
   - **Value**: `https://framr-api.onrender.com` *(your Render backend URL from Step 1, without trailing slash)*
6. Click **Deploy**.
7. Vercel will build the frontend in ~20 seconds. The included `frontend/vercel.json` automatically ensures all client-side routes (`/gallery`, `/ingest`, `/engine`, `/processing/:id`) route seamlessly without 404s.

🎉 **Done!** Your full-stack autonomous highlight engine is live on the internet!

---

## 🚂 OPTION 2: SINGLE-PLATFORM 1-CLICK (RAILWAY.APP)

Railway supports multi-service repositories with automatic Dockerfile discovery.

1. Go to **[railway.app](https://railway.app/)** and log in.
2. Click **New Project** $\rightarrow$ **Deploy from GitHub repo**.
3. **Backend Service**:
   - In Settings, set **Root Directory** to `/backend`.
   - Railway will detect `backend/Dockerfile` and deploy with FFmpeg automatically.
   - Go to **Networking** $\rightarrow$ **Generate Domain** (e.g., `https://framr-backend.up.railway.app`).
4. **Frontend Service**:
   - Click **+ New** $\rightarrow$ **GitHub Repo** (select FRAMR again).
   - In Settings, set **Root Directory** to `/frontend`.
   - Under **Variables**, add `VITE_API_BASE` = `https://framr-backend.up.railway.app`.
   - Go to **Networking** $\rightarrow$ **Generate Domain**.

---

## 🐳 OPTION 3: SELF-HOSTED 1-COMMAND DOCKER COMPOSE

For deploying to your own Linux VPS (DigitalOcean Droplet, AWS EC2, Linode, Hetzner, or local server):

### Prerequisites
- Docker & Docker Compose installed (`docker --version` $\ge 24.0$)

### Launch
```bash
# Clone repository
git clone https://github.com/<your-username>/FRAMR.git
cd FRAMR

# Start both backend and frontend containers
docker compose up -d --build
```

- **Frontend**: Accessible at `http://<your-vps-ip>:3000`
- **Backend API**: Accessible at `http://<your-vps-ip>:8000`
- Video data, highlights, and SQLite database persist in `./backend/data` on the host machine.

---

## 🛠️ OPTION 4: BARE-METAL LINUX VPS (UBUNTU / DEBIAN)

If you prefer running services directly via systemd and Nginx without containers:

### 1. Install System Dependencies
```bash
sudo apt update && sudo apt install -y python3-pip python3-venv ffmpeg nodejs npm nginx git
```

### 2. Setup Backend Service
```bash
cd /var/www/FRAMR/backend
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
```

Create `/etc/systemd/system/framr-backend.service`:
```ini
[Unit]
Description=FRAMR FastAPI Backend Engine
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/FRAMR/backend
ExecStart=/var/www/FRAMR/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now framr-backend
```

### 3. Build Frontend
```bash
cd /var/www/FRAMR/frontend
echo "VITE_API_BASE=" > .env.production
npm install
npm run build
```

### 4. Configure Nginx Reverse Proxy
Create `/etc/nginx/sites-available/framr`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/FRAMR/frontend/dist;
    index index.html;

    # SPA Client Routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 500M;
    }

    # Media Stems & Streams
    location /highlights/ {
        proxy_pass http://127.0.0.1:8000/highlights/;
        proxy_set_header Host $host;
    }

    location /music/ {
        proxy_pass http://127.0.0.1:8000/music/;
        proxy_set_header Host $host;
    }
}
```

Enable site and restart:
```bash
sudo ln -s /etc/nginx/sites-available/framr /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

---

## 🔒 ENVIRONMENT VARIABLES REFERENCE

| Variable | Target | Description | Default |
|---|---|---|---|
| `VITE_API_BASE` | Frontend | Base URL of FastAPI backend (e.g. `https://api.domain.com`) | `http://localhost:8000` |
| `PORT` | Backend | Port Uvicorn listens on | `8000` |
| `DATABASE_URL` | Backend | SQLite connection string | `sqlite:///./data/framr.db` |
