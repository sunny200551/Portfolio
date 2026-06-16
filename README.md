# 🌌 Sunny Pasumarthi - Portfolio

An interactive, responsive, and modern developer portfolio built using **React**, **TypeScript**, **Tailwind CSS**, and **Vite**, integrated with **Firebase Firestore** for contact form submissions.

## ✨ Core Features

*   **Custom Dark/Light Theme & Glassmorphism**: Premium styling featuring vibrant glow effects, bento grid layouts, and smooth animations using Framer Motion.
*   **Interactive Tech Orbit**: A dynamic orbit display showcasing core engineering layers (HTML/CSS, Node.js, Blockchain, Firebase, and Git tools).
*   **Skill Proficiencies Radar Chart**: A custom interactive radar plot mapping technical competence.
*   **Real-time GitHub Statistics**: Live tracking of repository information and GitHub contributions.
*   **Learning Journey Timeline**: A chronological timeline highlighting academic milestones and project releases.
*   **Interactive Contact Form**: A client form styled with micro-animations that writes directly to a Firebase Firestore database (with a seamless local storage fallback).
*   **Instant Resume Access**: Fast download/view access for the official `Resume.pdf`.
*   **Command Palette (Ctrl + K)**: Universal navigation search modal enabling users to jump to sections or download the resume quickly.

## 🛠️ Technology Stack

*   **Framework**: [React](https://react.dev/) with [Vite](https://vite.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/) & [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
*   **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)

## 📦 Getting Started

### Prerequisites

*   Node.js (v18+)
*   npm (v9+)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sunny200551/Portfolio.git
   cd Portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
   *Note: If no `.env` credentials are provided, the site will automatically fall back to storing contact messages inside the browser's `localStorage`.*

### Running Locally

To start the development server:
```bash
npm run dev
```

### Production Build

To build the static files:
```bash
npm run build
```
The output will be generated in the `dist/` directory.
