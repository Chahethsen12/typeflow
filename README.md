# Typeflow 👻

> **AI-powered typing improvement.** Train smarter, not just faster.

Typeflow is a premium, distraction-free web application built to help developers and students seamlessly improve their typing speed, accuracy, and muscle memory. Instead of feeding you static text or random word lists, Typeflow actively learns your typing habits and **generates adaptive drills specifically targeting your weakest keys.**

---

## ✨ Features

- **🧠 AI Adaptive Drill Generation:** The core engine monitors every keystroke. It calculates your absolute worst-performing keys across your entire history and dynamically synthesizes practice text heavily weighted toward those specific letters to force improvement.
- **📊 Global Analytics Dashboard:** A comprehensive, persistent profile that calculates your All-Time Best WPM, Average Accuracy, and tracks your specific "Global Weak Keys".
- **📱 Fully Responsive & Fluid:** The entire application uses native mathematical Flexbox ratios to intelligently squeeze and wrap on any device, from ultrawide 4K monitors to the narrowest mobile screens, without relying on brittle breakpoints.
- **✨ Premium Glassmorphism UI:** A sleek, distraction-free, dark-mode aesthetic featuring fluid hover interactions, subtle glows, and a beautifully minimalist layout.
- **🎬 Cinematic Animations:** Powered by Framer Motion, experience butter-smooth 60fps page transitions, magnetic interactive components, and spring-loaded modal popups.
- **⌨️ Interactive Virtual Keyboard:** A responsive visual keyboard overlay that provides real-time correct/error key tap visualization.

---

## 🛠️ Tech Stack

- **Framework:** [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Styling:** Custom native CSS variables and Flexbox architecture

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Chahethsen12/typeflow.git
   cd typeflow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:** Navigate to `http://localhost:5173` to see the app running.

---

## 🧬 Under the Hood: Adaptive Generation Algorithm

Unlike standard typing applications, Typeflow's drill generator does not rely on static sentences. 

1. **Continuous Telemetry:** The app maintains a `TestResult` interface in persistent `localStorage`. Every session logs your WPM, Accuracy, and a detailed map of exactly which target characters you missed.
2. **Aggregated Weakness Mapping:** Before a test begins, the app scans your entire history to establish an ordered hierarchy of your "Global Weak Keys".
3. **Probability-Weighted Synthesis:** Using a tailored internal word bank, the generator applies a 60/40 probability matrix. It intentionally forces words containing your worst performing letters ~60% of the time, interspersed with safe pacing words to maintain a natural typing rhythm.

---

## 🗺️ Roadmap (Upcoming Features)

- [ ] **Custom Practice Text Library** (Import your own code snippets or book chapters)
- [ ] **Multi-Theme Support** (Light mode and color variable injection)
- [ ] **Cloud Sync** (Optional cross-device metric synchronization via backend database)
- [ ] **Typing Heatmap** (Visual calendar representation of daily practice frequency)
- [ ] **Granular Settings** (Adjustable test durations, strict punctuation toggles, key-press sounds)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Chahethsen12/typeflow/issues).

---

*Designed and engineered for people who treat typing as a craft.*
