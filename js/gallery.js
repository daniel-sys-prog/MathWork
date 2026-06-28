/* ============================================================
   GALLERY.JS
   Constrói os cartões da galeria de exemplos (window.HYPERBOLE_
   EXAMPLES) com gráfico Plotly próprio, controles de a/b/h/k,
   leitura dinâmica dos elementos e botão de restauração.
   Os gráficos só são inicializados quando o cartão entra na
   área visível (IntersectionObserver), preservando desempenho.
   ============================================================ */

(function () {
  'use strict';

  var H = window.HB_HELPERS;
  if (!H) { return; }

  var ICON_SEARCH =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">' +
    '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>';

  var ICON_RESET =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' +
    '<path d="M3 12a9 9 0 1 0 2.6-6.4M3 4v5h5"/></svg>';

  function el(tag, className, html) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }

  function buildCard(ex) {
    var card = el('article', 'gcard reveal');
    card.dataset.tags = ex.tags.join(' ');
    var titleId = ex.id + '-title';
    card.setAttribute('aria-labelledby', titleId);

    var head = el('div', 'gcard__head');
    head.appendChild(el('span', 'gcard__id', 'EXEMPLO ' + ex.n));
    head.appendChild(el('span', 'gcard__kind', ex.orientation === 'h' ? 'Horizontal' : 'Vertical'));
    card.appendChild(head);

    var titleEl = el('h3', 'gcard__title', ex.title);
    titleEl.id = titleId;
    card.appendChild(titleEl);

    var eqWrap = el('div', 'gcard__eq');
    var eqSpan = el('span');
    eqSpan.id = ex.id + '-eq';
    eqWrap.appendChild(eqSpan);
    card.appendChild(eqWrap);

    var plotWrap = el('div', 'gcard__plot scope');
    plotWrap.innerHTML =
      '<span class="scope__corner scope__corner--tl"></span>' +
      '<span class="scope__corner scope__corner--tr"></span>' +
      '<span class="scope__corner scope__corner--bl"></span>' +
      '<span class="scope__corner scope__corner--br"></span>' +
      '<div id="' + ex.id + '-plot" style="height:100%;"></div>' +
      '<div class="coord-pill"></div>';
    card.appendChild(plotWrap);

    card.appendChild(el('p', 'gcard__note', ex.note));

    var readout = el('p', 'gcard__note mono');
    readout.id = ex.id + '-read';
    readout.style.color = 'var(--ink-dim)';
    readout.style.fontSize = '.78rem';
    card.appendChild(readout);

    var controls = el('div', 'gcard__controls');
    var sliders = el('div', 'gcard__sliders');

    function sliderRow(label, key, min, max, step, value) {
      var row = el('div', 'slider-row');
      var inputId = ex.id + '-' + key;
      var lab = el('label', null, label + ' = <span class="val">' + H.numFmt(value) + '</span>');
      lab.setAttribute('for', inputId);
      var input = document.createElement('input');
      input.type = 'range'; input.min = min; input.max = max; input.step = step; input.value = value;
      input.id = inputId;
      input.setAttribute('aria-label', 'Parâmetro ' + label + ' do exemplo ' + ex.n + ', valor atual ' + H.numFmt(value));
      row.appendChild(lab);
      row.appendChild(input);
      sliders.appendChild(row);
      return input;
    }

    var sliderA = sliderRow('a', 'a', 0.5, 8, 0.5, ex.a);
    var sliderB = sliderRow('b', 'b', 0.5, 8, 0.5, ex.b);
    var sliderH = null, sliderK = null;
    if (ex.tags.indexOf('transladada') !== -1) {
      sliderH = sliderRow('h', 'h', -6, 6, 0.5, ex.h);
      sliderK = sliderRow('k', 'k', -6, 6, 0.5, ex.k);
    }
    controls.appendChild(sliders);

    var resetBtn = el('button', 'reset-btn', ICON_RESET + '<span>restaurar</span>');
    controls.appendChild(resetBtn);
    card.appendChild(controls);

    // estado mutável do cartão
    var state = { a: ex.a, b: ex.b, h: ex.h, k: ex.k, orientation: ex.orientation };
    var plotted = false;

    function render() {
      var traces = H.curveTraces(state.a, state.b, state.h, state.k, state.orientation).concat(
        H.asymptoteTraces(state.a, state.b, state.h, state.k, state.orientation),
        H.focalTraces(state.a, state.b, state.h, state.k, state.orientation)
      );
      var span = Math.max(state.a, state.b) * 2.6 + Math.max(Math.abs(state.h), Math.abs(state.k)) + 2;
      var lay = H.baseLayout({
        xaxis: H.axisDef({ range: [state.h - span, state.h + span] }),
        yaxis: H.axisDef({ range: [state.k - span, state.k + span], scaleanchor: 'x', scaleratio: 1 }),
        margin: { l: 30, r: 12, t: 12, b: 24 }
      });
      var divId = ex.id + '-plot';
      if (!plotted) {
        Plotly.newPlot(divId, traces, lay, H.PLOT_CONFIG);
        plotted = true;
        var div = document.getElementById(divId);
        var pill = card.querySelector('.coord-pill');
        div.on('plotly_hover', function (ev) {
          var pt = ev.points && ev.points[0];
          if (!pt) return;
          pill.textContent = 'x=' + pt.x.toFixed(2) + ' y=' + pt.y.toFixed(2);
          pill.classList.add('is-visible');
        });
        div.on('plotly_unhover', function () { pill.classList.remove('is-visible'); });
      } else {
        Plotly.react(divId, traces, lay, H.PLOT_CONFIG);
      }

      H.kx(ex.id + '-eq', H.hyperbolaLatex(state.a, state.b, state.h, state.k, state.orientation), true);

      var fp = H.focalPoints(state.a, state.b, state.h, state.k, state.orientation);
      var asym = state.orientation === 'h' ? state.b / state.a : state.a / state.b;
      document.getElementById(ex.id + '-read').textContent =
        'c = ' + H.numFmt(fp.c) + ' (distância do centro a cada foco) · vértices a ' + H.numFmt(state.a) +
        ' do centro · assíntotas sobem/desce ' + H.numFmt(asym) + ' para cada 1 que avançam';
    }

    function bindSlider(input, key, label) {
      if (!input) return;
      input.addEventListener('input', function () {
        state[key] = parseFloat(input.value);
        input.parentElement.querySelector('.val').textContent = H.numFmt(state[key]);
        input.setAttribute('aria-label', 'Parâmetro ' + label + ' do exemplo ' + ex.n + ', valor atual ' + H.numFmt(state[key]));
        render();
      });
    }
    bindSlider(sliderA, 'a', 'a'); bindSlider(sliderB, 'b', 'b'); bindSlider(sliderH, 'h', 'h'); bindSlider(sliderK, 'k', 'k');

    resetBtn.addEventListener('click', function () {
      state = { a: ex.a, b: ex.b, h: ex.h, k: ex.k, orientation: ex.orientation };
      sliderA.value = ex.a; sliderA.parentElement.querySelector('.val').textContent = H.numFmt(ex.a);
      sliderB.value = ex.b; sliderB.parentElement.querySelector('.val').textContent = H.numFmt(ex.b);
      if (sliderH) { sliderH.value = ex.h; sliderH.parentElement.querySelector('.val').textContent = H.numFmt(ex.h); }
      if (sliderK) { sliderK.value = ex.k; sliderK.parentElement.querySelector('.val').textContent = H.numFmt(ex.k); }
      render();
    });

    card._render = render;
    return card;
  }

  function initGallery() {
    var examples = window.HYPERBOLE_EXAMPLES || [];
    var grid = document.getElementById('galleryGrid');
    if (!grid) return;

    var cards = examples.map(function (ex) {
      var card = buildCard(ex);
      grid.appendChild(card);
      return card;
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target._render();
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '160px 0px' });
    cards.forEach(function (c) { io.observe(c); });

    // filtros por categoria
    var filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        var tag = btn.dataset.filter;
        cards.forEach(function (card) {
          var match = tag === 'all' || (' ' + card.dataset.tags + ' ').indexOf(' ' + tag + ' ') !== -1;
          card.style.display = match ? '' : 'none';
          if (match) {
            card.classList.add('is-visible');
            io.observe(card); // garante render se ainda não inicializado
          }
        });
      });
    });
  }

  window.HB_initGallery = initGallery;
})();
