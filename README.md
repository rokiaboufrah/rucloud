# ru.Cloud

Luxury sustainable womenswear store — Django REST API + React/Vite frontend.

```
ru.cloud/
├── backend/     Django 6 + DRF API (products, cart, orders, accounts, contact, newsletter)
├── frontend/    React 19 + TypeScript + Vite (customer storefront)
├── render.yaml  Render Blueprint for the API
├── Procfile     Render release hook (migrate + collectstatic)
└── build.sh     Render build hook (pip install + collectstatic)
```

Live sites:
- Frontend: https://rucloud.vercel.app
- API: https://rucloud-api.onrender.com  (must show `{"status":"ok"}` at `/api/health/`)

---

## 1. Local development

```powershell
# API
cd backend
..\venv\Scripts\python.exe -m pip install -r requirements.txt
..\venv\Scripts\python.exe manage.py migrate
..\venv\Scripts\python.exe manage.py load_catalog   # imports the clean product catalog
..\venv\Scripts\python.exe manage.py runserver 8000

# Frontend (second terminal)
cd frontend
npm install
npm run dev          # http://localhost:5173, proxies /api, /admin, /media to :8000
```

Run checks:

```powershell
..\venv\Scripts\python.exe manage.py check
..\venv\Scripts\python.exe manage.py test backend
cd ..\frontend && npm run build && npm run lint
```

> The local SQLite DB and `backend/data.json` are development artifacts and are
> git-ignored. Never commit `data.json` — it contains hashed passwords, sessions
> and customer/admin data.

---

## 2. Environment variables

### Backend (set in Render dashboard, or in your shell locally)

| Variable | Required | Notes |
|---|---|---|
| `DJANGO_SECRET_KEY` | **yes in production** | Generate with `python -c "import secrets; print(secrets.token_urlsafe(50))"`. App refuses to start without it when `DJANGO_DEBUG=False`. |
| `DJANGO_DEBUG` | no | `False` in production. |
| `DJANGO_ALLOWED_HOSTS` | no | `.onrender.com,.vercel.app,localhost` by default. Add your custom domain here. |
| `DATABASE_URL` | yes on Render | Auto-created by the `rucloud-db` Postgres service in `render.yaml`. |
| `CORS_ALLOWED_ORIGINS` | yes | `https://rucloud.vercel.app` (add custom domain too). |
| `CSRF_TRUSTED_ORIGINS` | yes | `https://rucloud.vercel.app` (add custom domain too). |
| `EXTRA_ALLOWED_ORIGINS` | no | Comma-separated extra CORS/CSRF origins. |
| `FRONTEND_URL` | no | `https://rucloud.vercel.app` — used to build password-reset links. |
| `BARIDIMOB_PHONE`, `BARIDIMOB_NAME` | yes | BaridiMob details shown at checkout. |
| `CCP_ACCOUNT_HOLDER`, `CCP_ACCOUNT_NUMBER`, `CCP_CLE`, `CCP_BANK`, `CCP_ADDRESS` | yes | CCP details shown at checkout. |
| `EMAIL_BACKEND` | no | Defaults to console backend. For real mail use `django.core.mail.backends.smtp.EmailBackend`. |
| `DEFAULT_FROM_EMAIL`, `ADMIN_EMAIL` | no | Admin alerts are skipped when `ADMIN_EMAIL` is empty; order/password emails still work. |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS` | no | Only needed for SMTP. |

### Frontend (set in Vercel dashboard → Project → Settings → Environment Variables)

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://rucloud-api.onrender.com/api` |

**This variable is critical.** If it is missing, the built app falls back to the
relative path `/api`, Vercel serves `index.html` instead of JSON, and every
product/cart/checkout request silently fails. After setting it, redeploy.

---

## 3. Deploy the API on Render

1. Render Dashboard → **New → Blueprint** → connect `https://github.com/rokiaboufrah/rucloud.git` on branch `main`.
2. Render reads `render.yaml` and creates the `rucloud-api` web service plus the `rucloud-db` free Postgres database.
3. Fill in the environment variables from the table above in the service settings.
4. The build runs `backend/build.sh`: `pip install`, `collectstatic`, `migrate --noinput`
   and the idempotent `load_catalog` fixture import. Migrations deliberately live in the
   **build script**, not in `preDeployCommand`, because Render only allows
   `preDeployCommand` on paid instance types. The root `Procfile` is kept for
   Heroku-style hosts.
5. To create a staff account, open the Render **Shell** for the service and run:

   ```bash
   python manage.py seed          # uses DJANGO_ADMIN_* env vars; generates a password if none is set
   ```

6. Verify:

   ```bash
   curl https://rucloud-api.onrender.com/api/health/
   curl https://rucloud-api.onrender.com/api/products/
   ```

   Both must return JSON. If you get `404` with header `x-render-routing: no-server`,
   the Render web service does not exist — create the Blueprint service first.

---

## 4. Deploy the frontend on Vercel

1. Vercel → **Add New → Project** → import the same GitHub repo.
2. Set **Root Directory** to `frontend` (Vercel must find `frontend/package.json`).
3. Framework preset: **Vite**. `frontend/vercel.json` already sets the build command
   (`npm run build`), output directory (`dist`) and the SPA rewrite.
4. Add `VITE_API_URL` (see above) for **Production, Preview and Development**.
5. Deploy. Verify:

   ```bash
   curl -s https://rucloud.vercel.app/api/products/ | head -c 200
   ```

   This should still return the SPA HTML on Vercel (expected). The real check is in
   the browser: open the site and confirm products load from the API. In DevTools →
   Network, requests must go to `rucloud-api.onrender.com`, **not** `rucloud.vercel.app/api`.

---

## 5. Custom domain (when ready)

Add the domain to Render (Settings → Custom Domains) and Vercel, then append it to
`DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS` and set
`FRONTEND_URL` to `https://your-domain.com`.

---

## 6. Order flow / payments

Orders are created as `pending`. For BaridiMob, CCP and bank transfer the customer
uploads a payment screenshot in **My Account**; staff reviews it in Django admin
(`Orders → Orders → mark as paid`) and then moves the order through
confirmed → shipped → delivered. COD orders are confirmed manually the same way.

No payment provider is integrated — do not enter real card details anywhere on
this site.
