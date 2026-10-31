<div align="center">
  <h1>Two of Us</h1>
  <p><strong>A small, handmade corner of the internet for S. Prashank &amp; K. Lakshita.</strong></p>
  <p>Little games, good questions, and tiny things worth keeping.</p>
  <p>
    <img src="https://img.shields.io/badge/players-2-647b61?style=flat-square" alt="Made for two">
    <img src="https://img.shields.io/badge/build-plain%20HTML%2C%20CSS%20%26%20JS-be9a78?style=flat-square" alt="Built with HTML, CSS and JavaScript">
    <img src="https://img.shields.io/badge/license-MIT-778f6d?style=flat-square" alt="MIT license">
  </p>
</div>

## A little world of our own

Two of Us is a responsive, browser-first love website designed around small moments of connection. Its paper-and-ink look, hand-drawn garden illustration, and gentle interactions are made with original SVG, HTML, and CSS.

### Play together

- **Same Page:** Take turns choosing an answer on one phone, then compare and talk about it. The first answer stays hidden until both people have picked.
- **Question Garden:** Pick a mood and draw a conversation prompt. Take turns answering out loud; there is no score and no pressure to answer.
- **The Date Jar:** Choose a mood and get a simple date idea to make your own.

### Keep the little things

Save a note, an answer, or a date idea in Keepsakes. Notes are stored in this browser on this device with `localStorage`; this static site does not upload them.

## Run locally

There are no packages, build step, or backend. Open `index.html` in a modern browser, or serve the repository root:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Files

```text
.
├── app.js       # Game flows, prompts, date ideas, and local keepsakes
├── index.html   # Main site and original hand-drawn SVG illustration
├── style.css    # Responsive paper-and-ink design
├── README.md
└── LICENSE
```

## License

Released under the [MIT License](LICENSE).
