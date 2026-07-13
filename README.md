# Snake++ 🐍

🎮 **[Play the game live](https://vermamayank0412-lgtm.github.io/snake-game/)**

A browser-based Snake game built with vanilla JavaScript and the HTML5 Canvas API — no frameworks, no libraries.

## Features

- **Classic snake gameplay** — arrow keys / WASD controls, plus touch D-pad for mobile
- **Obstacles** — randomly placed blocks that end the game on collision
- **Speed ramp-up** — the snake gets faster as your score increases
- **High score tracking** — best score persists across sessions using `localStorage`
- **Theme switcher** — cycle between multiple color themes (classic, neon, mono) at runtime via CSS variables
- **Bonus food** — golden food occasionally spawns worth 5 points instead of 1
- **Smart restart button** — only appears after game over, keeping the UI clean during play
- **Responsive canvas** — grid-based rendering that scales to the viewport

## Tech Used

- HTML5 Canvas API for rendering
- Vanilla JavaScript (no frameworks/libraries)
- CSS custom properties (variables) for theming
- `localStorage` for persistent high scores

## How to Run Locally

1. Clone this repo:
   ```
   git clone https://github.com/vermamayank0412-lgtm/snake-game.git
   ```
2. Open `index.html` directly in any browser, **or** use the [Live Server VS Code extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for auto-reload during development.

## Project Structure

```
snake-game/
├── index.html   # markup
├── style.css    # styling, theme variables
└── script.js    # game logic
```

## Controls

| Action | Key |
|---|---|
| Move | Arrow keys or WASD |
| Pause/Resume | Space or Enter |
| Change theme | "Change Theme" button |
| Restart | "Restart" button (appears after game over) |

---

Built as a self-study project while learning frontend fundamentals.
