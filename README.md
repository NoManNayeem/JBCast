# 📧 JBCast Platform

**MailBridge by JB** — A full-stack email broadcasting platform with file-based email parsing, SMTP sending, and secure dashboards.

---

## 🧩 Project Structure

```
JBCast_Platform/
├── jbcast_backend/         # Django REST API + Celery + Redis + SQLite
├── jbcast-frontend/        # Next.js frontend with Tailwind CSS
```

---

## ⚙️ Backend Setup (Django + Celery)

1. **Create .env** in `jbcast_backend/`:
    ```env
    SECRET_KEY=your-django-secret-key
    DEBUG=True
    ALLOWED_HOSTS=127.0.0.1,localhost

    REDIS_HOST=localhost
    REDIS_PORT=6379
    REDIS_DB=0
    REDIS_PROTOCOL=redis
    ```

2. **Install dependencies**:
    ```bash
    cd jbcast_backend
    pip install -r requirements.txt
    ```

3. **Run server**:
    ```bash
    python manage.py migrate
    python manage.py runserver
    ```

4. **Run Celery worker**:
    ```bash
    celery -A jbcast_backend worker --loglevel=info
    ```

---

## 💻 Frontend Setup (Next.js)

1. **Create `.env.local`** in `jbcast-frontend/`:
    ```env
    NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
    ```

2. **Install and run**:
    ```bash
    cd jbcast-frontend
    npm install
    npm run dev
    ```

---

## ✅ Features

- Upload `.csv`, `.xls`, `.xlsx` files with contact data
- Automatically parse rows into `EmailRecord`s via Celery
- Auth-protected Dashboard with File Management
- Send bulk or individual emails via SMTP
- Quota tracking and rate limiting
- Celery-based email retry logic

---

## 📦 Dummy CSV Template

```
Name,Email
NoManNayeem,nayeem60151126@gmail.com
NayeemNoMan,nayeem60151126+1@gmail.com
```

---

## 🛠️ Technologies Used

- Backend: Django REST Framework, Celery, Redis, SQLite
- Frontend: Next.js 14, Tailwind CSS, Axios, React Icons
- Worker: Celery Tasks + SMTP EmailSender

---

## 🚀 Author

Built with 💙 by **JB / DataCrunch Limited**