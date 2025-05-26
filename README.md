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

3. Run migrations:
```bash
python manage.py migrate
```

4. Start the development server:
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