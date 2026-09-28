# School CBT Examination System

This project is a simple full-stack web application for a school examination system with three dashboard roles:

- Admin dashboard: reviews and approves teacher-submitted questions
- Teacher dashboard: creates exam questions for approval
- Student dashboard: logs in, attempts a timed CBT exam, and sees profile details

## Features

- Role-based login for admin, teacher, and student
- Teacher question entry linked to admin approval
- Student exam timer countdown
- Student session details and result tracking
- Persistent local database stored in `data/db.json`

## Default users

- Admin: username `admin`, password `admin123`
- Teacher: username `teacher1`, password `teacher123`
- Student: username `student1`, password `student123`

## Run locally

```bash
cd C:\Users\DELL\school-cbt-app
npm install
npm start
```

Open this URL in your browser:

http://localhost:3000

## Run as a desktop app

```bash
cd C:\Users\DELL\school-cbt-app
npm install
npm run desktop
```

This launches the app in an Electron desktop window instead of opening it in a browser.

## Build a Windows desktop installer

```bash
cd C:\Users\DELL\school-cbt-app
npm install
npm run dist
```

This creates a Windows portable build in the `dist` folder for installation on a computer.

## Project structure

- `server.js` — Express server and API
- `public/index.html` — main front-end layout
- `public/styles.css` — styling for the dashboard and exam pages
- `public/app.js` — client-side logic for login, dashboards, and exam flow
- `data/db.json` — persisted exam data and users
