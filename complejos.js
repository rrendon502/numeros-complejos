(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Complejos = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const SUPS = "⁰¹²³⁴⁵⁶⁷⁸⁹";

  const C = (re, im = 0) => ({ re, im });
  const add = (a, b) => C(a.re + b.re, a.im + b.im);
  const sub = (a, b) => C(a.re - b.re, a.im - b.im);
  const mul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  const neg = (a) => C(-a.re, -a.im);
  const conj = (a) => C(a.re, -a.im);
  const abs = (a) => Math.hypot(a.re, a.im);
  const arg = (a) => Math.atan2(a.im, a.re);

  function div(a, b) {
    const d = b.re * b.re + b.im * b.im;
    if (d < 1e-24) return null;
    const n = mul(a, conj(b));
    return C(n.re / d, n.im / d);
  }

  const gcd = (a, b) => {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { const t = a % b; a = b; b = t; }
    return a;
  };
  const lcm = (a, b) => (a / gcd(a, b)) * b;

  function ratio(x, maxQ = 1000, tol = 1e-9) {
    if (!Number.isFinite(x)) return null;
    const a = Math.abs(x);
    for (let q = 1; q <= maxQ; q++) {
      const p = Math.round(a * q);
      if (Math.abs(a - p / q) < tol) return [x < 0 ? -p : p, q];
    }
    return null;
  }

  function absText(x) {
    const r = ratio(Math.abs(x));
    if (r) return r[1] === 1 ? String(r[0]) : r[0] + "/" + r[1];
    return String(Math.round(Math.abs(x) * 1e4) / 1e4);
  }
  function absTex(x) {
    const r = ratio(Math.abs(x));
    if (r) return r[1] === 1 ? String(r[0]) : "\\frac{" + r[0] + "}{" + r[1] + "}";
    return String(Math.round(Math.abs(x) * 1e4) / 1e4);
  }

  const num = (x) => (x < 0 && absText(x) !== "0" ? "−" : "") + absText(x);
  const texNum = (x) => (x < 0 && absTex(x) !== "0" ? "-" : "") + absTex(x);

  function limpio(z, textFn) {
    return [textFn(z.re) === "0" ? 0 : z.re, textFn(z.im) === "0" ? 0 : z.im];
  }

  function fmt(z) {
    const [re, im] = limpio(z, absText);
    if (im === 0) return num(re);
    let imT = absText(im);
    imT = (imT === "1" ? "" : imT) + (imT.includes("/") ? " i" : "i");
    if (re === 0) return (im < 0 ? "−" : "") + imT;
    return num(re) + (im < 0 ? " − " : " + ") + imT;
  }

  function fmtTex(z) {
    const [re, im] = limpio(z, absTex);
    if (im === 0) return texNum(re);
    let imT = absTex(im);
    imT = (imT === "1" ? "" : imT) + "i";
    if (re === 0) return (im < 0 ? "-" : "") + imT;
    return texNum(re) + (im < 0 ? " - " : " + ") + imT;
  }

  const P = (x) => (x < 0 ? "(" + texNum(x) + ")" : texNum(x));
  const S = (x) => (x < 0 ? " - " : " + ") + absTex(x);

  function simplRad(n) {
    n = Math.round(n);
    if (n === 0) return { k: 0, m: 1 };
    let k = 1;
    for (let j = Math.floor(Math.sqrt(n)); j >= 1; j--) {
      if (n % (j * j) === 0) { k = j; break; }
    }
    return { k, m: n / (k * k) };
  }

  function moduloExacto(z) {
    const val = abs(z);
    const rr = ratio(z.re), ri = ratio(z.im);
    const aprox = String(Math.round(val * 1e4) / 1e4);
    if (rr && ri) {
      const d = lcm(rr[1], ri[1]);
      const p = rr[0] * (d / rr[1]);
      const q = ri[0] * (d / ri[1]);
      const { k, m } = simplRad(p * p + q * q);
      const g = gcd(k, d) || 1;
      const n1 = k / g, d1 = d / g;
      let txt, tex;
      if (m === 1) {
        txt = d1 === 1 ? String(n1) : n1 + "/" + d1;
        tex = d1 === 1 ? String(n1) : "\\frac{" + n1 + "}{" + d1 + "}";
      } else {
        const t1 = (n1 === 1 ? "" : String(n1)) + "√" + m;
        txt = d1 === 1 ? t1 : t1 + "/" + d1;
        const x1 = (n1 === 1 ? "" : String(n1)) + "\\sqrt{" + m + "}";
        tex = d1 === 1 ? x1 : "\\frac{" + x1 + "}{" + d1 + "}";
      }
      return { val, exacto: true, entero: m === 1 && d1 === 1, txt, tex, aprox };
    }
    return { val, exacto: false, entero: false, txt: aprox, tex: aprox, aprox };
  }

  function fmtModulus(z) {
    const m = moduloExacto(z);
    return m.exacto && !m.entero ? m.txt + " ≈ " + m.aprox : m.txt;
  }

  function powI(n) {
    const t = [C(1), C(0, 1), C(-1), C(0, -1)];
    return t[((n % 4) + 4) % 4];
  }

  function shuffle(array, rnd = Math.random) {
    const a = array.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // ---------- Polinomios (coeficientes de menor a mayor grado) ----------
  const pTrim = (p) => {
    const q = p.slice();
    while (q.length > 1 && abs(q[q.length - 1]) < 1e-12) q.pop();
    return q;
  };
  const pAdd = (a, b) => {
    const n = Math.max(a.length, b.length), r = [];
    for (let i = 0; i < n; i++) r.push(add(a[i] || C(0), b[i] || C(0)));
    return pTrim(r);
  };
  const pNeg = (a) => a.map(neg);
  const pSub = (a, b) => pAdd(a, pNeg(b));
  const pMul = (a, b) => {
    const r = Array.from({ length: a.length + b.length - 1 }, () => C(0));
    for (let i = 0; i < a.length; i++)
      for (let j = 0; j < b.length; j++) r[i + j] = add(r[i + j], mul(a[i], b[j]));
    return pTrim(r);
  };
  const pEval = (p, x) => {
    let r = C(0);
    for (let i = p.length - 1; i >= 0; i--) r = add(mul(r, x), p[i]);
    return r;
  };
  const pFromRoots = (roots, lead = C(1)) =>
    pTrim(roots.reduce((p, r) => pMul(p, [neg(r), C(1)]), [lead]));
  const pEsReal = (p, t = 1e-9) => p.every((c) => Math.abs(c.im) < t);

  function pDiv(a, b) {
    a = pTrim(a); b = pTrim(b);
    let r = a.slice();
    const q = Array.from({ length: Math.max(a.length - b.length + 1, 1) }, () => C(0));
    const lb = b[b.length - 1];
    while (r.length >= b.length && abs(r[r.length - 1]) > 1e-12) {
      const k = r.length - b.length;
      const c = div(r[r.length - 1], lb);
      q[k] = c;
      for (let i = 0; i < b.length; i++) r[i + k] = sub(r[i + k], mul(c, b[i]));
      r.pop();
      if (!r.length) break;
    }
    return { q: pTrim(q), r: pTrim(r.length ? r : [C(0)]) };
  }

  const sup = (k, tex) => (tex ? "^{" + k + "}" : String(k).split("").map((d) => SUPS[d]).join(""));

  function fmtPoly(p, tex = false) {
    p = pTrim(p);
    const n = p.length - 1;
    const minus = tex ? "-" : "−";
    let out = "";
    for (let k = n; k >= 0; k--) {
      const c = p[k];
      if (abs(c) < 1e-12) continue;
      const real = Math.abs(c.im) < 1e-9;
      const pureIm = !real && Math.abs(c.re) < 1e-9;
      let negativo, mag;
      if (real) {
        negativo = c.re < 0;
        mag = tex ? absTex(c.re) : absText(c.re);
        if (mag === "0") continue;
        if (mag === "1" && k > 0) mag = "";
      } else if (pureIm) {
        negativo = c.im < 0;
        let m = tex ? absTex(c.im) : absText(c.im);
        if (m === "1") m = "";
        else if (!tex && m.includes("/")) m = "(" + m + ")";
        mag = m + "i";
      } else {
        negativo = false;
        mag = "(" + (tex ? fmtTex(c) : fmt(c)) + ")";
      }
      const xs = k === 0 ? "" : k === 1 ? "x" : "x" + sup(k, tex);
      const term = mag + xs;
      if (out === "") out = (negativo ? minus : "") + term;
      else out += (negativo ? " " + minus + " " : " + ") + term;
    }
    return out || "0";
  }

  // ---------- Analizador de expresiones ----------
  function tokenizar(src) {
    const s = String(src)
      .replace(/[−–—]/g, "-")
      .replace(/[×·]/g, "*")
      .replace(/÷/g, "/")
      .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => "^" + Array.from(m).map((c) => SUPS.indexOf(c)).join(""));
    const toks = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      const rest = s.slice(i);
      let m = /^(\d+(\.\d+)?|\.\d+)/.exec(rest);
      if (m) { toks.push({ t: "num", v: parseFloat(m[0]) }); i += m[0].length; continue; }
      if ("+-*/^()".includes(c)) { toks.push({ t: c }); i++; continue; }
      if (c === "√") { toks.push({ t: "sqrt" }); i++; continue; }
      m = /^(sqrt|raiz|raíz)/i.exec(rest);
      if (m) { toks.push({ t: "sqrt" }); i += m[0].length; continue; }
      if (c === "i" || c === "I") { toks.push({ t: "i" }); i++; continue; }
      if (c === "x" || c === "X") { toks.push({ t: "x" }); i++; continue; }
      throw new Error("símbolo");
    }
    return toks;
  }

  function cPow(z, e) {
    let r = C(1), b = z, n = Math.abs(e);
    while (n > 0) {
      if (n % 2 === 1) r = mul(r, b);
      b = mul(b, b);
      n = Math.floor(n / 2);
    }
    if (e < 0) {
      const inv = div(C(1), r);
      if (!inv) throw new Error("cero");
      return inv;
    }
    return r;
  }

  function pPow(b, e) {
    if (b.length === 1) return [cPow(b[0], e)];
    if (e < 0) throw new Error("exponente");
    if ((b.length - 1) * e > 40) throw new Error("grado");
    let r = [C(1)];
    for (let i = 0; i < e; i++) r = pMul(r, b);
    return r;
  }

  function evaluar(src, opts) {
    const variable = !!(opts && opts.variable);
    try {
      const toks = tokenizar(src);
      if (!toks.length) throw new Error("vacío");
      let pos = 0;
      const peek = () => toks[pos];
      const next = () => toks[pos++];

      function cerrar() {
        if (!peek() || peek().t !== ")") throw new Error("paréntesis");
        next();
      }
      function constante(v) {
        if (v.length !== 1) throw new Error("constante");
        return v[0];
      }
      function expr() {
        let v = term();
        while (peek() && (peek().t === "+" || peek().t === "-")) {
          const op = next().t;
          const r = term();
          v = op === "+" ? pAdd(v, r) : pSub(v, r);
        }
        return v;
      }
      function term() {
        let v = factor();
        for (;;) {
          const k = peek();
          if (!k) break;
          if (k.t === "*") { next(); v = pMul(v, factor()); }
          else if (k.t === "/") {
            next();
            const d = constante(factor());
            if (abs(d) < 1e-12) throw new Error("cero");
            v = v.map((c) => div(c, d));
          } else if (k.t === "i" || k.t === "x" || k.t === "(" || k.t === "sqrt") {
            v = pMul(v, potencia());
          } else break;
        }
        return v;
      }
      function factor() {
        const k = peek();
        if (k && (k.t === "+" || k.t === "-")) {
          next();
          const v = factor();
          return k.t === "-" ? pNeg(v) : v;
        }
        return potencia();
      }
      function potencia() {
        const b = atomo();
        if (peek() && peek().t === "^") {
          next();
          return pPow(b, exponente());
        }
        return b;
      }
      function exponente() {
        let sgn = 1;
        if (peek() && (peek().t === "-" || peek().t === "+")) sgn = next().t === "-" ? -1 : 1;
        const k = next();
        let e;
        if (k && k.t === "num") e = k.v;
        else if (k && k.t === "(") {
          const z = constante(expr());
          cerrar();
          if (Math.abs(z.im) > 1e-12) throw new Error("exponente");
          e = z.re;
        } else throw new Error("exponente");
        if (!Number.isInteger(e) || Math.abs(e) > 100000) throw new Error("exponente");
        return sgn * e;
      }
      function atomo() {
        const k = next();
        if (!k) throw new Error("incompleta");
        if (k.t === "num") return [C(k.v)];
        if (k.t === "i") return [C(0, 1)];
        if (k.t === "x") {
          if (!variable) throw new Error("variable");
          return [C(0), C(1)];
        }
        if (k.t === "(") {
          const v = expr();
          cerrar();
          return v;
        }
        if (k.t === "sqrt") {
          let a;
          if (peek() && peek().t === "(") { next(); a = constante(expr()); cerrar(); }
          else {
            let sgn = 1;
            if (peek() && peek().t === "-") { next(); sgn = -1; }
            const n = next();
            if (!n || n.t !== "num") throw new Error("raíz");
            a = C(sgn * n.v);
          }
          if (Math.abs(a.im) > 1e-12) throw new Error("raíz");
          return [a.re >= 0 ? C(Math.sqrt(a.re)) : C(0, Math.sqrt(-a.re))];
        }
        throw new Error("símbolo");
      }

      const v = expr();
      if (pos < toks.length) throw new Error("sobran");
      return { ok: true, poly: pTrim(v) };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  function evalComplejo(src) {
    const r = evaluar(src);
    return r.ok && r.poly.length === 1 ? r.poly[0] : null;
  }

  function parseLista(src) {
    const partes = String(src).split(/[;,]/).map((s) => s.trim()).filter(Boolean);
    if (!partes.length) return null;
    const out = [];
    for (const p of partes) {
      const z = evalComplejo(p);
      if (!z) return null;
      out.push(z);
    }
    return out;
  }

  function esFormaEstandar(src) {
    const s = String(src).replace(/[−–—]/g, "-").replace(/\s+/g, "");
    const R = "\\d+(?:\\.\\d+)?(?:/\\d+)?";
    const re = new RegExp("^(?:[+-]?" + R + ")?(?:[+-]?(?:" + R + ")?i)?$");
    return s.length > 0 && re.test(s);
  }

  // ---------- Raíces (Durand–Kerner) y factorización ----------
  function limpiaNum(x) {
    const r = ratio(x, 12, 1e-5);
    if (r) return r[0] / r[1];
    return Math.round(x * 1e6) / 1e6;
  }
  const limpia = (z) => C(limpiaNum(z.re), limpiaNum(z.im));

  function raices(coefs) {
    let p = pTrim(coefs);
    if (p.length < 2) return [];
    let ceros = 0;
    while (p.length > 1 && abs(p[0]) < 1e-12) { p = p.slice(1); ceros++; }
    const lista = [];
    const n = p.length - 1;
    if (n >= 1) {
      const lead = p[n];
      const mon = p.map((c) => div(c, lead));
      const cota = 1 + Math.max.apply(null, mon.slice(0, n).map(abs));
      const r0 = Math.min(cota, Math.max(0.5, Math.pow(abs(mon[0]), 1 / n)));
      const z = [];
      for (let k = 0; k < n; k++) {
        const ang = (2 * Math.PI * k) / n + 0.5;
        z.push(C(r0 * Math.cos(ang), r0 * Math.sin(ang)));
      }
      for (let it = 0; it < 1000; it++) {
        let delta = 0;
        for (let k = 0; k < n; k++) {
          let den = C(1);
          for (let j = 0; j < n; j++) if (j !== k) den = mul(den, sub(z[k], z[j]));
          if (abs(den) < 1e-12) den = C(1e-12);
          const dz = div(pEval(mon, z[k]), den) || C(0);
          z[k] = sub(z[k], dz);
          delta = Math.max(delta, abs(dz));
        }
        if (delta < 1e-14) break;
      }
      z.forEach((r) => lista.push(r));
    }
    for (let i = 0; i < ceros; i++) lista.push(C(0));

    const grupos = [];
    for (const r of lista) {
      const g = grupos.find((g) => abs(sub(g.centro, r)) < 1e-3);
      if (g) { g.miembros.push(r); g.centro = r; }
      else grupos.push({ centro: r, miembros: [r] });
    }
    const out = grupos.map((g) => {
      const s = g.miembros.reduce((a, b) => add(a, b), C(0));
      return { raiz: limpia(C(s.re / g.miembros.length, s.im / g.miembros.length)), mult: g.miembros.length };
    });
    out.sort((a, b) => a.raiz.re - b.raiz.re || b.raiz.im - a.raiz.im);
    return out;
  }

  function textoLineal(r) {
    const real = Math.abs(r.im) < 1e-9;
    const imag0 = Math.abs(r.re) < 1e-9;
    if (real) {
      if (imag0) return "x";
      return r.re < 0 ? "(x + " + absText(r.re) + ")" : "(x − " + absText(r.re) + ")";
    }
    if (imag0) {
      const m = absText(r.im);
      const t = (m === "1" ? "" : m) + (m.includes("/") ? " i" : "i");
      return "(x " + (r.im < 0 ? "+ " : "− ") + t + ")";
    }
    return "(x − (" + fmt(r) + "))";
  }

  function factorizar(coefs) {
    const p = pTrim(coefs);
    const grado = p.length - 1;
    if (grado < 1) return null;
    const grupos = raices(p);
    const lead = p[grado];
    const leadReal = Math.abs(lead.im) < 1e-9;
    let leadTxt = "";
    if (leadReal) {
      if (Math.abs(lead.re - 1) > 1e-9) leadTxt = Math.abs(lead.re + 1) < 1e-9 ? "−" : fmt(lead);
    } else leadTxt = "(" + fmt(lead) + ")";
    const m = (g) => (g.mult > 1 ? sup(g.mult, false) : "");
    const textoC = leadTxt + grupos.map((g) => textoLineal(g.raiz) + m(g)).join("");
    const reales = pEsReal(p);
    let textoR = null;
    if (reales) {
      const partes = [];
      for (const g of grupos) {
        if (Math.abs(g.raiz.im) < 1e-9) partes.push(textoLineal(g.raiz) + m(g));
        else if (g.raiz.im > 0) {
          const a = g.raiz.re, b = g.raiz.im;
          partes.push("(" + fmtPoly([C(a * a + b * b), C(-2 * a), C(1)]) + ")" + m(g));
        }
      }
      textoR = leadTxt + partes.join("");
    }
    let pares = true;
    for (const g of grupos) {
      if (Math.abs(g.raiz.im) > 1e-9) {
        const cj = C(g.raiz.re, -g.raiz.im);
        if (!grupos.some((h) => abs(sub(h.raiz, cj)) < 1e-6 && h.mult === g.mult)) pares = false;
      }
    }
    const noReales = grupos.filter((g) => Math.abs(g.raiz.im) > 1e-9).reduce((s, g) => s + g.mult, 0);
    return {
      grado, grupos, textoC, textoR, reales, pares, noReales,
      total: grupos.reduce((s, g) => s + g.mult, 0),
    };
  }

  // ---------- Pasos detallados en LaTeX ----------
  function pasos(op, z1, z2) {
    const a = z1.re, b = z1.im;
    const c = z2 ? z2.re : 0, d = z2 ? z2.im : 0;
    const A = fmtTex(z1), B = z2 ? fmtTex(z2) : "";
    switch (op) {
      case "suma":
        return [
          "(a+bi)+(c+di)=(a+c)+(b+d)i",
          "(" + A + ")+(" + B + ")=(" + texNum(a) + S(c) + ")+(" + texNum(b) + S(d) + ")i",
          "=" + fmtTex(add(z1, z2)),
        ];
      case "resta":
        return [
          "(a+bi)-(c+di)=(a-c)+(b-d)i",
          "(" + A + ")-(" + B + ")=(" + texNum(a) + "-" + P(c) + ")+(" + texNum(b) + "-" + P(d) + ")i",
          "=" + fmtTex(sub(z1, z2)),
        ];
      case "mult":
        return [
          "(a+bi)(c+di)=(ac-bd)+(ad+bc)i",
          "(" + A + ")(" + B + ")=" + P(a) + "\\cdot" + P(c) + "+" + P(a) + "\\cdot" + P(d) + "\\,i+" +
            P(b) + "\\cdot" + P(c) + "\\,i+" + P(b) + "\\cdot" + P(d) + "\\,i^2",
          "=" + texNum(a * c) + S(-b * d) + "+(" + texNum(a * d) + S(b * c) + ")i\\qquad(i^2=-1)",
          "=" + fmtTex(mul(z1, z2)),
        ];
      case "conj":
        return [
          "\\overline{a+bi}=a-bi",
          "\\overline{" + A + "}=" + fmtTex(conj(z1)),
          "z\\cdot\\bar z=a^2+b^2=" + texNum(a * a) + S(b * b) + "=" + texNum(a * a + b * b),
        ];
      case "mod": {
        const m = moduloExacto(z1);
        const s = a * a + b * b;
        return [
          "|a+bi|=\\sqrt{a^2+b^2}",
          "|" + A + "|=\\sqrt{" + P(a) + "^2+" + P(b) + "^2}",
          "=\\sqrt{" + texNum(a * a) + S(b * b) + "}=\\sqrt{" + texNum(s) + "}",
          "=" + m.tex + (m.entero ? "" : "\\approx " + m.aprox),
        ];
      }
      case "div": {
        const den = c * c + d * d;
        if (den < 1e-24) return ["\\text{No se puede dividir entre } 0"];
        const cj = fmtTex(conj(z2));
        const numr = mul(z1, conj(z2));
        return [
          "\\dfrac{a+bi}{c+di}\\cdot\\dfrac{c-di}{c-di}=\\dfrac{(ac+bd)+(bc-ad)i}{c^2+d^2}",
          "\\dfrac{" + A + "}{" + B + "}=\\dfrac{(" + A + ")(" + cj + ")}{(" + B + ")(" + cj + ")}",
          "=\\dfrac{(" + texNum(a * c) + S(b * d) + ")+(" + texNum(b * c) + S(-a * d) + ")i}{" + texNum(c * c) + S(d * d) + "}",
          "=\\dfrac{" + fmtTex(numr) + "}{" + texNum(den) + "}",
          "=" + fmtTex(div(z1, z2)),
        ];
      }
      default:
        return [];
    }
  }

  function pasosParalelo(Z1, Z2) {
    const n = mul(Z1, Z2), d = add(Z1, Z2);
    const eq = div(n, d);
    return {
      eq,
      bloques: [
        { titulo: "Producto del numerador", tex: pasos("mult", Z1, Z2) },
        { titulo: "Suma del denominador", tex: pasos("suma", Z1, Z2) },
        { titulo: "Cociente (racionalizar con el conjugado)", tex: eq ? pasos("div", n, d) : [] },
      ],
    };
  }

  // ---------- Revisión de respuestas ----------
  const MSG_FORMATO =
    "No pude interpretar tu respuesta. Usa números, i, fracciones (3/5), √ o sqrt(…). Ejemplo: −1 + 9i.";

  function revisar(ej, texto) {
    const t = String(texto || "").trim();
    if (!t) return { estado: "vacio", msg: "Escribe tu respuesta primero." };

    if (ej.tipo === "polinomio") {
      const r = evaluar(t, { variable: true });
      if (!r.ok) return { estado: "formato", msg: "No pude interpretar el polinomio. Ejemplo: x^3 - 2x^2 + 9x - 18." };
      if (ej.expandido && /[()]/.test(t))
        return { estado: "formato", msg: "Escribe el polinomio expandido, sin paréntesis." };
      const e = pTrim(ej.esperado);
      const p = r.poly;
      if (p.length === e.length && p.every((c, i) => abs(sub(c, e[i])) < 1e-6)) return { estado: "ok", msg: "¡Correcto!" };
      return { estado: "mal", msg: ej.msgMal || "Ese polinomio no coincide. Expándelo y compara término a término." };
    }

    const r = evaluar(t);
    if (!r.ok || r.poly.length !== 1) return { estado: "formato", msg: MSG_FORMATO };
    const z = r.poly[0];
    const decimal = /\d\.\d/.test(t) && !/sqrt|raiz|raíz|√/i.test(t);
    const tol = ej.aprox && decimal ? 0.02 : 1e-6;
    const esp = ej.tipo === "real" ? C(ej.esperado) : ej.esperado;

    if (ej.tipo === "real" && Math.abs(z.im) > 1e-9)
      return { estado: "mal", msg: "La respuesta debe ser un número real (sin parte imaginaria)." };

    if (abs(sub(z, esp)) <= tol * Math.max(1, abs(esp))) {
      if (ej.estandar && !esFormaEstandar(t))
        return { estado: "formato", msg: "El valor es correcto, pero escríbelo en forma estándar a + bi (sin paréntesis ni operaciones por hacer)." };
      return { estado: "ok", msg: "¡Correcto!" };
    }
    for (const tr of ej.trampas || []) {
      const v = typeof tr.valor === "number" ? C(tr.valor) : tr.valor;
      if (abs(sub(z, v)) <= 1e-6 * Math.max(1, abs(v))) return { estado: "mal", msg: tr.msg };
    }
    return { estado: "mal", msg: ej.msgMal || "Todavía no. Revisa tu procedimiento o pide una pista." };
  }

  return {
    C, add, sub, mul, div, neg, conj, abs, arg,
    ratio, num, texNum, absText, absTex, fmt, fmtTex, fmtModulus, moduloExacto,
    simplRad, powI, shuffle,
    pTrim, pAdd, pSub, pMul, pDiv, pEval, pFromRoots, pEsReal, fmtPoly,
    evaluar, evalComplejo, parseLista, esFormaEstandar,
    raices, factorizar, pasos, pasosParalelo, revisar, MSG_FORMATO,
  };
});
