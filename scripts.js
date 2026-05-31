/* =====================================================
   scripts.js — Orquestrador Principal
   Controla o fluxo completo da experiência:
   1. Loading screen → fase 0 do preloader
   2. Intro typewriter → entrada do canvas
   3. Máscara circular cinematográfica → reveal do canvas
   4. Scroll cinematográfico (Lenis + GSAP)
   5. Transição para o quiz
   ===================================================== */

/* =====================================================
   PROBLEMA 03 — RESET ABSOLUTO AO CARREGAR
   ─────────────────────────────────────────────────
   CAMADA 1: Desativa scroll restoration do browser.
   CAMADA 2: Força scroll para o topo imediatamente.
   CAMADA 3: Limpa sessionStorage de estados persistentes.

   DEVE acontecer ANTES de qualquer outra lógica,
   inclusive antes do DOMContentLoaded.
   ===================================================== */
(function () {
  /* 1 — Desativa restauração automática do browser */
  if (window.history && window.history.scrollRestoration) {
    window.history.scrollRestoration = 'manual';
  }

  /* 2 — Reset triplo cross-browser (garante topo em todos os engines) */
  try {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  } catch (e) {}

  /* 3 — Apaga flags de estado persistentes do sessionStorage */
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('pantanal_quiz_active');
      sessionStorage.removeItem('pantanal_canvas_active');
      sessionStorage.removeItem('pantanal_scroll_pos');
    }
  } catch (e) {}
}());

