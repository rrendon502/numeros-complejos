(function () {
  "use strict";
  const X = window.Complejos;
  const C = X.C;
  const $ = (id) => document.getElementById(id);
  const DELIM = [
    { left: "$$", right: "$$", display: true },
    { left: "$", right: "$", display: false },
  ];

  function mate(el) {
    if (window.renderMathInElement) window.renderMathInElement(el, { delimiters: DELIM, throwOnError: false });
  }
  const bloque = (lineas) => lineas.map((l) => '<div class="paso">$$' + l + "$$</div>").join("");

  // ---------- Progreso ----------
  const KEY = "guia-complejos-v2";
  let hechos = {};
  try { hechos = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { hechos = {}; }
  function guardar() { try { localStorage.setItem(KEY, JSON.stringify(hechos)); } catch (e) { /* sin almacenamiento */ } }

  const grupos = {};
  function actualizarProgreso() {
    let total = 0, ok = 0;
    const porModulo = {};
    Object.keys(grupos).forEach((g) => {
      const m = g === "gq" ? "m8" : g.replace("g", "m");
      porModulo[m] = porModulo[m] || { t: 0, o: 0 };
      grupos[g].forEach((id) => {
        porModulo[m].t++; total++;
        if (hechos[id]) { porModulo[m].o++; ok++; }
      });
    });
    Object.keys(porModulo).forEach((m) => {
      const el = $("cont-" + m);
      if (el) el.textContent = porModulo[m].o + "/" + porModulo[m].t;
    });
    const barra = $("barra");
    if (barra) { barra.max = total; barra.value = ok; }
    const txt = $("txt-progreso");
    if (txt) txt.textContent = ok + " de " + total + " ejercicios resueltos";
  }

  // ---------- Banco de ejercicios ----------
  const s3 = Math.sqrt(3);
  const EJ = [
    // M1
    { id: "1-1", g: "g1", enun: "Escribe $\\sqrt{-12}$ en la forma $bi$ (puedes escribir 2√3 i).",
      spec: { tipo: "complejo", esperado: C(0, 2 * s3) },
      pistas: ["Si $a>0$: $\\sqrt{-a}=i\\sqrt{a}$.", "Simplifica $\\sqrt{12}=\\sqrt{4\\cdot3}$."],
      sol: ["\\sqrt{-12}=i\\sqrt{12}=i\\sqrt{4\\cdot3}=2\\sqrt3\\,i"] },
    { id: "1-2", g: "g1", enun: "Calcula $i^{27}$.",
      spec: { tipo: "complejo", esperado: C(0, -1) },
      pistas: ["Divide 27 entre 4 y usa solo el residuo."],
      sol: ["27=4\\cdot6+3", "i^{27}=(i^4)^6\\cdot i^3=i^3=-i"] },
    { id: "1-3", g: "g1", enun: "Calcula $i^{45}+i^{102}$ en la forma $a+bi$.",
      spec: { tipo: "complejo", esperado: C(-1, 1), estandar: true },
      pistas: ["Reduce cada exponente: $45=4\\cdot11+1$ y $102=4\\cdot25+2$."],
      sol: ["i^{45}=i^1=i,\\qquad i^{102}=i^2=-1", "i^{45}+i^{102}=-1+i"] },
    { id: "1-4", g: "g1", enun: "Calcula $i^{-3}$.",
      spec: { tipo: "complejo", esperado: C(0, 1) },
      pistas: ["También funciona con exponentes negativos: $-3=4\\cdot(-1)+1$."],
      sol: ["-3=4\\cdot(-1)+1\\Rightarrow i^{-3}=i^1=i"] },
    // M2
    { id: "2-1", g: "g2", enun: "Si $z=4-5i$, ¿cuánto vale $\\operatorname{Im}(z)$?",
      spec: { tipo: "real", esperado: -5 },
      pistas: ["La parte imaginaria es el número real que multiplica a $i$; no incluye la $i$."],
      sol: ["\\operatorname{Im}(4-5i)=-5\\quad(\\text{no }-5i)"] },
    { id: "2-2", g: "g2", enun: "Halla el conjugado de $z=-3+7i$.",
      spec: { tipo: "complejo", esperado: C(-3, -7), estandar: true },
      pistas: ["Solo cambia el signo de la parte imaginaria."],
      sol: ["\\overline{-3+7i}=-3-7i"] },
    { id: "2-3", g: "g2", enun: "Calcula $z\\cdot\\bar z$ para $z=2-3i$.",
      spec: { tipo: "real", esperado: 13 },
      pistas: ["$z\\bar z=a^2+b^2$."],
      sol: ["z\\bar z=2^2+(-3)^2=4+9=13"] },
    { id: "2-4", g: "g2", enun: "Calcula el módulo $|5-12i|$.",
      spec: { tipo: "real", esperado: 13 },
      pistas: ["$|a+bi|=\\sqrt{a^2+b^2}$."],
      sol: ["|5-12i|=\\sqrt{25+144}=\\sqrt{169}=13"] },
    // M3
    { id: "3-1", g: "g3", enun: "Calcula $(2-i)(3+4i)$.",
      spec: { tipo: "complejo", esperado: C(10, 5), estandar: true },
      pistas: ["Distribuye los cuatro productos y recuerda $i^2=-1$."],
      sol: ["(2-i)(3+4i)=6+8i-3i-4i^2", "=6+5i+4=10+5i"] },
    { id: "3-2", g: "g3", enun: "Calcula $(5+2i)-(3-6i)$.",
      spec: { tipo: "complejo", esperado: C(2, 8), estandar: true },
      pistas: ["El signo menos afecta a toda la segunda expresión."],
      sol: ["(5+2i)-(3-6i)=5-3+(2+6)i=2+8i"] },
    { id: "3-3", g: "g3", enun: "Calcula $\\dfrac{1+2i}{3-i}$ en forma $a+bi$ (puedes usar fracciones: 1/10 + 7/10 i).",
      spec: { tipo: "complejo", esperado: C(0.1, 0.7), estandar: true },
      pistas: ["Multiplica numerador y denominador por el conjugado del denominador, $3+i$."],
      sol: ["\\dfrac{(1+2i)(3+i)}{(3-i)(3+i)}=\\dfrac{3+i+6i+2i^2}{9+1}=\\dfrac{1+7i}{10}", "=\\dfrac1{10}+\\dfrac7{10}i"] },
    { id: "3-4", g: "g3", enun: "Calcula $(2+3i)^2$.",
      spec: { tipo: "complejo", esperado: C(-5, 12), estandar: true },
      pistas: ["$(a+b)^2=a^2+2ab+b^2$ y $i^2=-1$."],
      sol: ["(2+3i)^2=4+12i+9i^2=4+12i-9=-5+12i"] },
    { id: "3-5", g: "g3", enun: "Calcula $\\dfrac{2+i}{i}$.",
      spec: { tipo: "complejo", esperado: C(1, -2), estandar: true },
      pistas: ["El conjugado de $i$ es $-i$."],
      sol: ["\\dfrac{(2+i)(-i)}{i\\cdot(-i)}=\\dfrac{-2i-i^2}{1}=1-2i"] },
    // M4
    { id: "4-1", g: "g4", enun: "Calcula $E=\\sqrt{-18}\\cdot\\sqrt{-2}+\\dfrac{i^{13}}{1+i}$ en forma $a+bi$.",
      spec: { tipo: "complejo", esperado: C(-5.5, 0.5), estandar: true },
      pistas: ["Primero escribe cada raíz como $bi$: $\\sqrt{-18}=3\\sqrt2\\,i$.", "$i^{13}=i$. Luego racionaliza $\\frac{i}{1+i}$."],
      sol: ["\\sqrt{-18}\\sqrt{-2}=(3\\sqrt2\\,i)(\\sqrt2\\,i)=6i^2=-6", "\\dfrac{i}{1+i}=\\dfrac{i(1-i)}{2}=\\dfrac{1+i}{2}", "E=-6+\\dfrac{1+i}{2}=-\\dfrac{11}{2}+\\dfrac12 i"] },
    { id: "4-2", g: "g4", enun: "Dos impedancias en paralelo: $Z_1=3+i\\ \\Omega$ y $Z_2=2-i\\ \\Omega$. Calcula $Z_{eq}=\\dfrac{Z_1Z_2}{Z_1+Z_2}$.",
      spec: { tipo: "complejo", esperado: C(1.4, -0.2), estandar: true },
      pistas: ["$Z_1Z_2=7-i$ y $Z_1+Z_2=5$."],
      sol: ["Z_1Z_2=(3+i)(2-i)=6-3i+2i-i^2=7-i", "Z_1+Z_2=5", "Z_{eq}=\\dfrac{7-i}{5}=\\dfrac75-\\dfrac15 i\\ \\Omega"] },
    { id: "4-3", g: "g4", enun: "¿Cuál es $|Z_{eq}|$ del ejercicio anterior? (exacto √2 o aproximado)",
      spec: { tipo: "real", esperado: Math.SQRT2, aprox: true },
      pistas: ["$|Z_{eq}|=\\sqrt{(7/5)^2+(1/5)^2}$."],
      sol: ["|Z_{eq}|=\\sqrt{\\tfrac{49}{25}+\\tfrac1{25}}=\\sqrt2\\approx1.414\\ \\Omega"] },
    // M5
    { id: "5-1", g: "g5", enun: "Escribe, expandido, el polinomio mónico real de grado 3 con ceros $1$ y $2i$.",
      spec: { tipo: "polinomio", esperado: X.evaluar("x^3-x^2+4x-4", { variable: true }).poly, expandido: true },
      pistas: ["Como los coeficientes son reales, $-2i$ también es cero.", "$(x-2i)(x+2i)=x^2+4$."],
      sol: ["P(x)=(x-1)(x-2i)(x+2i)=(x-1)(x^2+4)", "=x^3-x^2+4x-4"] },
    { id: "5-2", g: "g5", enun: "Escribe, expandido, el polinomio mónico real de grado 3 con ceros $0$ y $3-i$.",
      spec: { tipo: "polinomio", esperado: X.evaluar("x^3-6x^2+10x", { variable: true }).poly, expandido: true },
      pistas: ["El otro cero es $3+i$.", "$(x-(3-i))(x-(3+i))=(x-3)^2-i^2=x^2-6x+10$."],
      sol: ["P(x)=x\\,(x^2-6x+10)=x^3-6x^2+10x"] },
    { id: "5-3", g: "g5", enun: "Un cero de $x^2+16$ con parte imaginaria positiva es…",
      spec: { tipo: "complejo", esperado: C(0, 4) },
      pistas: ["Resuelve $x^2=-16$."],
      sol: ["x^2=-16\\Rightarrow x=\\pm\\sqrt{-16}=\\pm4i"] },
    { id: "5-4", g: "g5", tipo: "opcion", enun: "Según el Teorema Fundamental del Álgebra, ¿cuántos ceros complejos tiene $x^7-3x+1$ (contando multiplicidad)?",
      opciones: ["7", "3", "1", "Depende de los coeficientes"], correcta: 0,
      retro: "Un polinomio de grado $n\\ge1$ tiene exactamente $n$ ceros complejos contando multiplicidades." },
    // M6
    { id: "6-1", g: "g6", enun: "Divide $x^4-2x^3+6x^2-8x+8$ entre $x^2+4$ y escribe el cociente.",
      spec: { tipo: "polinomio", esperado: X.evaluar("x^2-2x+2", { variable: true }).poly, expandido: true },
      pistas: ["El primer término es $x^4/x^2=x^2$.", "Comprueba multiplicando cociente por divisor."],
      sol: ["(x^2+4)(x^2-2x+2)=x^4-2x^3+2x^2+4x^2-8x+8=x^4-2x^3+6x^2-8x+8"] },
    { id: "6-2", g: "g6", enun: "Del cociente anterior, ¿qué cero tiene parte imaginaria positiva?",
      spec: { tipo: "complejo", esperado: C(1, 1) },
      pistas: ["Usa la fórmula cuadrática en $x^2-2x+2=0$."],
      sol: ["x=\\dfrac{2\\pm\\sqrt{4-8}}{2}=\\dfrac{2\\pm2i}{2}=1\\pm i"] },
    // M7
    { id: "7-1", g: "g7", enun: "Calcula $\\sqrt{-4}\\cdot\\sqrt{-9}$.",
      spec: { tipo: "complejo", esperado: C(-6), trampas: [{ valor: 6, msg: "Cuidado: $\\sqrt a\\sqrt b=\\sqrt{ab}$ solo vale si al menos uno es no negativo. Escribe primero cada raíz como $bi$." }] },
      pistas: ["$\\sqrt{-4}=2i$ y $\\sqrt{-9}=3i$."],
      sol: ["\\sqrt{-4}\\cdot\\sqrt{-9}=(2i)(3i)=6i^2=-6\\quad(\\neq\\sqrt{36}=6)"] },
    { id: "7-2", g: "g7", enun: "Si $z=3-8i$, ¿cuánto vale $\\operatorname{Im}(z)$?",
      spec: { tipo: "real", esperado: -8 },
      pistas: ["Recuerda: Im(z) es un número real."],
      sol: ["\\operatorname{Im}(3-8i)=-8"] },
    { id: "7-3", g: "g7", tipo: "opcion", enun: "Sea $P(x)=x^2-ix+2$. ¿Puedes asegurar que si $c$ es un cero de $P$, entonces $\\bar c$ también?",
      opciones: ["No: $P$ tiene un coeficiente no real y el teorema exige coeficientes reales", "Sí: eso ocurre con cualquier polinomio", "Sí: porque el grado es 2", "No: porque $P$ no tiene ceros"], correcta: 0,
      retro: "Los ceros de $P$ son $2i$ y $-i$: no son conjugados entre sí." },
    // M8: ejercicios del documento de apoyo
    { id: "8-1", g: "g8", enun: "Calcula $z=\\dfrac{(2+3i)(1-i)}{i^{15}}+\\sqrt{-16}$ en forma $a+bi$.",
      spec: { tipo: "complejo", esperado: C(-1, 9), estandar: true },
      pistas: ["$i^{15}=i^3=-i$ y $\\sqrt{-16}=4i$.", "$(2+3i)(1-i)=5+i$."],
      sol: ["(2+3i)(1-i)=2-2i+3i-3i^2=5+i", "\\dfrac{5+i}{-i}=\\dfrac{(5+i)\\,i}{-i\\cdot i}=\\dfrac{5i-1}{1}=-1+5i", "z=-1+5i+4i=-1+9i"] },
    { id: "8-2", g: "g8", enun: "Con el $z$ anterior, calcula $|z|$ (exacto o aproximado).",
      spec: { tipo: "real", esperado: Math.sqrt(82), aprox: true },
      pistas: ["$|z|=\\sqrt{(-1)^2+9^2}$."],
      sol: ["|z|=\\sqrt{1+81}=\\sqrt{82}\\approx9.055"] },
    { id: "8-3", g: "g8", enun: "Escribe, expandido, un polinomio de grado 3 con coeficientes enteros y ceros $2$ y $3i$.",
      spec: { tipo: "polinomio", esperado: X.evaluar("x^3-2x^2+9x-18", { variable: true }).poly, expandido: true },
      pistas: ["Si $3i$ es cero, $-3i$ también (coeficientes reales).", "$(x-3i)(x+3i)=x^2+9$."],
      sol: ["P(x)=(x-2)(x-3i)(x+3i)=(x-2)(x^2+9)", "=x^3-2x^2+9x-18"] },
    { id: "8-4", g: "g8", tipo: "opcion", enun: "Metacognición: «Un polinomio real de grado 5 puede tener exactamente 4 ceros no reales y 1 real, pero nunca exactamente 3 ceros no reales.» ¿Es correcto y por qué?",
      opciones: ["Correcto: los ceros no reales vienen en pares conjugados, así que su cantidad es par", "Incorrecto: puede tener 3 ceros no reales", "Correcto, pero solo porque el grado es impar", "Incorrecto: siempre tiene 5 ceros reales"], correcta: 0,
      retro: "Con coeficientes reales, cada cero no real trae a su conjugado: 0, 2 o 4 ceros no reales; 3 es imposible." },
    // Banco de autoevaluación
    { id: "q-1", g: "gq", quiz: true, tipo: "opcion", enun: "¿Cuánto vale $i^{50}$?", opciones: ["$-1$", "$1$", "$i$", "$-i$"], correcta: 0, retro: "$50=4\\cdot12+2$, entonces $i^{50}=i^2=-1$." },
    { id: "q-2", g: "gq", quiz: true, tipo: "opcion", enun: "En $z=6-7i$, ¿cuál es $\\operatorname{Im}(z)$?", opciones: ["$-7$", "$-7i$", "$7$", "$6$"], correcta: 0, retro: "La parte imaginaria es el coeficiente real de $i$: $-7$." },
    { id: "q-3", g: "gq", quiz: true, tipo: "opcion", enun: "Para $z=a+bi$, $z\\cdot\\bar z$ es igual a…", opciones: ["$a^2+b^2$", "$a^2-b^2$", "$(a+b)^2$", "$2a$"], correcta: 0, retro: "$(a+bi)(a-bi)=a^2-b^2i^2=a^2+b^2$." },
    { id: "q-4", g: "gq", quiz: true, tipo: "opcion", enun: "$\\sqrt{-4}\\cdot\\sqrt{-9}$ es igual a…", opciones: ["$-6$", "$6$", "$36$", "$6i$"], correcta: 0, retro: "$(2i)(3i)=6i^2=-6$." },
    { id: "q-5", g: "gq", quiz: true, tipo: "opcion", enun: "Un polinomio real tiene el cero $2-5i$. ¿Qué otro cero tiene necesariamente?", opciones: ["$2+5i$", "$-2+5i$", "$-2-5i$", "$5i$"], correcta: 0, retro: "Los ceros no reales vienen en pares conjugados." },
    { id: "q-6", g: "gq", quiz: true, tipo: "opcion", enun: "¿Cuál es la factorización irreducible en $\\mathbb R$ de $x^4-16$?", opciones: ["$(x-2)(x+2)(x^2+4)$", "$(x^2-4)(x^2+4)$", "$(x-2)^2(x+2)^2$", "$(x-4)(x+4)(x^2+1)$"], correcta: 0, retro: "$x^4-16=(x^2-4)(x^2+4)=(x-2)(x+2)(x^2+4)$; $x^2+4$ no tiene ceros reales." },
    { id: "q-7", g: "gq", quiz: true, tipo: "opcion", enun: "Un polinomio real de grado 5 NO puede tener exactamente… ceros no reales.", opciones: ["3", "0", "2", "4"], correcta: 0, retro: "El número de ceros no reales es par." },
    { id: "q-8", g: "gq", quiz: true, tipo: "opcion", enun: "¿Cuánto vale $|3-4i|$?", opciones: ["$5$", "$7$", "$1$", "$25$"], correcta: 0, retro: "$\\sqrt{9+16}=5$." },
    { id: "q-9", g: "gq", quiz: true, tipo: "opcion", enun: "En un circuito de corriente alterna, la parte imaginaria de una impedancia $Z=R+jX$ representa…", opciones: ["La reactancia", "La resistencia", "La potencia", "El voltaje"], correcta: 0, retro: "La resistencia es la parte real y la reactancia la parte imaginaria." },
    { id: "q-10", g: "gq", quiz: true, tipo: "opcion", enun: "¿Cuánto vale $\\dfrac{1}{i}$?", opciones: ["$-i$", "$i$", "$1$", "$-1$"], correcta: 0, retro: "$\\dfrac1i=\\dfrac{-i}{-i\\cdot i}=-i$." },
  ];

  // ---------- Ejemplos resueltos (paso a paso) ----------
  const EJEMPLOS = {
    ej1: [
      { t: "Convertimos cada raíz de un negativo a la forma $bi$ (primero la $i$, luego simplificamos).", m: "\\sqrt{-12}=i\\sqrt{12}=2\\sqrt3\\,i,\\qquad \\sqrt{-3}=\\sqrt3\\,i" },
      { t: "Multiplicamos las raíces. Recuerda que $i^2=-1$.", m: "(2\\sqrt3\\,i)(\\sqrt3\\,i)=2\\cdot3\\cdot i^2=-6" },
      { t: "Reducimos las potencias de $i$ con el residuo al dividir entre 4.", m: "27=4\\cdot6+3\\Rightarrow i^{27}=i^3=-i,\\qquad 10=4\\cdot2+2\\Rightarrow i^{10}=i^2=-1" },
      { t: "Sumamos en el numerador de la fracción.", m: "\\dfrac{i^{27}+i^{10}}{2-i}=\\dfrac{-1-i}{2-i}" },
      { t: "Racionalizamos: multiplicamos por el conjugado del denominador, $2+i$.", m: "\\dfrac{(-1-i)(2+i)}{(2-i)(2+i)}=\\dfrac{-2-i-2i-i^2}{4+1}=\\dfrac{-1-3i}{5}" },
      { t: "Sumamos con el primer término.", m: "E=-6+\\dfrac{-1-3i}{5}=\\dfrac{-31-3i}{5}=-\\dfrac{31}{5}-\\dfrac35\\,i" },
    ],
    ej2: [
      { t: "Comprobamos que $x=i$ es un cero de $P(x)=x^4-2x^3+6x^2-2x+5$.", m: "P(i)=1+2i-6-2i+5=0" },
      { t: "Los coeficientes son reales, así que $-i$ también es cero (ceros conjugados). Multiplicamos sus factores.", m: "(x-i)(x+i)=x^2-i^2=x^2+1" },
      { t: "Dividimos $P(x)$ entre $x^2+1$ (división larga). Primer término: $x^4\\div x^2=x^2$.", m: "x^2(x^2+1)=x^4+x^2\\quad\\Rightarrow\\quad -2x^3+5x^2-2x+5" },
      { t: "Segundo término: $-2x^3\\div x^2=-2x$.", m: "-2x(x^2+1)=-2x^3-2x\\quad\\Rightarrow\\quad 5x^2+5" },
      { t: "Tercer término: $5x^2\\div x^2=5$. El residuo es 0, así que la división es exacta.", m: "5(x^2+1)=5x^2+5\\quad\\Rightarrow\\quad Q(x)=x^2-2x+5" },
      { t: "Hallamos los ceros de $Q$ con la fórmula cuadrática.", m: "x=\\dfrac{2\\pm\\sqrt{4-20}}{2}=\\dfrac{2\\pm4i}{2}=1\\pm2i" },
      { t: "Los cuatro ceros y las factorizaciones.", m: "\\{\\,i,\\,-i,\\,1+2i,\\,1-2i\\,\\}" },
      { t: "Factorización completa sobre $\\mathbb C$:", m: "P(x)=(x-i)(x+i)\\big(x-(1+2i)\\big)\\big(x-(1-2i)\\big)" },
      { t: "Factorización irreducible sobre $\\mathbb R$ (agrupamos cada par conjugado):", m: "P(x)=(x^2+1)(x^2-2x+5)" },
    ],
  };

  // ---------- Componente: ejercicios ----------
  const quizEstado = { respondidas: 0, aciertos: 0, total: 0 };

  function crearEj(ej, num) {
    const d = document.createElement("div");
    d.className = "ejercicio";
    const cab = document.createElement("p");
    cab.className = "enun";
    cab.innerHTML = "<strong>" + (ej.quiz ? "Pregunta " : "Ejercicio ") + num + ".</strong> " + ej.enun;
    d.appendChild(cab);
    const retro = document.createElement("div");
    retro.className = "retro";
    retro.setAttribute("aria-live", "polite");

    if (ej.tipo === "opcion") {
      const ops = X.shuffle(ej.opciones.map((t, i) => ({ t, ok: i === ej.correcta })));
      const caja = document.createElement("div");
      caja.className = "opciones";
      ops.forEach((o) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "opcion";
        b.innerHTML = o.t;
        b.addEventListener("click", () => {
          if (b.disabled) return;
          if (o.ok) {
            b.classList.add("ok");
            caja.querySelectorAll("button").forEach((x) => (x.disabled = true));
            retro.innerHTML = "<strong>¡Correcto!</strong> " + ej.retro;
            if (ej.quiz) { quizEstado.respondidas++; if (!d.dataset.fallo) quizEstado.aciertos++; mostrarFinalQuiz(); }
            hechos[ej.id] = 1; guardar(); actualizarProgreso();
          } else {
            b.classList.add("mal");
            b.disabled = true;
            if (ej.quiz) {
              caja.querySelectorAll("button").forEach((x) => (x.disabled = true));
              caja.querySelectorAll("button").forEach((x, i) => { if (ops[i].ok) x.classList.add("ok"); });
              d.dataset.fallo = "1";
              retro.innerHTML = "<strong>No es esa.</strong> " + ej.retro;
              quizEstado.respondidas++; mostrarFinalQuiz();
            } else {
              retro.textContent = "Todavía no. Vuelve a leer el enunciado e inténtalo con otra opción.";
            }
          }
          mate(d);
        });
        caja.appendChild(b);
      });
      d.appendChild(caja);
      d.appendChild(retro);
      if (hechos[ej.id] && !ej.quiz) d.classList.add("resuelto");
      return d;
    }

    const fila = document.createElement("div");
    fila.className = "respuesta";
    const inp = document.createElement("input");
    inp.type = "text";
    inp.autocomplete = "off";
    inp.spellcheck = false;
    inp.setAttribute("aria-label", "Tu respuesta al ejercicio " + num);
    inp.placeholder = ej.spec.tipo === "polinomio" ? "Ej.: x^3 - 2x^2 + 9x - 18" : "Ej.: -1 + 9i";
    const bc = document.createElement("button");
    bc.type = "button";
    bc.className = "accion";
    bc.textContent = "Comprobar";
    const bp = document.createElement("button");
    bp.type = "button";
    bp.className = "sec";
    bp.textContent = "Pista";
    fila.append(inp, bc, bp);
    d.appendChild(fila);
    d.appendChild(retro);

    const det = document.createElement("details");
    det.innerHTML = "<summary>Ver solución</summary><div class=\"sol\">" + bloque(ej.sol) + "</div>";
    d.appendChild(det);

    let nPista = 0;
    bp.addEventListener("click", () => {
      const p = ej.pistas[Math.min(nPista, ej.pistas.length - 1)];
      retro.className = "retro pista-msg";
      retro.innerHTML = "<strong>Pista " + (Math.min(nPista, ej.pistas.length - 1) + 1) + ":</strong> " + p;
      nPista++;
      mate(retro);
    });
    function comprobar() {
      const r = X.revisar(ej.spec, inp.value);
      retro.className = "retro " + (r.estado === "ok" ? "ok" : r.estado === "mal" ? "mal" : "aviso");
      retro.innerHTML = (r.estado === "ok" ? "✔ " : r.estado === "mal" ? "✘ " : "ℹ ") + r.msg;
      if (r.estado === "ok") {
        d.classList.add("resuelto");
        hechos[ej.id] = 1; guardar(); actualizarProgreso();
        det.open = true;
      }
      mate(d);
    }
    bc.addEventListener("click", comprobar);
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") comprobar(); });
    if (hechos[ej.id]) d.classList.add("resuelto");
    return d;
  }

  function mostrarFinalQuiz() {
    const el = $("quiz-final");
    if (!el) return;
    if (quizEstado.respondidas >= quizEstado.total) {
      const p = Math.round((quizEstado.aciertos / quizEstado.total) * 100);
      el.hidden = false;
      el.textContent = "Resultado: " + quizEstado.aciertos + " de " + quizEstado.total + " (" + p + "%). " +
        (p >= 80 ? "¡Excelente dominio del tema!" : p >= 60 ? "Buen avance: repasa los módulos donde fallaste." : "Repasa los módulos 1 al 5 y vuelve a intentarlo (recarga la página para otro orden).");
    }
  }

  function montarEjercicios() {
    document.querySelectorAll("[data-grupo]").forEach((cont) => {
      const g = cont.dataset.grupo;
      let lista = EJ.filter((e) => e.g === g);
      grupos[g] = lista.map((e) => e.id);
      if (g === "gq") { lista = X.shuffle(lista); quizEstado.total = lista.length; }
      lista.forEach((e, i) => cont.appendChild(crearEj(e, i + 1)));
    });
  }

  // ---------- Componente: ejemplos paso a paso ----------
  function montarEjemplos() {
    document.querySelectorAll("[data-ejemplo]").forEach((cont) => {
      const pasos = EJEMPLOS[cont.dataset.ejemplo];
      const lista = document.createElement("div");
      lista.className = "ejemplo-pasos";
      const barra = document.createElement("div");
      barra.className = "ejemplo-ctl";
      const sig = document.createElement("button");
      sig.type = "button"; sig.className = "accion";
      const todo = document.createElement("button");
      todo.type = "button"; todo.className = "sec"; todo.textContent = "Mostrar todo";
      const reiniciar = document.createElement("button");
      reiniciar.type = "button"; reiniciar.className = "sec"; reiniciar.textContent = "Reiniciar";
      barra.append(sig, todo, reiniciar);
      cont.append(lista, barra);
      let n = 0;
      function pintar() {
        sig.textContent = n === 0 ? "Empezar: ver el paso 1" : "Siguiente paso (" + Math.min(n + 1, pasos.length) + " de " + pasos.length + ")";
        sig.disabled = n >= pasos.length;
        if (n >= pasos.length) sig.textContent = "Ejemplo completo ✔";
      }
      function agregar() {
        const p = pasos[n];
        const div = document.createElement("div");
        div.className = "paso-ej";
        div.innerHTML = "<p><strong>Paso " + (n + 1) + ".</strong> " + p.t + "</p><div class=\"paso\">$$" + p.m + "$$</div>";
        lista.appendChild(div);
        mate(div);
        n++;
        pintar();
      }
      sig.addEventListener("click", () => { if (n < pasos.length) agregar(); });
      todo.addEventListener("click", () => { while (n < pasos.length) agregar(); });
      reiniciar.addEventListener("click", () => { lista.innerHTML = ""; n = 0; pintar(); });
      pintar();
    });
  }

  // ---------- Herramienta M1: raíces de negativos ----------
  function herramientaRadical() {
    const inp = $("rad-n"), out = $("rad-res");
    function pintar() {
      const n = Number(inp.value);
      if (!Number.isInteger(n) || n < 1 || n > 100000) { out.textContent = "Escribe un entero entre 1 y 100000."; return; }
      const { k, m } = X.simplRad(n);
      let l = ["\\sqrt{-" + n + "}=i\\sqrt{" + n + "}"];
      if (m === 1) l.push("=" + k + "\\,i");
      else if (k > 1) l.push("=i\\sqrt{" + k * k + "\\cdot" + m + "}=" + k + "\\sqrt{" + m + "}\\,i");
      out.innerHTML = bloque(l);
      mate(out);
    }
    inp.addEventListener("input", pintar);
    pintar();
  }

  // ---------- Herramienta M1: potencias de i ----------
  function herramientaPotencia() {
    const inp = $("exp"), out = $("res-potencia");
    function pintar() {
      const n = Number(inp.value);
      if (!Number.isInteger(n) || Math.abs(n) > 1e9) { out.textContent = "Escribe un entero (hasta 1 000 000 000)."; return; }
      const q = Math.floor(n / 4), r = ((n % 4) + 4) % 4;
      const res = X.fmtTex(X.powI(n));
      out.innerHTML = bloque([
        n + "=4\\cdot(" + q + ")+" + r,
        "i^{" + n + "}=(i^4)^{" + q + "}\\cdot i^{" + r + "}=1\\cdot i^{" + r + "}=" + res,
      ]);
      mate(out);
    }
    inp.addEventListener("input", pintar);
    pintar();
  }

  // ---------- Herramienta M2: plano de Argand ----------
  const LIM = 6;
  function herramientaPlano() {
    const cv = $("plano"), ctx = cv.getContext("2d");
    const ids = ["a1", "b1", "a2", "b2"];
    const W = cv.width, s = W / (2 * LIM), o = W / 2;
    const px = (x, y) => [o + x * s, o - y * s];

    function flecha(z, color, dash, etiqueta) {
      const [x0, y0] = px(0, 0), [x1, y1] = px(z.re, z.im);
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.5;
      ctx.setLineDash(dash || []);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.setLineDash([]);
      const ang = Math.atan2(y1 - y0, x1 - x0);
      if (Math.hypot(x1 - x0, y1 - y0) > 3) {
        ctx.beginPath(); ctx.moveTo(x1, y1);
        ctx.lineTo(x1 - 10 * Math.cos(ang - 0.4), y1 - 10 * Math.sin(ang - 0.4));
        ctx.lineTo(x1 - 10 * Math.cos(ang + 0.4), y1 - 10 * Math.sin(ang + 0.4));
        ctx.closePath(); ctx.fill();
      }
      ctx.font = "14px system-ui, sans-serif";
      ctx.fillText(etiqueta, x1 + 8, y1 - 8);
    }

    function dibujar() {
      ctx.clearRect(0, 0, W, W);
      ctx.lineWidth = 1; ctx.font = "11px system-ui, sans-serif";
      for (let k = -LIM; k <= LIM; k++) {
        ctx.strokeStyle = k === 0 ? "#444" : "#e3e7eb";
        ctx.lineWidth = k === 0 ? 1.5 : 1;
        ctx.beginPath(); ctx.moveTo(o + k * s, 0); ctx.lineTo(o + k * s, W); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, o - k * s); ctx.lineTo(W, o - k * s); ctx.stroke();
        if (k !== 0) {
          ctx.fillStyle = "#6e7781";
          ctx.fillText(String(k), o + k * s - 3, o + 14);
          ctx.fillText(k + "i", o + 4, o - k * s + 4);
        }
      }
      ctx.fillStyle = "#444"; ctx.font = "13px system-ui, sans-serif";
      ctx.fillText("Re", W - 24, o - 6); ctx.fillText("Im", o + 6, 14);
      const z1 = leer(0), z2 = leer(1);
      flecha(X.conj(z1), "#8c959f", [6, 5], "z̄₁");
      flecha(X.add(z1, z2), "#1f4fd8", [], "z₁+z₂");
      flecha(z1, "#d62728", [], "z₁");
      flecha(z2, "#2ca02c", [], "z₂");
    }
    function leer(k) {
      const a = Number($(ids[2 * k]).value), b = Number($(ids[2 * k + 1]).value);
      return C(Number.isFinite(a) ? a : 0, Number.isFinite(b) ? b : 0);
    }
    function tabla() {
      const z1 = leer(0), z2 = leer(1);
      const fila = (n, v) => "<tr><th>" + n + "</th><td>" + v + "</td></tr>";
      const dv = X.div(z1, z2);
      $("tabla-ops").innerHTML =
        fila("Re(z₁), Im(z₁)", X.num(z1.re) + " , " + X.num(z1.im)) +
        fila("Conjugado z̄₁", X.fmt(X.conj(z1))) +
        fila("z₁·z̄₁ = a² + b²", X.num(z1.re * z1.re + z1.im * z1.im)) +
        fila("Módulo |z₁|", X.fmtModulus(z1)) +
        fila("z₁ + z₂", X.fmt(X.add(z1, z2))) +
        fila("z₁ − z₂", X.fmt(X.sub(z1, z2))) +
        fila("z₁ · z₂", X.fmt(X.mul(z1, z2))) +
        fila("z₁ / z₂", dv ? X.fmt(dv) : "no definido (z₂ = 0)");
    }
    function todo() { dibujar(); tabla(); }
    ids.forEach((id) => $(id).addEventListener("input", todo));
    cv.addEventListener("pointerdown", (e) => {
      const r = cv.getBoundingClientRect(), k = W / r.width;
      const x = ((e.clientX - r.left) * k - o) / s, y = (o - (e.clientY - r.top) * k) / s;
      const red = (v) => Math.max(-LIM, Math.min(LIM, Math.round(v * 2) / 2));
      $("a1").value = red(x); $("b1").value = red(y);
      todo();
    });
    todo();
  }

  // ---------- Herramienta M3: calculadora con pasos ----------
  function herramientaOperaciones() {
    const a = $("op-z1"), b = $("op-z2"), sel = $("op-op"), out = $("op-res");
    function pintar() {
      const z1 = X.evalComplejo(a.value), z2 = X.evalComplejo(b.value);
      const op = sel.value;
      if (!z1 || (!z2 && ["suma", "resta", "mult", "div"].includes(op))) {
        out.innerHTML = "<span class=\"aviso\">Escribe números válidos, por ejemplo 2-3i o 1/2+i.</span>";
        return;
      }
      if (op === "div" && X.abs(z2) < 1e-12) { out.innerHTML = "<span class=\"aviso\">No se puede dividir entre 0.</span>"; return; }
      out.innerHTML = bloque(X.pasos(op, z1, z2));
      mate(out);
    }
    [a, b, sel].forEach((e) => e.addEventListener("input", pintar));
    $("op-azar").addEventListener("click", () => {
      const r = () => Math.floor(Math.random() * 9) - 4;
      const f = (re, im) => (re === 0 && im === 0 ? "1" : X.fmt(C(re, im)).replace(/−/g, "-"));
      a.value = f(r(), r() || 1); b.value = f(r() || 1, r() || 1);
      pintar();
    });
    pintar();
  }

  // ---------- Herramienta M4: impedancias ----------
  function herramientaImpedancia() {
    const a = $("imp-1"), b = $("imp-2"), out = $("imp-res");
    function pintar() {
      const z1 = X.evalComplejo(a.value), z2 = X.evalComplejo(b.value);
      if (!z1 || !z2) { out.innerHTML = "<span class=\"aviso\">Escribe impedancias válidas, por ejemplo 2-3i.</span>"; return; }
      const r = X.pasosParalelo(z1, z2);
      if (!r.eq) { out.innerHTML = "<span class=\"aviso\">La suma de impedancias es 0: no se puede calcular.</span>"; return; }
      let h = "<p class=\"leyenda\">$Z_{eq}=\\dfrac{Z_1Z_2}{Z_1+Z_2}$</p>";
      r.bloques.forEach((bl, i) => { h += "<details" + (i === 2 ? " open" : "") + "><summary>" + bl.titulo + "</summary>" + bloque(bl.tex) + "</details>"; });
      h += "<p class=\"resultado\">$Z_{eq}=" + X.fmtTex(r.eq) + "\\ \\Omega$ &nbsp; y &nbsp; $|Z_{eq}|=" + X.moduloExacto(r.eq).tex + (X.moduloExacto(r.eq).entero ? "" : "\\approx" + X.moduloExacto(r.eq).aprox) + "\\ \\Omega$</p>";
      out.innerHTML = h;
      mate(out);
    }
    [a, b].forEach((e) => e.addEventListener("input", pintar));
    pintar();
  }

  // ---------- Herramienta M5: explorador de polinomios ----------
  function herramientaPolinomio() {
    const inp = $("poly-in"), out = $("poly-res");
    function pintar() {
      const r = X.evaluar(inp.value, { variable: true });
      if (!r.ok) { out.innerHTML = "<p class=\"aviso\">No pude interpretar el polinomio. Ejemplo: x^4 - 2x^3 + 6x^2 - 2x + 5</p>"; return; }
      const gr = r.poly.length - 1;
      if (gr < 1) { out.innerHTML = "<p class=\"aviso\">Escribe un polinomio de grado 1 o mayor.</p>"; return; }
      if (gr > 8) { out.innerHTML = "<p class=\"aviso\">Usa grado 8 o menor.</p>"; return; }
      const f = X.factorizar(r.poly);
      let h = "<p><strong>Polinomio:</strong> <span class=\"mono\"></span></p>";
      h += "<p>Grado $n=" + gr + "$, así que tiene exactamente <strong>" + gr + "</strong> ceros complejos contando multiplicidad.</p>";
      h += "<table><thead><tr><th>Cero</th><th>Multiplicidad</th><th>Tipo</th></tr></thead><tbody>";
      f.grupos.forEach((g) => {
        const tipo = Math.abs(g.raiz.im) < 1e-9 ? "real" : "no real";
        h += "<tr><td>$" + X.fmtTex(g.raiz) + "$</td><td>" + g.mult + "</td><td>" + tipo + "</td></tr>";
      });
      h += "</tbody></table>";
      h += "<p><strong>Factorización completa sobre ℂ:</strong></p><p class=\"resultado\" data-f=\"c\"></p>";
      if (f.reales) {
        h += "<p><strong>Factorización irreducible sobre ℝ:</strong></p><p class=\"resultado\" data-f=\"r\"></p>";
        h += "<p>Coeficientes reales: los ceros no reales aparecen en pares conjugados " + (f.pares ? "✔" : "(verifica)") + ". Cantidad de ceros no reales: " + f.noReales + " (siempre par).</p>";
      } else {
        h += "<p class=\"aviso\">Este polinomio tiene coeficientes no reales: el teorema de ceros conjugados <strong>no</strong> aplica, y los ceros no tienen por qué venir en pares conjugados.</p>";
      }
      out.innerHTML = h;
      out.querySelector(".mono").textContent = X.fmtPoly(r.poly);
      out.querySelector("[data-f=c]").textContent = "P(x) = " + f.textoC;
      if (f.reales) out.querySelector("[data-f=r]").textContent = "P(x) = " + f.textoR;
      mate(out);
    }
    inp.addEventListener("input", pintar);
    document.querySelectorAll("[data-poly]").forEach((b) => b.addEventListener("click", () => { inp.value = b.dataset.poly; pintar(); }));
    pintar();
  }

  // ---------- Herramienta M6: verificar un cero ----------
  function herramientaCero() {
    const p = $("ver-p"), c = $("ver-c"), out = $("ver-res");
    function pintar() {
      const r = X.evaluar(p.value, { variable: true });
      const z = X.evalComplejo(c.value);
      if (!r.ok || r.poly.length < 2 || !z) { out.innerHTML = "<span class=\"aviso\">Escribe un polinomio en $x$ y un número complejo, por ejemplo i o 1+2i.</span>"; mate(out); return; }
      const v = X.pEval(r.poly, z);
      const cero = X.abs(v) < 1e-9;
      let h = "<p class=\"resultado\">$P(" + X.fmtTex(z) + ")=" + X.fmtTex(cero ? C(0) : v) + "$ " + (cero ? "→ ✔ <strong>es un cero</strong>" : "→ ✘ no es un cero") + "</p>";
      if (cero && X.pEsReal(r.poly) && Math.abs(z.im) > 1e-9) h += "<p>Como $P$ tiene coeficientes reales, su conjugado $" + X.fmtTex(X.conj(z)) + "$ también es cero.</p>";
      out.innerHTML = h;
      mate(out);
    }
    [p, c].forEach((e) => e.addEventListener("input", pintar));
    pintar();
  }

  // ---------- Herramienta M7: producto de raíces negativas ----------
  function herramientaCuidado() {
    const a = $("neg-a"), b = $("neg-b"), out = $("neg-res");
    function pintar() {
      const x = Number(a.value), y = Number(b.value);
      if (!(x > 0) || !(y > 0)) { out.textContent = "Escribe números positivos."; return; }
      const sx = X.simplRad(x), sy = X.simplRad(y);
      const txt = (n, s) => (Number.isInteger(Math.sqrt(n)) ? String(Math.sqrt(n)) : s.k === 1 ? "\\sqrt{" + s.m + "}" : s.k + "\\sqrt{" + s.m + "}");
      const prod = x * y;
      const ps = X.simplRad(prod);
      const raiz = (n, s) => (s.m === 1 ? String(s.k) : (s.k === 1 ? "" : s.k) + "\\sqrt{" + s.m + "}");
      out.innerHTML = bloque([
        "\\textbf{Correcto: }\\sqrt{-" + x + "}\\cdot\\sqrt{-" + y + "}=(" + raiz(x, sx) + "\\,i)(" + raiz(y, sy) + "\\,i)=" + "-" + raiz(prod, ps),
        "\\textbf{Error común: }\\sqrt{-" + x + "}\\cdot\\sqrt{-" + y + "}\\ne\\sqrt{(-" + x + ")(-" + y + ")}=\\sqrt{" + prod + "}",
      ]);
      mate(out);
    }
    [a, b].forEach((e) => e.addEventListener("input", pintar));
    pintar();
  }

  // ---------- Reiniciar ----------
  function reiniciar() {
    $("reiniciar").addEventListener("click", () => {
      if (confirm("¿Borrar tu progreso guardado en este navegador?")) {
        hechos = {}; guardar(); location.reload();
      }
    });
  }

  function iniciar() {
    montarEjercicios();
    montarEjemplos();
    herramientaRadical();
    herramientaPotencia();
    herramientaPlano();
    herramientaOperaciones();
    herramientaImpedancia();
    herramientaPolinomio();
    herramientaCero();
    herramientaCuidado();
    reiniciar();
    actualizarProgreso();
    mate(document.body);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
