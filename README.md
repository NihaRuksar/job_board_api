<div align="center">

```_       _       ____                         _      ____ ___ 
    | | ___ | |__   | __ )  ___   __ _ _ __ __| |    / ___|_ _|
 _  | |/ _ \| '_ \  |  _ \ / _ \ / _` | '__/ _` |   | |    | | 
| |_| | (_) | |_) | | |_) | (_) | (_| | | | (_| |   | |___ | | 
 \___/ \___/|_.__/  |____/ \___/ \__,_|_|  \__,_|    \____|___|
                                                              ⚡ API
                                                             
```

**A production-grade backend system powering job listings, applications & hiring workflows.**

<br/>

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-ORM-CC2927?style=for-the-badge&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![REST API](https://img.shields.io/badge/REST-API-FF6B35?style=for-the-badge&logo=api&logoColor=white)]()

</div>

---

## ◈ What Is This?

> A clean, scalable **RESTful backend API** built to manage the full lifecycle of job listings, applications, and user workflows — for both **employers** and **job seekers**.

No bloat. No monolith chaos. Just structured, validated, well-documented endpoints backed by a normalized relational database.

---

## ◈ System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│           (Web App / Mobile / Postman / curl)               │
└─────────────────────────┬───────────────────────────────────┘
                          │  HTTP Requests
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      FASTAPI LAYER                          │
│     ┌──────────┐  ┌──────────┐  ┌──────────────────┐       │
│     │  /jobs   │  │  /apply  │  │  /auth & /users  │       │
│     └──────────┘  └──────────┘  └──────────────────┘       │
│          Route Handlers + Pydantic Validation               │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   SQLALCHEMY ORM LAYER                      │
│         Models · Sessions · Queries · Transactions          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      MYSQL DATABASE                         │
│     users · jobs · applications · employers · skills        │
└─────────────────────────────────────────────────────────────┘
```

---

## ◈ Key Features

| Feature | Description |
|---|---|
| 🧑‍💼 **Dual Role Workflows** | Separate flows for Employers and Job Seekers |
| 📋 **Job Posting & Management** | Create, update, close, and search job listings |
| 🔍 **Smart Filtering** | Filter by location, salary, skills, category, and more |
| 📬 **Application Pipeline** | Submit, track, and manage job applications |
| ✅ **Request Validation** | Pydantic schemas enforce clean input/output contracts |
| 📄 **Auto API Docs** | Swagger UI & ReDoc via FastAPI's OpenAPI generation |
| 🏗️ **Scalable Schema** | Normalized MySQL tables for clean relational data |

---

## ◈ API Endpoints

```
AUTH
  POST    /auth/register          → Register employer or job seeker
  POST    /auth/login             → Authenticate and get access token

JOBS
  GET     /jobs                   → List all open jobs (with filters)
  POST    /jobs                   → Create a new job listing [Employer]
  GET     /jobs/{id}              → Get job details
  PUT     /jobs/{id}              → Update job listing [Employer]
  DELETE  /jobs/{id}              → Close / remove a listing [Employer]

APPLICATIONS
  POST    /jobs/{id}/apply        → Apply for a job [Job Seeker]
  GET     /applications           → View your applications [Job Seeker]
  GET     /jobs/{id}/applications → View applicants for a job [Employer]
  PATCH   /applications/{id}      → Update application status [Employer]

USERS
  GET     /users/me               → Get current user profile
  PUT     /users/me               → Update profile
```

---

## ◈ Tech Stack

```python
stack = {
    "framework"  : "FastAPI",          # High-performance async web framework
    "database"   : "MySQL 8.0",        # Reliable relational data storage
    "orm"        : "SQLAlchemy",       # Expressive queries + safe DB mapping
    "validation" : "Pydantic v2",      # Strict input/output schema enforcement
    "auth"       : "JWT (OAuth2)",     # Token-based role authentication
    "docs"       : "OpenAPI / Swagger" # Auto-generated interactive API docs
}
```

---

## ◈ Key Engineering Challenges

### 1 · Normalized Relational Schema Design
Designed a fully normalized database schema separating concerns across `users`, `employers`, `job_seekers`, `jobs`, `applications`, and `skills` tables — with foreign key constraints and junction tables to avoid data redundancy at scale.

### 2 · Role-Based Query Filtering
Implemented efficient, parameterized search queries with SQLAlchemy supporting dynamic multi-field filtering (location, salary range, job type, skills) without risking N+1 query problems or injection vulnerabilities.

---

## ◈ Technical Decisions

**▹ SQLAlchemy ORM**
Chose SQLAlchemy over raw SQL for expressive, Pythonic query composition and safe column mapping. Allows complex joins and eager loading without sacrificing readability.

**▹ MySQL**
Selected MySQL for its proven reliability with relational workloads, ACID compliance, and excellent support for the structured job/application domain model.

**▹ FastAPI**
FastAPI's async-first design and automatic OpenAPI schema generation made it the clear choice — reducing boilerplate while producing interactive documentation out of the box.

---

## ◈ Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/job-board-api.git
cd job-board-api

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your MySQL credentials and secret key

# 5. Run database migrations
alembic upgrade head

# 6. Start the server
uvicorn main:app --reload
```

> API runs at `http://localhost:8000`
> Interactive docs at `http://localhost:8000/docs`

---

## ◈ Environment Variables

```env
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/jobboard
SECRET_KEY=your_jwt_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## ◈ Project Structure

```
job-board-api/
│
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── jobs.py
│   │   │   ├── applications.py
│   │   │   └── users.py
│   │   └── dependencies.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   │
│   ├── db/
│   │   ├── base.py
│   │   └── session.py
│   │
│   ├── models/          ← SQLAlchemy ORM models
│   ├── schemas/         ← Pydantic request/response schemas
│   └── crud/            ← Database operation logic
│
├── alembic/             ← Migration scripts
├── tests/
├── .env.example
├── requirements.txt
└── main.py
```

---

<div align="center">

Built with precision · Designed to scale · Powered by Python

</div>
