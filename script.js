(function () {
  "use strict";

  const OPS = ["+", "−", "×", "÷"];

  // ---------- State ----------
  let tokens = [];      // finished parts of the expression: number, operator, number ...
  let cur = "";         // number being typed (may start with "-")
  let justEval = false; // true right after "="
  let lastExpr = "";    // expression shown above the result after "="
  let error = "";

  const mainEl = document.getElementById("main");
  const subEl = document.getElementById("sub");
  const keysEl = document.getElementById("keys");

  // ---------- Helpers ----------
  const trimNum = s => s.replace(/\.$/, "");

  // 1234.5 -> "1,234.5", leading "-" shown as "−"
  function fmtNum(s) {
    if (s === "" || s === "-") return s === "-" ? "−" : "";
    const neg = s.startsWith("-");
    const body = neg ? s.slice(1) : s;
    const [int, frac] = body.split(".");
    const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (neg ? "−" : "") + withCommas + (frac !== undefined ? "." + frac : "");
  }
  const fmtTok = t => (OPS.includes(t) ? t : fmtNum(t));

  // Rounds away floating point noise: 0.1 + 0.2 -> 0.3
  function fmtResult(n) {
    if (!isFinite(n)) throw new Error("big");
    return String(parseFloat(n.toPrecision(12)));
  }

  // list = ["12", "+", "3", "×", "4"]; × and ÷ run before + and −
  function evaluate(list) {
    const vals = [parseFloat(list[0])];
    const pending = [];
    for (let i = 1; i < list.length; i += 2) {
      const op = list[i];
      const v = parseFloat(list[i + 1]);
      if (op === "×") vals[vals.length - 1] *= v;
      else if (op === "÷") {
        if (v === 0) throw new Error("div0");
        vals[vals.length - 1] /= v;
      } else {
        pending.push(op);
        vals.push(v);
      }
    }
    let r = vals[0];
    pending.forEach((op, i) => { r = op === "+" ? r + vals[i + 1] : r - vals[i + 1]; });
    return r;
  }

  // The expression as typed so far, without a dangling operator
  function currentList() {
    const list = tokens.slice();
    if (cur !== "" && cur !== "-") list.push(trimNum(cur));
    else if (list.length && OPS.includes(list[list.length - 1])) list.pop();
    return list;
  }

  // ---------- Actions ----------
  function clearAll() {
    tokens = []; cur = ""; justEval = false; lastExpr = ""; error = "";
  }

  function startFresh() {
    tokens = []; cur = ""; justEval = false; lastExpr = "";
  }

  function digit(d) {
    if (justEval) startFresh();
    if (cur.replace("-", "").replace(".", "").length >= 15) return;
    if (cur === "0") cur = d;
    else if (cur === "-0") cur = "-" + d;
    else cur += d;
  }

  function dot() {
    if (justEval) startFresh();
    if (cur.includes(".")) return;
    cur = cur === "" || cur === "-" ? cur + "0." : cur + ".";
  }

  function operator(o) {
    if (justEval) { justEval = false; lastExpr = ""; } // keep going with the result
    if (cur === "") {
      if (tokens.length) tokens[tokens.length - 1] = o;   // change operator
      else if (o === "−") cur = "-";                       // negative first number
      return;
    }
    if (cur === "-") return;
    tokens.push(trimNum(cur), o);
    cur = "";
  }

  function percent() {
    if (cur === "" || cur === "-") return;
    if (justEval) { justEval = false; lastExpr = ""; }
    cur = fmtResult(parseFloat(cur) / 100);
  }

  function sign() {
    if (cur === "" || cur === "-") return;
    if (justEval) { justEval = false; lastExpr = ""; }
    cur = cur.startsWith("-") ? cur.slice(1) : "-" + cur;
  }

  function del() {
    if (justEval) { clearAll(); return; }
    if (cur !== "") {
      cur = cur.slice(0, -1);
      if (cur === "-") cur = "";
    } else if (tokens.length) {
      tokens.pop();            // operator
      cur = tokens.pop() || ""; // bring the number back for editing
    }
  }

  function equals() {
    const list = currentList();
    if (list.length < 3) return;
    try {
      const result = fmtResult(evaluate(list));
      lastExpr = list.map(fmtTok).join(" ");
      tokens = [];
      cur = result;
      justEval = true;
    } catch (e) {
      error = e.message === "div0" ? "Can't divide by zero" : "Number too large";
      tokens = []; cur = ""; justEval = false; lastExpr = "";
    }
  }

  // ---------- Display ----------
  function render() {
    let main = "0";
    let sub = "";

    if (error) {
      main = error;
    } else if (justEval) {
      main = fmtNum(cur);
      sub = lastExpr + " =";
    } else {
      const parts = tokens.map(fmtTok);
      if (cur !== "") parts.push(fmtNum(cur));
      main = parts.join(" ") || "0";
      const list = currentList();
      if (list.length >= 3) {
        try { sub = "= " + fmtNum(fmtResult(evaluate(list))); } catch (e) { sub = ""; }
      }
    }

    mainEl.textContent = main;
    subEl.textContent = sub;

    // Shrink long numbers so they stay readable
    const len = main.length;
    const size = error ? 1.5 : len <= 10 ? 3 : Math.max(1.5, 3 - (len - 10) * 0.09);
    mainEl.style.fontSize = size + "rem";
    mainEl.scrollLeft = mainEl.scrollWidth;
  }

  // ---------- Input handling ----------
  function press(k) {
    if (error && k !== "AC") clearAll();
    if (/^[0-9]$/.test(k)) digit(k);
    else {
      switch (k) {
        case ".": dot(); break;
        case "+": case "−": case "×": case "÷": operator(k); break;
        case "=": equals(); break;
        case "%": percent(); break;
        case "±": sign(); break;
        case "DEL": del(); break;
        case "AC": clearAll(); break;
      }
    }
    render();
  }

  // Mouse / touch
  keysEl.addEventListener("click", e => {
    const b = e.target.closest("button[data-key]");
    if (b) press(b.dataset.key);
  });

  // Keyboard
  const KEYMAP = {
    "+": "+", "-": "−", "*": "×", "x": "×", "X": "×", "/": "÷",
    "Enter": "=", "=": "=", "Backspace": "DEL", "Escape": "AC", "Delete": "AC",
    "%": "%", ".": ".", ",": "."
  };

  function flash(k) {
    const b = keysEl.querySelector('[data-key="' + k + '"]');
    if (!b) return;
    b.classList.add("pressed");
    setTimeout(() => b.classList.remove("pressed"), 120);
  }

  document.addEventListener("keydown", e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = /^[0-9]$/.test(e.key) ? e.key : KEYMAP[e.key];
    if (!k) return;
    e.preventDefault(); // stops "/" quick-find and Enter re-clicking a focused button
    press(k);
    flash(k);
  });

  render();
})();
