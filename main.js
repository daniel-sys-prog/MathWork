/* ============================================================
   MAIN.JS
   Lógica de renderização matemática, gráficos interativos
   (Plotly), tipografia matemática (KaTeX) e interações de
   interface da página.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     0. PALETA — espelha as variáveis definidas em css/style.css
  ---------------------------------------------------------- */
  var C = {
    curve:  '#2868c6',
    curve2: '#1d4f9e',
    asymp:  '#cba2ea',
    focus:  '#91d2f4',
    vertex: '#8b7fd1',
    axis:   'rgba(234,242,251,0.28)',
    grid:   'rgba(145,210,244,0.06)',
    ink:    '#eaf2fb',
    inkDim: '#93a8c4',
    center: '#eaf2fb'
  };

  var PLOT_CONFIG = {
    displayModeBar: false,
    scrollZoom: true,
    responsive: true,
    doubleClick: 'reset'
  };

  /* ----------------------------------------------------------
     1. MATEMÁTICA DA HIPÉRBOLE
  ---------------------------------------------------------- */

  // Ramos da hipérbole via parametrização hiperbólica (cosh/sinh).
  // orientation 'h' -> eixo real paralelo a x ; 'v' -> eixo real paralelo a y
  function hyperbolaBranches(a, b, h, k, orientation, tMax, N) {
    tMax = tMax || 3;
    N = N || 220;
    var xA = [], yA = [], xB = [], yB = [];
    for (var i = 0; i <= N; i++) {
      var t = -tMax + (2 * tMax * i) / N;
      var ch = Math.cosh(t), sh = Math.sinh(t);
      if (orientation === 'h') {
        xA.push(h + a * ch); yA.push(k + b * sh);
        xB.push(h - a * ch); yB.push(k + b * sh);
      } else {
        yA.push(k + a * ch); xA.push(h + b * sh);
        yB.push(k - a * ch); xB.push(h + b * sh);
      }
    }
    return { xA: xA, yA: yA, xB: xB, yB: yB };
  }

  function asymptoteTraces(a, b, h, k, orientation, span) {
    span = span || (Math.max(a, b) * 3.4);
    var t1, t2;
    if (orientation === 'h') {
      t1 = { x: [h - span, h + span], y: [k - (b / a) * span, k + (b / a) * span] };
      t2 = { x: [h - span, h + span], y: [k + (b / a) * span, k - (b / a) * span] };
    } else {
      t1 = { x: [h - (b / a) * span, h + (b / a) * span], y: [k - span, k + span] };
      t2 = { x: [h + (b / a) * span, h - (b / a) * span], y: [k - span, k + span] };
    }
    return [
      { x: t1.x, y: t1.y, mode: 'lines', line: { color: C.asymp, width: 1.5, dash: 'dot' }, hoverinfo: 'skip', showlegend: false },
      { x: t2.x, y: t2.y, mode: 'lines', line: { color: C.asymp, width: 1.5, dash: 'dot' }, hoverinfo: 'skip', showlegend: false }
    ];
  }

  function focalPoints(a, b, h, k, orientation) {
    var c = Math.sqrt(a * a + b * b);
    if (orientation === 'h') return { f1: [h - c, k], f2: [h + c, k], v1: [h - a, k], v2: [h + a, k], c: c };
    return { f1: [h, k - c], f2: [h, k + c], v1: [h, k - a], v2: [h, k + a], c: c };
  }

  function curveTraces(a, b, h, k, orientation, opts) {
    opts = opts || {};
    var br = hyperbolaBranches(a, b, h, k, orientation, opts.tMax, opts.N);
    var hover = 'x = %{x:.2f} · y = %{y:.2f}<extra></extra>';
    return [
      { x: br.xA, y: br.yA, mode: 'lines', line: { color: C.curve, width: 3 }, hovertemplate: hover, name: 'ramo' },
      { x: br.xB, y: br.yB, mode: 'lines', line: { color: C.curve, width: 3 }, hovertemplate: hover, name: 'ramo', showlegend: false }
    ];
  }

  function focalTraces(a, b, h, k, orientation, opts) {
    opts = opts || {};
    var fp = focalPoints(a, b, h, k, orientation);
    var traces = [];
    if (opts.foci !== false) {
      traces.push({
        x: [fp.f1[0], fp.f2[0]], y: [fp.f1[1], fp.f2[1]], mode: 'markers',
        marker: { color: C.focus, size: 10, symbol: 'diamond', line: { color: '#0a0f17', width: 1 } },
        hovertemplate: 'Foco (%{x:.2f}, %{y:.2f})<extra></extra>', showlegend: false
      });
    }
    if (opts.vertices !== false) {
      traces.push({
        x: [fp.v1[0], fp.v2[0]], y: [fp.v1[1], fp.v2[1]], mode: 'markers',
        marker: { color: C.vertex, size: 8, line: { color: '#0a0f17', width: 1 } },
        hovertemplate: 'Vértice (%{x:.2f}, %{y:.2f})<extra></extra>', showlegend: false
      });
    }
    if (opts.center !== false) {
      traces.push({
        x: [h], y: [k], mode: 'markers', marker: { color: C.center, size: 6, symbol: 'cross' },
        hovertemplate: 'Centro (%{x:.2f}, %{y:.2f})<extra></extra>', showlegend: false
      });
    }
    return traces;
  }

  function baseLayout(extra) {
    var lay = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: { l: 36, r: 18, t: 18, b: 30 },
      font: { family: 'JetBrains Mono, monospace', color: C.inkDim, size: 11 },
      hoverlabel: { bgcolor: '#0e1a2e', bordercolor: 'rgba(145,210,244,.25)', font: { family: 'JetBrains Mono, monospace', color: C.ink, size: 11 } },
      showlegend: false,
      dragmode: 'pan'
    };
    return Object.assign(lay, extra || {});
  }

  function axisDef(opts) {
    opts = opts || {};
    return Object.assign({
      zeroline: true, zerolinecolor: C.axis, zerolinewidth: 1,
      gridcolor: C.grid, gridwidth: 1,
      showline: false, tickfont: { size: 10 },
      fixedrange: false
    }, opts);
  }

  /* ----------------------------------------------------------
     2. KATEX — equações estáticas e dinâmicas
  ---------------------------------------------------------- */
  function kx(id, latex, displayMode) {
    var el = document.getElementById(id);
    if (!el || typeof katex === 'undefined') return;
    try {
      katex.render(latex, el, { throwOnError: false, displayMode: displayMode !== false });
    } catch (e) { el.textContent = latex; }
  }

  // formata (x - h)^2 lidando com h = 0 e sinais
  function sqTerm(varName, coord, decimals) {
    decimals = decimals === undefined ? 1 : decimals;
    var v = Math.round(coord * Math.pow(10, decimals)) / Math.pow(10, decimals);
    if (Math.abs(v) < 1e-9) return varName + '^2';
    var sign = v > 0 ? '-' : '+';
    return '(' + varName + sign + Math.abs(v) + ')^2';
  }

  function numFmt(v, decimals) {
    decimals = decimals === undefined ? 2 : decimals;
    var f = Math.round(v * Math.pow(10, decimals)) / Math.pow(10, decimals);
    return (f % 1 === 0) ? String(f) : f.toFixed(decimals).replace(/0+$/, '').replace(/\.$/, '');
  }

  function hyperbolaLatex(a, b, h, k, orientation) {
    var a2 = numFmt(a * a), b2 = numFmt(b * b);
    var xt = sqTerm('x', h), yt = sqTerm('y', k);
    if (orientation === 'h') {
      return '\\dfrac{' + xt + '}{' + a2 + '} - \\dfrac{' + yt + '}{' + b2 + '} = 1';
    }
    return '\\dfrac{' + yt + '}{' + a2 + '} - \\dfrac{' + xt + '}{' + b2 + '} = 1';
  }

  function initStaticKatex() {
    kx('eq-def', '|d(P,F_1) - d(P,F_2)| = 2a', true);
    kx('eq-geo', '\\big| \\, d(P,F_1) - d(P,F_2) \\, \\big| = 2a', true);
    kx('eq-rel', 'c^2 = a^2 + b^2', true);
    kx('eq-elipse', 'c^2 = a^2 - b^2', true);
    kx('eq-hip-rel', 'c^2 = a^2 + b^2', true);
    kx('eq-ex', '\\dfrac{x^2}{16} - \\dfrac{y^2}{9} = 1', true);
    kx('eq-ex1', 'a^2 = 16 \\;\\Rightarrow\\; a = 4', true);
    kx('eq-ex2', 'b^2 = 9 \\;\\Rightarrow\\; b = 3', true);
    kx('eq-ex3', 'c^2 = 16 + 9 = 25 \\;\\Rightarrow\\; c = 5', true);
    kx('eq-ex4', 'y = \\pm\\dfrac{b}{a}x = \\pm\\dfrac{3}{4}x', true);
    kx('eq-sum-def', '|d(P,F_1)-d(P,F_2)|=2a', true);
    kx('eq-sum-h', '\\dfrac{x^2}{a^2} - \\dfrac{y^2}{b^2} = 1', true);
    kx('eq-sum-v', '\\dfrac{y^2}{a^2} - \\dfrac{x^2}{b^2} = 1', true);
    kx('eq-sum-rel', 'c^2 = a^2 + b^2', true);
  }

  /* ----------------------------------------------------------
     3. GRÁFICOS DAS SEÇÕES PRINCIPAIS
  ---------------------------------------------------------- */

  function attachLiveCoords(divId) {
    var div = document.getElementById(divId);
    if (!div) return;
    var pill = div.parentElement.querySelector('.coord-pill');
    if (!pill) return;
    div.on('plotly_hover', function (ev) {
      var pt = ev.points && ev.points[0];
      if (!pt) return;
      pill.textContent = 'x = ' + pt.x.toFixed(2) + '  ·  y = ' + pt.y.toFixed(2);
      pill.classList.add('is-visible');
    });
    div.on('plotly_unhover', function () { pill.classList.remove('is-visible'); });
  }

  function plotHero() {
    var a = 3, b = 2;
    var traces = curveTraces(a, b, 0, 0, 'h').concat(
      asymptoteTraces(a, b, 0, 0, 'h', 9),
      focalTraces(a, b, 0, 0, 'h')
    );
    var lay = baseLayout({
      xaxis: axisDef({ range: [-9, 9], dtick: 3 }),
      yaxis: axisDef({ range: [-6, 6], dtick: 2, scaleanchor: 'x', scaleratio: 1 }),
      margin: { l: 28, r: 18, t: 18, b: 26 }
    });
    Plotly.newPlot('plotHero', traces, lay, PLOT_CONFIG);
  }

  function plotDefinicao() {
    var a = 3, b = 2;
    var traces = curveTraces(a, b, 0, 0, 'h', { tMax: 2.2 });
    var lay = baseLayout({
      xaxis: axisDef({ range: [-9, 9], dtick: 2 }),
      yaxis: axisDef({ range: [-6, 6], dtick: 2, scaleanchor: 'x', scaleratio: 1 })
    });
    Plotly.newPlot('plotDefinicao', traces, lay, PLOT_CONFIG);
    attachLiveCoords('plotDefinicao');
  }

  function plotGeometria() {
    var a = 3, b = 4, c = 5; // 3-4-5 para leitura simples
    var traces = curveTraces(a, b, 0, 0, 'h').concat(
      focalTraces(a, b, 0, 0, 'h', { vertices: false })
    );
    var lay = baseLayout({
      xaxis: axisDef({ range: [-10, 10], dtick: 2 }),
      yaxis: axisDef({ range: [-7.5, 7.5], dtick: 2, scaleanchor: 'x', scaleratio: 1 })
    });
    Plotly.newPlot('plotGeometria', traces, lay, PLOT_CONFIG);
    attachLiveCoords('plotGeometria');

    var div = document.getElementById('plotGeometria');
    var d1El = document.getElementById('vd1'), d2El = document.getElementById('vd2'), diffEl = document.getElementById('vdiff');
    div.on('plotly_hover', function (ev) {
      var pt = ev.points && ev.points[0];
      if (!pt || pt.curveNumber > 1) return;
      var d1 = Math.hypot(pt.x - (-c), pt.y - 0);
      var d2 = Math.hypot(pt.x - c, pt.y - 0);
      if (d1El) d1El.textContent = d1.toFixed(2);
      if (d2El) d2El.textContent = d2.toFixed(2);
      if (diffEl) diffEl.textContent = Math.abs(d1 - d2).toFixed(2);
    });
  }

  function anatomyAnnotations(a, b, c) {
    return [
      { x: a, y: -0.7, text: 'A₂', showarrow: false, font: { color: C.vertex, size: 12, family: 'JetBrains Mono, monospace' } },
      { x: -a, y: -0.7, text: 'A₁', showarrow: false, font: { color: C.vertex, size: 12, family: 'JetBrains Mono, monospace' } },
      { x: c, y: 0.8, text: 'F₂', showarrow: false, font: { color: C.focus, size: 12, family: 'JetBrains Mono, monospace' } },
      { x: -c, y: 0.8, text: 'F₁', showarrow: false, font: { color: C.focus, size: 12, family: 'JetBrains Mono, monospace' } },
      { x: 0.55, y: 0.55, text: 'O', showarrow: false, font: { color: C.ink, size: 12, family: 'JetBrains Mono, monospace' } }
    ];
  }

  function plotAnatomia(divId) {
    divId = divId || 'plotAnatomia';
    var a = 4, b = 3, c = 5;
    var traces = curveTraces(a, b, 0, 0, 'h').concat(
      asymptoteTraces(a, b, 0, 0, 'h', 10),
      [
        { x: [-a, a], y: [0, 0], mode: 'lines', line: { color: 'rgba(234,242,251,.4)', width: 1.5, dash: 'dot' }, hoverinfo: 'skip', showlegend: false },
        { x: [0, 0], y: [-b, b], mode: 'lines', line: { color: 'rgba(203,162,234,.55)', width: 1.5, dash: 'dot' }, hoverinfo: 'skip', showlegend: false },
        { x: [-a, -a, a, a, -a], y: [-b, b, b, -b, -b], mode: 'lines', line: { color: 'rgba(234,242,251,.08)', width: 1 }, hoverinfo: 'skip', showlegend: false }
      ],
      focalTraces(a, b, 0, 0, 'h')
    );
    var lay = baseLayout({
      xaxis: axisDef({ range: [-11, 11], dtick: 2 }),
      yaxis: axisDef({ range: [-7.5, 7.5], dtick: 2, scaleanchor: 'x', scaleratio: 1 }),
      annotations: anatomyAnnotations(a, b, c)
    });
    Plotly.newPlot(divId, traces, lay, PLOT_CONFIG);
    attachLiveCoords(divId);
  }

  /* --- seção equações: alternância + sliders --- */
  var eqState = { orientation: 'h', a: 3, b: 2 };

  function refreshEquacoes() {
    var a = eqState.a, b = eqState.b, c = Math.sqrt(a * a + b * b);
    var traces = curveTraces(a, b, 0, 0, eqState.orientation).concat(
      asymptoteTraces(a, b, 0, 0, eqState.orientation, 10),
      focalTraces(a, b, 0, 0, eqState.orientation)
    );
    var div = document.getElementById('plotEquacoes');
    Plotly.react('plotEquacoes', traces, div.layout, PLOT_CONFIG);

    kx('eqOrient', hyperbolaLatex(a, b, 0, 0, eqState.orientation), true);
    var sub = document.getElementById('eqSub');
    if (sub) {
      sub.innerHTML = eqState.orientation === 'h'
        ? 'Focos sobre o eixo <strong>x</strong> — ramos abertos lateralmente.'
        : 'Focos sobre o eixo <strong>y</strong> — ramos abertos verticalmente.';
    }
    var cap = document.getElementById('capEq');
    if (cap) {
      var asym = eqState.orientation === 'h'
        ? 'y = ±(b/a)x = ±' + numFmt(b / a)
        : 'y = ±(a/b)x = ±' + numFmt(a / b);
      cap.textContent = 'Assíntotas: ' + asym + ' · c = √(a²+b²) = ' + numFmt(c);
    }
  }

  function plotEquacoes() {
    var lay = baseLayout({
      xaxis: axisDef({ range: [-10, 10], dtick: 2 }),
      yaxis: axisDef({ range: [-7.5, 7.5], dtick: 2, scaleanchor: 'x', scaleratio: 1 })
    });
    Plotly.newPlot('plotEquacoes', [], lay, PLOT_CONFIG);
    attachLiveCoords('plotEquacoes');
    refreshEquacoes();
  }

  function initEquacoesControls() {
    var buttons = document.querySelectorAll('.toggle-btn[data-orient]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        eqState.orientation = btn.dataset.orient;
        refreshEquacoes();
      });
    });
    var sA = document.getElementById('sA'), sB = document.getElementById('sB');
    var vA = document.getElementById('va'), vB = document.getElementById('vb');
    if (sA) sA.addEventListener('input', function () { eqState.a = parseFloat(sA.value); vA.textContent = numFmt(eqState.a); refreshEquacoes(); });
    if (sB) sB.addEventListener('input', function () { eqState.b = parseFloat(sB.value); vB.textContent = numFmt(eqState.b); refreshEquacoes(); });
  }

  function plotRelacao() {
    var a = 4, b = 3, c = 5;
    var traces = [
      { x: [0, a, a, 0], y: [0, 0, b, 0], mode: 'lines', line: { color: 'rgba(234,242,251,.35)', width: 1.5 }, fill: 'toself', fillcolor: 'rgba(40,104,198,.05)', hoverinfo: 'skip', showlegend: false },
      { x: [0, a], y: [0, 0], mode: 'lines+markers', line: { color: C.curve, width: 3 }, marker: { size: 6, color: C.curve }, hovertemplate: 'cateto a<extra></extra>', showlegend: false },
      { x: [a, a], y: [0, b], mode: 'lines+markers', line: { color: C.curve, width: 3 }, marker: { size: 6, color: C.curve }, hovertemplate: 'cateto b<extra></extra>', showlegend: false },
      { x: [0, a], y: [0, b], mode: 'lines+markers', line: { color: C.focus, width: 3 }, marker: { size: 6, color: C.focus }, hovertemplate: 'hipotenusa c<extra></extra>', showlegend: false }
    ];
    var lay = baseLayout({
      xaxis: axisDef({ range: [-1, 6], dtick: 1 }),
      yaxis: axisDef({ range: [-1, 5], dtick: 1, scaleanchor: 'x', scaleratio: 1 }),
      annotations: [
        { x: a / 2, y: -0.5, text: 'a = ' + a, showarrow: false, font: { color: C.curve, size: 12, family: 'JetBrains Mono, monospace' } },
        { x: a + 0.5, y: b / 2, text: 'b = ' + b, showarrow: false, font: { color: C.curve, size: 12, family: 'JetBrains Mono, monospace' } },
        { x: a / 2 - 0.3, y: b / 2 + 0.4, text: 'c = ' + c, showarrow: false, font: { color: C.focus, size: 12, family: 'JetBrains Mono, monospace' } }
      ]
    });
    Plotly.newPlot('plotRelacao', traces, lay, PLOT_CONFIG);
    attachLiveCoords('plotRelacao');
  }

  function plotExemplo() {
    var a = 4, b = 3, c = 5;
    var traces = curveTraces(a, b, 0, 0, 'h').concat(
      asymptoteTraces(a, b, 0, 0, 'h', 12),
      focalTraces(a, b, 0, 0, 'h')
    );
    var lay = baseLayout({
      xaxis: axisDef({ range: [-12, 12], dtick: 2 }),
      yaxis: axisDef({ range: [-9, 9], dtick: 2, scaleanchor: 'x', scaleratio: 1 }),
      annotations: [
        { x: a, y: -0.8, text: 'A₂(4,0)', showarrow: false, font: { color: C.vertex, size: 11, family: 'JetBrains Mono, monospace' } },
        { x: -a, y: -0.8, text: 'A₁(−4,0)', showarrow: false, font: { color: C.vertex, size: 11, family: 'JetBrains Mono, monospace' } },
        { x: c, y: 0.8, text: 'F₂(5,0)', showarrow: false, font: { color: C.focus, size: 11, family: 'JetBrains Mono, monospace' } },
        { x: -c, y: 0.8, text: 'F₁(−5,0)', showarrow: false, font: { color: C.focus, size: 11, family: 'JetBrains Mono, monospace' } }
      ]
    });
    Plotly.newPlot('plotExemplo', traces, lay, PLOT_CONFIG);
    attachLiveCoords('plotExemplo');
  }

  window.HB_MAIN_CHARTS = {
    plotHero: plotHero,
    plotDefinicao: plotDefinicao,
    plotGeometria: plotGeometria,
    plotAnatomia: plotAnatomia,
    plotEquacoes: plotEquacoes,
    plotRelacao: plotRelacao,
    plotExemplo: plotExemplo
  };

  window.HB_HELPERS = {
    curveTraces: curveTraces,
    asymptoteTraces: asymptoteTraces,
    focalTraces: focalTraces,
    focalPoints: focalPoints,
    baseLayout: baseLayout,
    axisDef: axisDef,
    hyperbolaLatex: hyperbolaLatex,
    numFmt: numFmt,
    kx: kx,
    C: C,
    PLOT_CONFIG: PLOT_CONFIG
  };

  window.HB_initEquacoesControls = initEquacoesControls;
  window.HB_initStaticKatex = initStaticKatex;
})();
