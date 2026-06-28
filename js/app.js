/* ============================================================
   APP.JS
   Interações de interface independentes da matemática:
   barra de progresso, navegação lateral, revelação no scroll,
   painéis de detalhe das aplicações e sequência de inicialização.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. BARRA DE PROGRESSO DE LEITURA
  ---------------------------------------------------------- */
  function initProgress() {
    var bar = document.getElementById('progress');
    if (!bar) return;
    function update() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      bar.style.width = pct + '%';
    }
    document.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ----------------------------------------------------------
     2. NAVEGAÇÃO LATERAL — destaque da seção ativa
  ---------------------------------------------------------- */
  function initNavRail() {
    var links = document.querySelectorAll('.nav-rail a');
    var sections = Array.prototype.map.call(links, function (a) {
      return document.querySelector(a.getAttribute('href'));
    }).filter(Boolean);
    if (!sections.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });

    sections.forEach(function (s) { io.observe(s); });
  }

  /* ----------------------------------------------------------
     3. REVELAÇÃO NO SCROLL
  ---------------------------------------------------------- */
  function initReveal() {
    var targets = document.querySelectorAll('.reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* ----------------------------------------------------------
     4. PAINÉIS DE DETALHE — APLICAÇÕES
  ---------------------------------------------------------- */
  function initDetailPanels() {
    var openCards = document.querySelectorAll('[data-detail]');
    var lastFocused = null;

    function open(name) {
      var panel = document.getElementById('detail-' + name);
      if (!panel) return;
      lastFocused = document.activeElement;
      panel.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      panel.scrollTop = 0;
      var back = panel.querySelector('.detail__back');
      if (back) back.focus();
    }
    function close(name) {
      var panel = document.getElementById('detail-' + name);
      if (!panel) return;
      panel.classList.remove('is-open');
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    }

    openCards.forEach(function (card) {
      card.addEventListener('click', function () { open(card.dataset.detail); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card.dataset.detail); }
      });
    });
    document.querySelectorAll('[data-close]').forEach(function (btn) {
      btn.addEventListener('click', function () { close(btn.dataset.close); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      document.querySelectorAll('.detail.is-open').forEach(function (panel) {
        panel.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ----------------------------------------------------------
     5. SEQUÊNCIA DE INICIALIZAÇÃO
  ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    if (window.HB_initStaticKatex) window.HB_initStaticKatex();

    if (window.HB_MAIN_CHARTS) {
      window.HB_MAIN_CHARTS.plotHero();
      window.HB_MAIN_CHARTS.plotDefinicao();
      window.HB_MAIN_CHARTS.plotGeometria();
      window.HB_MAIN_CHARTS.plotAnatomia('plotAnatomia');
      window.HB_MAIN_CHARTS.plotAnatomia('plotAnatomia2');
      window.HB_MAIN_CHARTS.plotEquacoes();
      window.HB_MAIN_CHARTS.plotRelacao();
      window.HB_MAIN_CHARTS.plotExemplo();
    }
    if (window.HB_initEquacoesControls) window.HB_initEquacoesControls();
    if (window.HB_initGallery) window.HB_initGallery();

    initProgress();
    initNavRail();
    initDetailPanels();
    initReveal(); // após a galeria, para observar também os cartões gerados
  });
})();
