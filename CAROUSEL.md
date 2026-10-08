# How your React project gallery works

The Projects section is now a working carousel. The rest of the portfolio stays in index.html and continues using style.css and script.js.

## Files

- `index.html`: contains the `projects-root` mounting point.
- `src/projects-main.jsx`: connects React to that mounting point.
- `src/projects.json`: holds titles, descriptions, tags, and destination URLs.
- `src/Projects.jsx`: renders the gallery, handles input, and tracks selection.
- `src/projects-carousel.css`: creates the perspective, glowing panels, reflections, and responsive layout.

## State and refs

`activeIndex` is the selected project, starting at zero. React uses it to update the description, technologies, links, pagination, and screen-reader announcement.

`rotation` is an angle in degrees. Unlike the project index, it can be fractional while dragging or animating. Each project gets a position around the orbit using sine and cosine. CSS then translates each panel horizontally and into depth, and rotates it around its vertical axis.

`useState` values affect the rendered interface. `useRef` values remember the current angle, destination, pointer gesture, and animation frame without requiring a separate render whenever each value changes.

## Navigation

- Previous/next buttons rotate one project at a time and wrap around the ends.
- Pagination buttons select a project directly using the closest equivalent rotation.
- Clicking a visible panel selects it.
- When focus is inside the carousel, Left/Right navigate and Home/End select the first/last project.
- Rapid arrow clicks advance from the intended destination, even while an animation is still running.

## Automatic advance

After five seconds without scrolling or interacting, the gallery advances to the next project. Change `AUTO_ADVANCE_DELAY` in `src/Projects.jsx` to adjust the delay (milliseconds). This uses one resettable `setTimeout` inside a React effect, and reuses the existing `move(1)` navigation.

Auto-play pauses while the pointer hovers over the gallery, keyboard focus is inside it, a drag is active, the scene is mostly offscreen, or the browser tab is hidden. Scrolling restarts the countdown. Reduced-motion preferences disable automatic advance. The Pause/Resume auto-play button lets visitors stop it explicitly. Timers and event listeners are removed when the effect cleans up.

## Dragging and momentum

Pointer events provide a shared input path for mouse, touch, and pen. After eight pixels of horizontal movement, the scene captures the pointer so releasing outside a panel still finishes the gesture. Vertical touch movement is left to the page's normal scrolling.

Horizontal movement changes the angle. Release velocity predicts a stopping point, limited to prevent excessive spinning, and a damped spring animates toward the nearest whole-project angle. Dragging suppresses the subsequent panel click. Cancelled gestures settle without momentum.

The animation uses requestAnimationFrame and cleans up when React unmounts. Visitors who prefer reduced motion get immediate selection changes without the spring or release momentum.

## Artwork and reflections

The first three project images are imported through Vite. DocuMind has a generated CSS placeholder because its existing card had no image. The mirror effect duplicates the artwork, flips it vertically, blurs it slightly, and fades it with a mask. A CSS floor pattern suggests ripples.

This is a CSS 3D gallery inspired by the reference. The floor is decorative; it does not simulate physical water, dynamic light, or WebGL reflections.

## Links and editing content

Only the selected project's details contain outgoing links. Valid repository URLs produce a View GitHub button; valid demo URLs produce a Live demo button. Missing or `#` repository URLs display "Repository coming soon" instead of opening a placeholder destination.

Edit text and links in `src/projects.json`. To add another screenshot, import it in `src/Projects.jsx` and add it to the `images` array in the same order as the project data. The orbit spacing automatically uses the project count. Keep project IDs unique. The gallery expects at least one project.

## Adjust the appearance

At the top of `src/projects-carousel.css`:

- `--orbit-radius` controls the distance between panels.
- `--panel-width` and `--panel-height` control panel size.
- `perspective` on `.gallery-scene` controls the apparent depth.
- `.gallery-reflection` opacity controls reflection strength.

## Run and build

Run `npm run dev` for development. Run `npm run build` to produce `dist`, then `npm run preview` to inspect the production build. Opening index.html directly is no longer the way to run the React section; use Vite's local address.
