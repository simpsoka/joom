# Retro FPS

A browser-playable, retro first-person shooter inspired by early 90s FPS design.

## Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/retro-fps.git
    cd retro-fps
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Running the Development Server

To start the local development server, run:

```bash
npm run dev
```

The server will be accessible at `http://localhost:5173`.

## Building for Production

To create a production build, run:

```bash
npm run build
```

The bundled files will be located in the `dist` directory.

## Controls

-   **Mouse:**
    -   Move to look around (pointer-locked).
    -   Left-click to fire.
-   **Keyboard:**
    -   `WASD` to move.
    -   `Shift` to run.
    -   `Space` to open doors and activate switches.
    -   `R` to reload.
    -   `1` to select the pistol.

## Asset Licensing

All assets used in this project are either original or under permissive licenses. See the `assets` directory for more information.

## Authoring a New Level

Levels are defined in JSON format. To create a new level, you can either create a new JSON file from scratch or modify an existing one. The level data includes the geometry, entity placement, and trigger information.
