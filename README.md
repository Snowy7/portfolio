# islam's portfolio

Personal portfolio site with a hacker/terminal aesthetic — green-on-black, matrix rain, monospace everything.

## Tech Stack

- **Astro** — Static site generation
- **Vue 3** — Interactive components
- **Tailwind CSS v4** — Styling

## Features

- Matrix rain canvas background
- Floating terminal window (draggable, minimize/maximize/close)
  - Commands: `help`, `about`, `skills`, `projects`, `blog`, `contact`, `neofetch`, `snake`, `clear`
  - Built-in Snake game
- Secret Door easter egg (5 clicks on the logo)
- Typing hero animation
- Responsive design with mobile hamburger menu

## Project Structure

```
src/
  components/
    AppShell.vue          # Root shell: matrix rain + nav + terminal + secret door
    MatrixRain.vue        # Canvas-based matrix rain background
    NavBar.vue            # Responsive nav with hamburger menu
    TerminalWindow.vue    # Floating terminal with snake game
    SecretDoor.vue        # Hidden page easter egg
    TypingHero.vue        # Typewriter text animation
    TimeZone.vue          # Live clock
  data/
    portfolio.ts          # All site content (projects, skills, experience, blog, etc.)
  layouts/
    Base.astro            # Shared HTML layout
  pages/
    index.astro           # Home page
    projects/index.astro  # Projects page
  styles/
    global.css            # Tailwind v4 config + custom theme tokens
```

## Commands

| Command           | Action                                   |
| :---------------- | :--------------------------------------- |
| `npm install`     | Install dependencies                     |
| `npm run dev`     | Start dev server at `localhost:4321`     |
| `npm run build`   | Build production site to `./dist/`       |
| `npm run preview` | Preview production build locally         |
