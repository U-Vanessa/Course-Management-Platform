#  Course Management Platform

A backend system designed for academic institutions to support faculty operations, monitor student progress, and enhance academic coordination. Built with Node.js, Express, MySQL, Sequelize ORM, and Redis, the application is structured into three primary modules:

1. **Course Allocation System**
2. **Facilitator Activity Tracker (FAT)**
3. **Student Reflection Page with i18n**

---

##  Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Modules](#modules)
  - [1. Course Allocation System](#1-course-allocation-system)
  - [2. Facilitator Activity Tracker (FAT)](#2-facilitator-activity-tracker-fat)
  - [3. Student Reflection Page (i18n)](#3-student-reflection-page-i18n)
- [Authentication & Authorization](#authentication--authorization)
- [API Documentation](#api-documentation)
- [Installation](#installation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [License](#license)

---

## 📖Project Overview

This platform manages user roles (Admin, Manager, Facilitator, Student), courses, allocations, and internationalized student reflection entries. It enforces secure access, uses background processing for notifications (via Redis), and supports scalable internationalization features.

---

##  Features

- JWT-based authentication & role authorization
- RESTful API with Sequelize ORM
- Internationalization (i18n) support
- Asynchronous background jobs via Redis
- Course allocation logic & facilitator activity tracking
- Student reflection page localized per user language
- Full relational DB schema with seed data
- Swagger API documentation
- Unit tests with Jest or Mocha
- Clean, modular code with Sequelize associations

---

##  Tech Stack

| Technology | Description |
|-----------|-------------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web framework |
| **MySQL** | Relational DB |
| **Sequelize** | ORM for MySQL |
| **JWT** | Authentication |
| **Redis** | Background task queue |
| **Jest** / **Mocha** | Testing frameworks |
| **i18next** | i18n and l10n library |
| **Swagger** | API documentation |

---

##  System Architecture

---

## 📚 Modules

### 1. Course Allocation System

- Assign courses to facilitators
- Manage modules, cohorts, classes
- Create and manage course offerings
- Link facilitators and students to class structures

### 2. Facilitator Activity Tracker (FAT)

- Track facilitator attendance and course engagement
- Monitor weekly reports on student performance
- Allow managers to view and export data

### 3. Student Reflection Page (i18n)

- Each student submits weekly reflections
- Reflections are tagged by mood, performance, and participation
- Data is available in the student’s preferred language (i18n support)

---

## 🔐 Authentication & Authorization

- **Login/Register** via JWT
- Roles:
  - **Admin**: Full system access
  - **Manager**: Oversee facilitators and student progress
  - **Facilitator**: View assigned modules and submit reports
  - **Student**: Reflect on progress
- Passwords stored using **bcrypt hashing**

---

## 📘 API Documentation

- Swagger docs available at `/api-docs`
- Each endpoint includes:
  - Route
  - Method
  - Description
  - Request format
  - Response format
  - Authorization role

---

## Installation

```bash
# Clone repo
git clone https://github.com/your-username/course-management-backend.git
```

### Navigate to project
```bash
cd course-management-backend
```

### Install dependencies
```bash
npm install
```

### Set up .env file
``` bash
cp .env.example .env
```

###Run database migrations and seeders
```bash
npx sequelize db:migrate
npx sequelize db:seed:all
```

### Start the server
```bash
npm start
```

### Run all unit tests
``` bash
npm test
```

## Project Structure

├── src/
│   ├── config/              # Sequelize & Redis config
│   ├── controllers/         # Request handlers
│   ├── models/              # Sequelize models
│   ├── routes/              # API routes
│   ├── middlewares/         # Auth, validators
│   ├── services/            # Business logic
│   ├── jobs/                # Redis tasks
│   └── locales/             # i18n translations
│
├── tests/                   # Unit tests
├── swagger/                 # Swagger API docs
├── .env                     # Environment variables
├── app.js                   # Express app entry point
└── README.md


## Demo
https://www.loom.com/share/8f0431b49b3c420b905ce531a5052b2c?sid=60158849-2480-4b66-be40-55c9443005e2
