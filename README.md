# Calculator

A basic calculator built with plain HTML, CSS and JavaScript. No frameworks, no build step.

## Features

- All four arithmetic operations: `+`, `−`, `×`, `÷`
- Correct order of operations (`1 + 2 × 3` gives `7`)
- Buttons and a display screen
- Real-time result: the answer shows under the expression while you type
- Clear (`AC`), delete last digit (`⌫`), percent (`%`) and sign change (`±`)
- Decimal numbers, with floating point noise removed (`0.1 + 0.2` gives `0.3`)
- Large numbers get thousands separators and the display text shrinks to fit
- "Can't divide by zero" message instead of a crash
- Keyboard support (see below)
- Dark and light theme that follows the device setting
- Responsive, works on phone and desktop

## Project structure

```
calculator-project/
├── index.html   # calculator layout: display and keys
├── style.css    # theme, key styles, responsive rules
├── script.js    # calculator logic and keyboard handling
└── README.md
```

## How to run

1. Keep all files in one folder.
2. Open `index.html` in any modern browser.

An internet connection is only needed for the Google Fonts. Without it the calculator still works with system fonts.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `0`–`9` | Enter digit |
| `.` or `,` | Decimal point |
| `+` `-` `*` `/` | Add, subtract, multiply, divide (`x` also multiplies) |
| `Enter` or `=` | Calculate |
| `Backspace` | Delete last digit |
| `Esc` or `Delete` | Clear all |
| `%` | Percent |

## How it works

- The expression is kept as a list of numbers and operators, never run through `eval`.
- `×` and `÷` are evaluated before `+` and `−`.
- Results are rounded to 12 significant digits to hide floating point errors.
- Pressing an operator right after `=` continues with the previous result.

## Tech

- HTML5, CSS3 (grid, custom properties), vanilla JavaScript
- Fonts: Inter and Space Grotesk from Google Fonts
