# Devices for "Try it" (D-91)

Each file pair here is one device: `<name>.js` registers `window.LABS_DEVICES[name] = function (mount, cfg) { … return { start, stop, sketch } }` and `<name>.css` holds its styles, every selector under `.dv-<name>`. `build.mjs` adds every device to every page; a page uses the one named in its `try.device`, and falls back to the built-in device in `app.js` while the file does not exist.

- `cfg`: `demo` (the page's default example key), `RM` (reduced motion), `hasIO`, `icon(id)` (the page's SVG sprite), `esc(text)`, `tag(text)` (sets the caption under the device).
- `start()` / `stop()`: play or pause the default demo (called when the device scrolls in or out of view).
- `sketch(text, done)`: show the visitor's own idea or task; call `done()` when it is drawn.
