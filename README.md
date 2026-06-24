# Ziimo

A gamified chore app for kids aged 4–10. Children complete daily missions to earn points, while parents manage tasks and track progress through a PIN-protected panel.

> **Note:** The UI is intentionally in Norwegian to match the target audience.

![Ziimo screenshot placeholder](public/ziimo.png)

---

## Tech Stack

- **React 19** + **Vite** – component-based UI with fast dev server
- **React Router v7** – client-side routing between Home, Missions, and Parent Panel
- **Context API** – global state for missions, progress, and parent settings
- **localStorage** – client-side persistence, no backend required

---

## Features

- 🎯 **Daily missions** – curated tasks with descriptions, point values, and categories
- 📊 **Progress tracking** – daily pip counters, weekly bar chart, and streak counter
- 🔒 **Mission unlocking** – missions unlock in batches of 3 as previous ones are completed
- 👨‍👩‍👧 **Parent panel** – PIN-protected dashboard to add missions, set rewards, and view stats
- 🏠 **Home screen** – personalised greeting, daily goal card, and weekly overview
- 💾 **Persistent state** – all progress and settings survive page refreshes

---

## Getting Started

```bash
git clone https://github.com/yourusername/ziimo-react.git
cd ziimo-react
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

**Default parent PIN:** `1234` (changeable from the parent panel)

---

## Roadmap

- [ ] **Backend** – Node.js / Supabase for multi-device sync and persistent accounts
- [ ] **Authentication** – child profiles with secure parent login
- [ ] **React Native** – cross-platform mobile app (iOS + Android)
- [ ] **Dark mode** – full theme support
- [ ] **Sound effects** – audio feedback on mission completion

---

## License

MIT
