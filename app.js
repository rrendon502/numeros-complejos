(function () {
  const K = window.Complejos;
  const $ = (id) => document.getElementById(id);
  const val = (id) => {
    const v = parseFloat($(id).value);
    return Number.isFinite(v) ? v : 0;
  };
  const renderMath = (el) => {
    if (window.renderMathInElement) {
      window.renderMathInElement(el || document.body, {
        delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }],
        throwOnError: false,
      });
    }
  };
  const row = (label, value) => {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    const td = document.createElement("td");
    th.textContent = label;
    td.textContent = value;
    tr.append(th, td);
    return tr;
  };

  const z1 = () => K.C(val("a1"), val("b1"));
  const z2 = () => K.C(val("a2"), val("b2"));

  function actualizarOperaciones() {
    const a = z1();
    const b = z2();
    const cociente = K.div(a, b);
    const t = $("tabla-ops");
    t.replaceChildren(
      row("z₁", K.fmt(a)),
      row("z₂", K.fmt(b)),
      row("z₁ + z₂", K.fmt(K.add(a, b))),
      row("z₁ − z₂", K.fmt(K.sub(a, b))),
      row("z₁ · z₂", K.fmt(K.mul(a, b))),
      row("z₁ / z₂", cociente ? K.fmt(cociente) : "No definido (z₂ = 0)"),
      row("Conjugado de z₁", K.fmt(K.conj(a))),
      row("Módulo de z₁", K.fmtModulus(a)),
      row("Argumento de z₁", K.num(K.arg(a) * 180 / Math.PI) + "°")
    );
    dibujarPlano();
  }

  const LIM = 6;
  function dibujarPlano() {
    const cv = $("plano");
    const g = cv.getContext("2d");
    const w = cv.width;
    const px = (x) => ((x + LIM) / (2 * LIM)) * w;
    const py = (y) => ((LIM - y) / (2 * LIM)) * w;
    g.clearRect(0, 0, w, w);
    g.font = "12px system-ui";
    g.strokeStyle = "#e1e4e8";
    g.fillStyle = "#57606a";
    g.lineWidth = 1;
    for (let k = -LIM; k <= LIM; k++) {
      g.beginPath(); g.moveTo(px(k), 0); g.lineTo(px(k), w); g.stroke();
      g.beginPath(); g.moveTo(0, py(k)); g.lineTo(w, py(k)); g.stroke();
      if (k !== 0 && k % 2 === 0) {
        g.fillText(k, px(k) - 4, py(0) + 14);
        g.fillText(k + "i", px(0) + 5, py(k) + 4);
      }
    }
    g.strokeStyle = "#000";
    g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(0, py(0)); g.lineTo(w, py(0)); g.stroke();
    g.beginPath(); g.moveTo(px(0), 0); g.lineTo(px(0), w); g.stroke();
    g.fillStyle = "#000";
    g.fillText("Real", w - 34, py(0) - 6);
    g.fillText("Imag.", px(0) + 6, 12);

    const a = z1();
    const b = z2();
    const flecha = (z, color, etiqueta, punteada) => {
      const x = px(z.re), y = py(z.im), x0 = px(0), y0 = py(0);
      g.strokeStyle = color; g.fillStyle = color; g.lineWidth = 2.5;
      g.setLineDash(punteada ? [6, 5] : []);
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x, y); g.stroke();
      g.setLineDash([]);
      const ang = Math.atan2(y - y0, x - x0);
      if (Math.hypot(x - x0, y - y0) > 1) {
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x - 11 * Math.cos(ang - 0.4), y - 11 * Math.sin(ang - 0.4));
        g.lineTo(x - 11 * Math.cos(ang + 0.4), y - 11 * Math.sin(ang + 0.4));
        g.closePath(); g.fill();
      }
      g.font = "bold 13px system-ui";
      g.fillText(etiqueta + " " + K.fmt(z), x + 8, y - 8);
    };
    flecha(a, "#d62728", "z₁");
    flecha(b, "#2ca02c", "z₂");
    flecha(K.add(a, b), "#1f4fd8", "z₁+z₂", true);
  }

  function clicPlano(ev) {
    const cv = $("plano");
    const r = cv.getBoundingClientRect();
    const x = ((ev.clientX - r.left) / r.width) * 2 * LIM - LIM;
    const y = LIM - ((ev.clientY - r.top) / r.height) * 2 * LIM;
    $("a1").value = Math.round(x * 2) / 2;
    $("b1").value = Math.round(y * 2) / 2;
    actualizarOperaciones();
  }

  function actualizarPotencia() {
    const n = Math.trunc(val("exp"));
    const r = ((n % 4) + 4) % 4;
    $("res-potencia").textContent = `i^${n} = ${K.fmt(K.powI(n))}   (residuo ${r} al dividir ${n} entre 4)`;
  }

  function actualizarFactor() {
    const a = val("qa"), b = val("qb"), c = val("qc");
    const box = $("res-factor");
    const f = K.factorQuadratic(a, b, c);
    if (!f) {
      box.textContent = "Para un polinomio cuadrático, a debe ser distinto de cero.";
      return;
    }
    const lineas = [
      `Polinomio: ${poli(a, b, c)}`,
      `Discriminante: ${K.num(f.discriminant)} (${f.discriminant < 0 ? "raíces complejas conjugadas" : f.discriminant === 0 ? "raíz real doble" : "dos raíces reales"})`,
      `Raíces: ${f.roots.map((r) => K.fmt(r)).join("  y  ")}`,
      `Factorización: ${f.text}`,
    ];
    box.replaceChildren(...lineas.map((l) => {
      const p = document.createElement("div");
      p.textContent = l;
      return p;
    }));
  }

  function poli(a, b, c) {
    const termino = (coef, sufijo, primero) => {
      if (coef === 0) return "";
      const signo = coef < 0 ? "−" : primero ? "" : "+";
      const mag = Math.abs(coef) === 1 && sufijo ? "" : K.num(Math.abs(coef));
      return (primero ? signo : ` ${signo} `) + mag + sufijo;
    };
    return termino(a, "x²", true) + termino(b, "x", false) + termino(c, "", false);
  }

  const PREGUNTAS = [
    { q: "¿Cuál es el resultado de simplificar $i^3$?", o: ["$-i$", "$i$", "$-1$", "$1$"], c: 0, e: "$i^3 = i^2 \\cdot i = -i$." },
    { q: "¿Cuál es la factorización completa en los complejos de $x^2 + 9$?", o: ["$(x - 3i)(x + 3i)$", "$(x - 3)(x + 3)$", "$(x - 3i)^2$", "No se puede factorizar"], c: 0, e: "Como $(3i)^2 = -9$, las raíces son $\\pm 3i$." },
    { q: "¿Cuál es el conjugado de $3 + 2i$?", o: ["$3 - 2i$", "$-3 + 2i$", "$-3 - 2i$", "$2 + 3i$"], c: 0, e: "El conjugado cambia el signo de la parte imaginaria." },
    { q: "¿Cuál es el módulo de $3 + 4i$?", o: ["$5$", "$7$", "$\\sqrt{7}$", "$25$"], c: 0, e: "$\\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$." },
    { q: "Calcula $(3 + 2i)(1 - 4i)$.", o: ["$11 - 10i$", "$3 - 8i$", "$11 + 10i$", "$-5 - 10i$"], c: 0, e: "$3 - 12i + 2i - 8i^2 = 3 - 10i + 8 = 11 - 10i$." },
    { q: "¿Cuántas raíces complejas tiene un polinomio de grado 5, contando multiplicidades?", o: ["5", "1", "Depende de los coeficientes", "Máximo 2"], c: 0, e: "Es el Teorema Fundamental del Álgebra: grado $n$, $n$ raíces." },
  ];

  function iniciarQuiz() {
    const cont = $("quiz");
    const preguntas = K.shuffle(PREGUNTAS);
    let puntaje = 0, respondidas = 0;
    cont.replaceChildren();
    const final = document.createElement("p");
    final.className = "final";
    final.setAttribute("aria-live", "polite");

    preguntas.forEach((p, idx) => {
      const div = document.createElement("div");
      div.className = "pregunta";
      const enunciado = document.createElement("p");
      enunciado.innerHTML = `<strong>Pregunta ${idx + 1}.</strong> `;
      const texto = document.createElement("span");
      texto.textContent = p.q;
      enunciado.append(texto);
      const ops = document.createElement("div");
      ops.className = "opciones";
      const retro = document.createElement("p");
      retro.className = "retro";
      retro.setAttribute("aria-live", "polite");

      const opciones = K.shuffle(p.o.map((texto, i) => ({ texto, correcta: i === p.c })));
      opciones.forEach((op) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = op.texto;
        b.addEventListener("click", () => {
          ops.querySelectorAll("button").forEach((x) => { x.disabled = true; });
          respondidas++;
          if (op.correcta) { puntaje++; b.classList.add("ok"); retro.textContent = "¡Correcto! " + p.e; }
          else {
            b.classList.add("mal");
            ops.querySelectorAll("button").forEach((x, i) => { if (opciones[i].correcta) x.classList.add("ok"); });
            retro.textContent = "Incorrecto. " + p.e;
          }
          renderMath(retro);
          if (respondidas === preguntas.length) {
            final.textContent = `Calificación final: ${puntaje} / ${preguntas.length}`;
            const otra = document.createElement("button");
            otra.type = "button";
            otra.className = "accion";
            otra.textContent = "Intentar de nuevo";
            otra.addEventListener("click", iniciarQuiz);
            cont.append(otra);
          }
        });
        ops.append(b);
      });
      div.append(enunciado, ops, retro);
      cont.append(div);
    });
    cont.append(final);
    renderMath(cont);
  }

  function iniciar() {
    ["a1", "b1", "a2", "b2"].forEach((id) => $(id).addEventListener("input", actualizarOperaciones));
    $("exp").addEventListener("input", actualizarPotencia);
    ["qa", "qb", "qc"].forEach((id) => $(id).addEventListener("input", actualizarFactor));
    $("plano").addEventListener("pointerdown", clicPlano);
    actualizarOperaciones();
    actualizarPotencia();
    actualizarFactor();
    iniciarQuiz();
    renderMath();
  }

  window.addEventListener("load", iniciar);
})();
