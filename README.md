# File Storage App (Node.js + Express + Client UI)

This project is a simple file storage and management system built with an Express backend and a lightweight client interface. It allows authenticated users to upload files, create directories, browse stored content, and manage storage efficiently.

---

## Features

- Google OAuth login
- Upload, view, and download files
- Create and manage directories
- Organized folder structure per user
- REST API using Express
- MongoDB database integration

---

## Tech Stack

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- Google Identity Services OAuth

### Frontend
- HTML, CSS, Vanilla JavaScript
- Fetch API for backend communication

---

## Project Structure

```
file-storage-app/
│
├── client/
│   ├── index.html
│   ├── styles/
│   ├── scripts/
│   └── assets/
│
└── server/
    ├── routes/
    ├── controllers/
    ├── middleware/
    ├── services/
    ├── uploads/
    ├── server.js
    └── package.json
```

---

## Getting Started

### 1. Clone the repository

```sh
git clone <your-github-repo-url>
cd file-storage-app
```

---

## Backend Setup

```sh
cd server
npm install
```

Create a `.env` file inside `server/`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
SESSION_SECRET=your_secret
```

Start the backend:

```sh
npm start
```

The server runs at:

```
http://localhost:5000
```

---

## Frontend Setup

No build needed.  
Open the `client/index.html` file directly or serve it with:

```sh
npx serve client
```

---

## Deploying the Project

### Frontend: Netlify (Free Hosting)

1. Push project to GitHub.
2. Go to https://netlify.com
3. New Site → Import from GitHub
4. Build Settings:
   - **Build command:** none
   - **Publish directory:** `client`
5. Click **Deploy**

Your frontend is now live.

---

### Backend: Render (Free Hosting)

1. Go to https://render.com
2. Create a new Web Service
3. Connect your GitHub repo
4. Set build command:

```
npm install
```

5. Set run command:

```
npm start
```

6. Add Environment Variables:
   - `MONGO_URI`
   - `GOOGLE_CLIENT_ID`
   - `SESSION_SECRET`

7. Deploy

Render will give you a backend URL like:

```
https://your-backend.onrender.com
```

---

## Updating Frontend for Production

Replace your API URLs in the client:

```js
const API_BASE = "https://your-backend.onrender.com";
```

---

## License
MIT License.
