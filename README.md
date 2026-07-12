# 🔐 Password Strength Checker (MERN)

> An intelligent password strength analyzer and AI-style "Password Coach" built with the MERN stack — checks strength in real time, explains *why*, and generates a stronger version instantly.

---

## 🔗 Quick Links

| Link | Action |
|---|---|
| 🚀 Live Demo | [Open App](https://password-coach-ai.lovable.app/) |
---

## 🔎 Overview

Password Strength Checker lets users type or paste a password and instantly see its strength (Weak, Medium, Strong, Very Strong), a 0–10 score, entropy, and an estimated crack time under different attacker profiles. Instead of just showing a verdict, the built-in **Password Coach** explains *why* the password scored the way it did and generates a stronger variant of the same password on the spot.

This project was built to explore how real password-security tooling works under the hood — length and character-class rules, entropy estimation, pattern detection (repeated/sequential characters, dictionary words, breached passwords), and turning that raw analysis into human-readable guidance, all wired together as a full-stack MERN app.

---

## ✨ Features

- Live password analysis with score, strength label, and animated meter.
- Requirement checklist (length, uppercase, lowercase, digit, symbol, no repeats, no sequences, not common, not a dictionary word).
- Password Coach with plain-English reasons and actionable suggestions.
- Auto-generated stronger password derived from the user's original input.
- One-click random strong password generator.
- Entropy estimation and crack-time estimate across multiple attacker profiles.
- Show/hide password toggle and one-click copy.
- Anonymized analysis history (score, strength, entropy — never the raw password) when MongoDB is connected, with graceful fallback when it isn't.
- Confetti celebration when a password reaches "Very Strong".

---

## 🛠️ Tech Stack

- Frontend: React.js, Vite
- Backend: Node.js, Express.js
- Database: MongoDB (optional — used only for anonymized analysis history)
- ORM: Mongoose
- Styling: Custom dark glassmorphism CSS theme

---

## 🧭 How It Works

1. A user types or pastes a password into the input field.
2. The React frontend sends it to the Express `/api/analyze` endpoint.
3. The backend runs every rule (length, character classes, repeated/sequential patterns, dictionary words, breached-password list) in a single linear pass per rule.
4. The rule results are converted into a weighted 0–10 score, a strength label, entropy, and a crack-time estimate.
5. The Password Coach turns the rule results into reasons and suggestions, and generates a stronger version of the password.
6. If MongoDB is connected, an anonymized fingerprint of the result (never the raw password) is saved for the history panel.

---

## 📁 Project Structure

- `backend/` - Express API, password analysis engine, Mongoose models, and routes.
- `frontend/` - React client, components, styles, and API client.
- `backend/services/` - Password checker, scoring, Password Coach, and generator logic.
- `backend/controllers/` - Request handling for analyze, generate, and history endpoints.
- `backend/models/` - Mongoose schema for anonymized password analysis history.
- `backend/routes/` - API route definitions.
- `frontend/src/components/` - Header, password input, strength gauge, checklist, coach, history panel, and more.
- `frontend/src/api/` - Fetch wrapper for talking to the Express backend.

---

## ⚙️ Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## 🌍 Environment Variables

Create your own `.env` file in the backend before running the app. The exact variables depend on your deployment setup, but typically include:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLIENT_ORIGIN=http://localhost:5173
```

The app runs fully without `MONGODB_URI` set — password analysis still works, only the history panel is disabled. In the frontend, set the matching API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 💡 Why This Project Matters

Password Strength Checker demonstrates how modern password-security tooling works under the hood — rule-based analysis, entropy and crack-time modeling, and turning raw checks into human-readable coaching — combined with a full-stack MERN architecture and a database-optional design that stays useful even without persistence.

---

## 👤 Author

Built with ❤️ by Krish Bhandari