(function () {
  'use strict';

  /* -----------------------------------------------
     REFERÊNCIAS DO DOM
  ----------------------------------------------- */
  var loadingScreen      = document.getElementById('loading-screen');
  var introSection       = document.getElementById('intro-section');

  var typewriterText     = document.getElementById('typewriter-text');
  var typewriterCursor   = document.getElementById('typewriter-cursor');
  var scrollHint         = document.getElementById('scroll-hint');
  var cinematicOverlay   = document.getElementById('cinematic-overlay');
  var canvasWrapper      = document.getElementById('canvas-wrapper');
  var canvasScrollHint   = document.getElementById('canvas-scroll-hint');
  var scrollContainer    = document.getElementById('scroll-container');
  var blockIndicator     = document.getElementById('block-indicator');

  /* -----------------------------------------------
     ESTADO GLOBAL
  ----------------------------------------------- */
  var lenis;
  var introComplete  = false;
  var canvasActive   = false;
  var quizActivated  = false;
  var scrollEnabled  = false;
  var maskAnimating  = false;

  /* Exporta Lenis para uso no quiz.js (restart) */
  window.pantanalLenis = null;

  /* -----------------------------------------------
     PROBLEMA 03 — RESET PROFUNDO
     ─────────────────────────────────────────────
     CAMADA 4: Mata todos os ScrollTriggers existentes.
     CAMADA 5: Limpa a memória de scroll do GSAP.
     CAMADA 6: Reseta o playhead para frame 0.
     CAMADA 7: Mata qualquer timeline GSAP em andamento.
  ----------------------------------------------- */
  function performDeepReset() {
    /* Segundo scroll-to — após o DOM montar */
    try {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch (e) {}

    if (typeof ScrollTrigger !== 'undefined') {
      try {
        /* Mata TODOS os ScrollTriggers existentes (inclui cache de posição) */
        ScrollTrigger.getAll().forEach(function (st) { st.kill(); });

        /* Limpa memória de scroll — essencial para evitar o bug de reload */
        if (typeof ScrollTrigger.clearScrollMemory === 'function') {
          ScrollTrigger.clearScrollMemory();
        }

        /* Refresh forçado após limpeza */
        ScrollTrigger.refresh();
      } catch (e) {}
    }

    if (typeof gsap !== 'undefined') {
      try {
        /* Para e limpa qualquer timeline ativa */
        gsap.globalTimeline.clear();
        gsap.killTweensOf('*');
      } catch (e) {}
    }
  }

  /* -----------------------------------------------
     1. INICIALIZAÇÃO — aguarda DOM e bibliotecas
  ----------------------------------------------- */
  function init() {
    /* Reset profundo — CAMADAS 4-7 */
    performDeepReset();

    /* Registra plugin ScrollTrigger */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    /* Inicia o preloader (fase 0: primeiros 20 frames) */
    PantanalPreloader.init(
      onPreloaderReady,
      null
    );

    /* Inicia o canvas engine (RAF começa aqui) */
    PantanalCanvas.init();

    /* Inicia o quiz */
    PantanalQuiz.init();
  }

  /* -----------------------------------------------
     2. PRELOADER PRONTO — esconde loading, inicia intro
  ----------------------------------------------- */
  function onPreloaderReady() {
    setTimeout(function () {
      hideLoadingScreen();
    }, 600);
  }

  function hideLoadingScreen() {
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }

    /* Bloqueia scroll durante a intro */
    document.body.classList.add('intro-active');

    setTimeout(startIntroSequence, 500);
  }

  /* -----------------------------------------------
     3. SEQUÊNCIA DA INTRO — typewriter
  ----------------------------------------------- */
  function startIntroSequence() {
    if (!typewriterText) return;

    var tw = new PantanalTypewriter({
      textEl:   typewriterText,
      cursorEl: typewriterCursor
    });

    tw
      /* FASE 1A */
      .type('Sejam Bem-Vindos ao Pantanal!', { speed: 80 })
      .pause(1500)
      .deleteAll(35)
      .pause(400)

      /* FASE 1B — destaque "Atenção!" */
      .call(function () {
        if (typewriterText) {
          typewriterText.style.fontWeight = '700';
          typewriterText.style.color = '#1a5c2a';
        }
      })
      .type('Atenção!', { speed: 90 })
      .pause(1500)

      /* Continua o texto */
      .call(function () {
        if (typewriterText) {
          typewriterText.style.fontWeight = '400';
          typewriterText.style.color = '';
        }
      })
      .type(' Obrigado pela atenção :)\n     Boa Experiência a Todos!', { speed: 75 })
      .pause(2000)
      .deleteAll(30)
      .pause(500)

      /* Intro terminou — mostra indicador de scroll */
      .call(function () { onIntroTypingComplete(); })

      .start();
  }

  /* -----------------------------------------------
     INTRO TYPING TERMINOU — libera scroll
  ----------------------------------------------- */
  function onIntroTypingComplete() {
    introComplete = true;

    if (scrollHint) scrollHint.classList.add('visible');

    document.body.classList.remove('intro-active');
    scrollEnabled = true;

    /* Ouve o primeiro scroll / teclado para iniciar transição */
    window.addEventListener('wheel',     onFirstScroll, { once: true, passive: true });
    window.addEventListener('touchmove', onFirstScroll, { once: true, passive: true });
    window.addEventListener('keydown', function (e) {
      if (['ArrowDown', 'Space', 'PageDown'].indexOf(e.key) !== -1 && !canvasActive) {
        onFirstScroll();
      }
    }, { once: true });
  }

  /* -----------------------------------------------
     4. PRIMEIRO SCROLL — inicia transição para canvas
  ----------------------------------------------- */
  function onFirstScroll() {
    if (canvasActive || maskAnimating) return;
    maskAnimating = true;

    if (scrollHint) scrollHint.classList.remove('visible');

    startCircleMaskReveal();
  }

  /* ═══════════════════════════════════════════════════════
     5. CIRCLE MASK REVEAL — CINEMATOGRÁFICO
     ─────────────────────────────────────────────────────

     TIMELINE MULTI-FASE (total: ~2.4s):

     FASE 0 │ 0s ──── 0.3s  │ Overlay escuro aparece (opacity 0 → 0.9)
     FASE 1 │ 0.2s ─── 0.5s │ Intro faz fade rápido (opacity 1 → 0)
     FASE 2 │ 0.4s ─── 0.7s │ Micro pausa contemplativa + canvas pronto
     FASE 3 │ 0.55s ── 2.3s │ Círculo expande 0% → 150% (expo.inOut)
             │               │  ├─ Scale canvas: 1.06 → 1.0 (zoom-out)
             │               │  └─ Blur: 14px → 0px (dissolve suave)
     FASE 4 │ 1.6s ── 2.4s  │ Overlay some (opacity 0.9 → 0)
     FASE 5 │ 2.4s          │ Canvas fullscreen, scroll ativo

     SENSAÇÃO: "adentrar o Pantanal pela primeira vez"
  ═══════════════════════════════════════════════════════ */
  function startCircleMaskReveal() {
    if (!canvasWrapper) {
      completeCircleMaskReveal();
      return;
    }

    if (typeof gsap === 'undefined') {
      /* Fallback sem GSAP */
      canvasWrapper.style.opacity    = '1';
      canvasWrapper.style.visibility = 'visible';
      canvasWrapper.style.clipPath   = 'circle(150% at 50% 50%)';
      completeCircleMaskReveal();
      return;
    }

    /* ─── Prepara o canvas-wrapper para a animação ─── */
    canvasWrapper.style.opacity        = '1';
    canvasWrapper.style.visibility     = 'visible';
    canvasWrapper.style.zIndex         = '56'; /* PROBLEM 1: Elevate z-index above clear overlay (55) but below intro (60) */
    /* Inicia com círculo 0 no centro exato da tela */
    canvasWrapper.style.clipPath       = 'circle(0% at 50% 50%)';
    canvasWrapper.style.webkitClipPath = 'circle(0% at 50% 50%)';
    canvasWrapper.style.willChange     = 'clip-path, filter, transform';

    /* Define scale inicial via GSAP (evita conflito de transform strings) */
    gsap.set(canvasWrapper, { scale: 1.06, filter: 'blur(0px)' });

    /* ─── Prepara o overlay cinematográfico ─── */
    if (cinematicOverlay) {
      cinematicOverlay.classList.add('active');
    }

    /* ─── GSAP Timeline Cinematográfica ─── */
    var tl = gsap.timeline({
      defaults: { overwrite: 'auto' },
      onComplete: function () {
        completeCircleMaskReveal();
      }
    });

    /* FASE 0 — Overlay claro sobe (0 → 1)
       Cria a "tela branca" antes de abrir o portal de luz */
    tl.to(cinematicOverlay, {
      opacity:  1,
      duration: 0.38,
      ease:     'power3.inOut'
    }, 0);

    /* FASE 1 — Intro desaparece sob o overlay claro */
    tl.to(introSection, {
      opacity:  0,
      duration: 0.32,
      ease:     'power3.inOut'
    }, 0.08);

    /* FASE 3 — Portal de luz se abre
       O círculo nasce pequeno no centro e expande suavemente.
       Timing: começa em 0.55s, dura 1.75s = termina em 2.3s */
    tl.to(canvasWrapper, {
      clipPath:       'circle(150% at 50% 50%)',
      webkitClipPath: 'circle(150% at 50% 50%)',
      scale:          1.0,   /* zoom-out simultâneo ao reveal */
      duration:       1.75,
      ease:           'expo.inOut',
      onStart: function () {
        /* Blur suave no início da abertura — dissolve com elegância */
        if (canvasWrapper) canvasWrapper.style.filter = 'blur(10px)';
      },
      onUpdate: function () {
        /* Blur dissolve conforme o círculo expande */
        var p       = this.progress();
        var blurVal = p < 0.35
          ? 10
          : Math.max(0, 10 - ((p - 0.35) / 0.65) * 10);
        if (canvasWrapper) {
          canvasWrapper.style.filter = 'blur(' + blurVal.toFixed(1) + 'px)';
        }
      }
    }, 0.55);

    /* FASE 4 — Overlay claro some revelando o canvas por baixo */
    tl.to(cinematicOverlay, {
      opacity:  0,
      duration: 0.9,
      ease:     'power3.inOut'
    }, 1.3);

    return tl;
  }

  /* -----------------------------------------------
     completeCircleMaskReveal — limpeza pós-animação
  ----------------------------------------------- */
  function completeCircleMaskReveal() {
    /* Remove clip-path e efeitos — canvas fullscreen limpo */
    if (canvasWrapper) {
      /* Limpa via GSAP — reseta scale e filter que o GSAP controlava */
      if (typeof gsap !== 'undefined') {
        gsap.set(canvasWrapper, { clearProps: 'scale,filter,clipPath,webkitClipPath' });
      }
      canvasWrapper.style.clipPath       = 'none';
      canvasWrapper.style.webkitClipPath = 'none';
      canvasWrapper.style.filter         = 'none';
      canvasWrapper.style.transform      = 'none';
      canvasWrapper.style.zIndex         = ''; /* PROBLEM 1: Restore default canvas z-index stack position */
      canvasWrapper.style.willChange     = 'auto';
      canvasWrapper.classList.add('active');
    }

    /* Desativa overlay cinematográfico */
    if (cinematicOverlay) {
      cinematicOverlay.classList.remove('active');
      cinematicOverlay.style.opacity    = '0';
      cinematicOverlay.style.visibility = 'hidden';
    }

    /* Oculta a intro completamente */
    if (introSection) {
      introSection.classList.add('hidden');
    }

    canvasActive  = true;
    maskAnimating = false;


    /* Inicia Lenis ANTES de qualquer ScrollTrigger */
    initLenis();

    /* Aguarda 2 frames de RAF para o browser calcular o layout */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {

        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }

        /* Registra todos os ScrollTriggers com layout correto */
        PantanalCanvas.setupScrollTriggers();
        setupQuizTransition();

        /* Mostra HUD e indicador de scroll */
        if (blockIndicator)   blockIndicator.classList.add('visible');
        if (canvasScrollHint) canvasScrollHint.classList.add('visible');

      });
    });
  }

  /* -----------------------------------------------
     6. LENIS — SMOOTH SCROLL
  ----------------------------------------------- */
  function initLenis() {
    if (typeof Lenis === 'undefined') return;

    lenis = new Lenis({
      duration:        1.2,
      easing:          function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      orientation:     'vertical',
      smoothWheel:     true,
      wheelMultiplier: 1,
      touchMultiplier: 2
    });

    /* Exporta para uso no quiz.js */
    window.pantanalLenis = lenis;

    /* Integração com GSAP ticker (obrigatório para ScrollTrigger) */
    if (typeof gsap !== 'undefined') {
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    /* Sync Lenis → ScrollTrigger */
    lenis.on('scroll', function () {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.update();
      }
      checkForQuizActivation();
    });
  }

  /* -----------------------------------------------
     7. TRANSIÇÃO PARA O QUIZ (após noite)
  ----------------------------------------------- */
  function setupQuizTransition() {
    var lastScene = document.getElementById('scene-night');
    if (!lastScene || typeof ScrollTrigger === 'undefined') return;

    ScrollTrigger.create({
      trigger: lastScene,
      start:   'bottom 20%',
      onEnter: function () {
        activateQuizSection();
      }
    });
  }

  function checkForQuizActivation() {
    if (quizActivated) return;

    var container = document.getElementById('scroll-container');
    if (!container) return;

    var rect      = container.getBoundingClientRect();
    var nearBottom = rect.bottom <= window.innerHeight * 1.2;

    if (nearBottom) activateQuizSection();
  }

  function activateQuizSection() {
    if (quizActivated) return;
    quizActivated = true;

    if (blockIndicator)   blockIndicator.classList.remove('visible');
    if (canvasScrollHint) canvasScrollHint.classList.remove('visible');

    if (lenis) lenis.stop();

    PantanalQuiz.activate();
  }

  /* -----------------------------------------------
     RESIZE — Atualiza ScrollTrigger no resize
  ----------------------------------------------- */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }, 250);
  }, { passive: true });

  /* -----------------------------------------------
     INICIA TUDO quando o DOM estiver pronto
  ----------------------------------------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());