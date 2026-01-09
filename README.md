# 🏒 Air Hockey Game (React Native)

A two-player Air Hockey game built using **React Native**.  
The game supports real-time paddle movement, puck physics, scoring logic, and multiple game modes.

---

## 📱 Emulator / Device Used

> ⚠️ **Note:**  
> This application was tested and run on the **Android Studio “Medium Phone” emulator**.  
> The UI and gameplay scale correctly across different screen sizes, including Pixel devices.

---

## 🎮 Game Features

### Core Gameplay
- Two-player local multiplayer (Top & Bottom paddles)
- Smooth paddle drag controls
- Realistic puck movement and wall collisions
- Paddle–puck collision detection
- Center line and center circle (air hockey table design)

### Scoring & Win Conditions
- Live scoreboard displayed at the top
- **First to 10 goals wins**
- Game stops automatically when a player wins
- Restart option available

### Game Modes
- ⏱ **Timed Game (1 minute / 2 minutes)**
- 🥅 **First to 10 Goals**
- 🏆 **Best of 3 (1-minute rounds)**

### Bonus Features
- Grid-style scoreboard
- Winner overlay with visual effects
- Clean UI with modern color palette
- Game reset & replay functionality

---

## 🛠 Tech Stack

- React Native
- TypeScript
- Animated API
- PanResponder
- Android Studio Emulator

---

## ▶️ How to Run the App

### Prerequisites
- Node.js installed
- Android Studio installed
- Android emulator (Medium Phone or Pixel)

### Steps

```bash
git clone https://github.com/navyaabatra16/AirHockeyGame.git
cd AirHockeyGame
npm install
npx react-native run-android
