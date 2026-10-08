(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Complejos = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const EPS = 1e-9;

  const C = (re, im = 0) => ({ re, im });
  const add = (a, b) => C(a.re + b.re, a.im + b.im);
  const sub = (a, b) => C(a.re - b.re, a.im - b.im);
  const mul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  const conj = (a) => C(a.re, -a.im);
  const abs = (a) => Math.hypot(a.re, a.im);
  const arg = (a) => Math.atan2(a.im, a.re);

  function div(a, b) {
    const d = b.re * b.re + b.im * b.im;
    if (d < EPS) return null;
    const n = mul(a, conj(b));
    return C(n.re / d, n.im / d);
  }

  function num(x) {
    const r = Math.round(x * 1e4) / 1e4;
    return String(Object.is(r, -0) ? 0 : r);
  }

  function fmt(z) {
    const re = Math.abs(z.re) < EPS ? 0 : z.re;
    const im = Math.abs(z.im) < EPS ? 0 : z.im;
    if (im === 0) return num(re).replace("-", "−");
    const mag = Math.abs(im) === 1 ? "" : num(Math.abs(im));
    const imPart = mag + "i";
    if (re === 0) return (im < 0 ? "−" : "") + imPart;
    return num(re).replace("-", "−") + (im < 0 ? " − " : " + ") + imPart;
  }

  // Módulo exacto como raíz cuando a y b son enteros.
  function fmtModulus(z) {
    const s = z.re * z.re + z.im * z.im;
    if (Number.isInteger(z.re) && Number.isInteger(z.im)) {
      const r = Math.sqrt(s);
      if (Number.isInteger(r)) return String(r);
      return "√" + s + " ≈ " + num(r);
    }
    return num(Math.sqrt(s));
  }

  function powI(n) {
    const table = [C(1), C(0, 1), C(-1), C(0, -1)];
    return table[((n % 4) + 4) % 4];
  }

  function quadraticRoots(a, b, c) {
    if (Math.abs(a) < EPS) return null;
    const d = b * b - 4 * a * c;
    const p = -b / (2 * a);
    if (d >= 0) {
      const q = Math.sqrt(d) / (2 * a);
      return { discriminant: d, roots: [C(p + q), C(p - q)] };
    }
    const q = Math.abs(Math.sqrt(-d) / (2 * a));
    return { discriminant: d, roots: [C(p, q), C(p, -q)] };
  }

  function linearFactor(r) {
    if (Math.abs(r.im) < EPS) {
      if (Math.abs(r.re) < EPS) return "x";
      return "(x " + (r.re < 0 ? "+ " : "− ") + num(Math.abs(r.re)) + ")";
    }
    if (Math.abs(r.re) < EPS) return "(x " + (r.im < 0 ? "+ " : "− ") + fmt(C(0, Math.abs(r.im))) + ")";
    return "(x − (" + fmt(r) + "))";
  }

  function factorQuadratic(a, b, c) {
    const res = quadraticRoots(a, b, c);
    if (!res) return null;
    const lead = Math.abs(a - 1) < EPS ? "" : Math.abs(a + 1) < EPS ? "−" : num(a);
    const repeated = Math.abs(res.discriminant) < EPS;
    const f1 = linearFactor(res.roots[0]);
    // Con raíces complejas, el factor con "−i" va primero para que se lea (x − bi)(x + bi).
    const roots = res.roots.slice().sort((r, s) => s.im - r.im);
    const ordered = roots[0].im > 0 || repeated ? [roots[0], roots[1]] : roots;
    const text = repeated
      ? lead + f1 + "²"
      : lead + linearFactor(ordered[0]) + linearFactor(ordered[1]);
    return { discriminant: res.discriminant, roots: res.roots, text };
  }

  function shuffle(array, rnd = Math.random) {
    const a = array.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  return { C, add, sub, mul, div, conj, abs, arg, fmt, fmtModulus, num, powI, quadraticRoots, factorQuadratic, shuffle };
});
