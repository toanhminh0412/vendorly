# Vendorly E-commerce Platform

This is a full-stack e-commerce platform built with Django and Next.js.

## Project Structure
- `backend/`: Django REST API
- `frontend/`: Next.js frontend application

## Backend Setup

1. Create and activate virtual environment:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
pip install --upgrade pip   # Upgrade pip
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the `backend/` directory:

```bash
# Django Core Settings - Basic Django configuration
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
TIME_ZONE=UTC

# Database Configuration - Leave POSTGRES_HOST empty for SQLite, set it for PostgreSQL
POSTGRES_HOST=
POSTGRES_DB=vendorly
POSTGRES_USER=postgres
POSTGRES_PASSWORD=
POSTGRES_PORT=5432

# CORS Settings - Frontend access configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000
CORS_ALLOW_CREDENTIALS=True

# JWT Configuration - Authentication token settings
ACCESS_TOKEN_LIFETIME_MINUTES=60
REFRESH_TOKEN_LIFETIME_DAYS=7
ROTATE_REFRESH_TOKENS=True
BLACKLIST_AFTER_ROTATION=True
UPDATE_LAST_LOGIN=False
JWT_ALGORITHM=HS256
JWT_SIGNING_KEY=
JWT_VERIFYING_KEY=
JWT_AUDIENCE=
JWT_ISSUER=
JWT_JWK_URL=
JWT_LEEWAY=0
JWT_AUTH_HEADER_TYPE=Bearer

# Email Configuration - Email backend settings
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
DEFAULT_FROM_EMAIL=noreply@vendorly.com

# Security Settings - Production security configuration
SECURE_SSL_REDIRECT=True

# Logging Configuration - Application logging levels
DJANGO_LOG_LEVEL=INFO
APP_LOG_LEVEL=INFO

# Note: Many variables above have sensible defaults and can be omitted if not applicable
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Start the development server:
```bash
python manage.py runserver
```

The backend will be available at http://localhost:8000

## Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:3000

## Development

- Backend API: http://localhost:8000
- Frontend: http://localhost:3000
- Django Admin: http://localhost:8000/admin 