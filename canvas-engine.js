/* =====================================================
   canvas-engine.js — Master Cinematic Timeline Engine

   ARQUITETURA DEFINITIVA:
   ─────────────────────────────────────────────────
   UM canvas global      → persistente, fullscreen, fixo
   UM array de imagens   → images[0..559] do preloader
   UM playhead global    → playhead.frame (0 → 559)
   UM ScrollTrigger      → GSAP master, scroll-container
   UM render engine      → drawCoverImage (object-fit: cover)
   ZERO render loops     → render só via GSAP onUpdate
   ZERO troca de engine  → timeline única contínua
   ─────────────────────────────────────────────────

   Fluxo:
     SCROLL → GSAP scrub → playhead.frame
            → onUpdate: render()
            → images[Math.round(playhead.frame)]
            → drawCoverImage(img) → canvas

   O canvas não sabe de cenas, blocos ou vídeos.
   Só sabe renderizar o frame correto do playhead.
   ===================================================== */

(function (global) {
  'use strict';

  /* -----------------------------------------------
     REFERÊNCIAS DO DOM
  ----------------------------------------------- */
  var canvas, ctx;
  var grainCanvas, grainCtx;

  /* -----------------------------------------------
     ARRAY GLOBAL + FRAME COUNT (do preloader)
  ----------------------------------------------- */
  var images;
  var FRAME_COUNT;

  /* -----------------------------------------------
     PLAYHEAD GLOBAL — único objeto animado pelo GSAP
     GSAP anima: playhead.frame de 0 até FRAME_COUNT-1
  ----------------------------------------------- */
  var playhead = { frame: 0 };

  /* -----------------------------------------------
     FALLBACK — último frame válido renderizado
     Garante que jamais há tela preta (nem no gap 281–299)
  ----------------------------------------------- */
  var lastValidImage = null;

  /* -----------------------------------------------
     GRAIN
  ----------------------------------------------- */
  var grainCounter = 0;

  /* -----------------------------------------------
     CENA ATUAL (para HUD e overlays)
  ----------------------------------------------- */
  var currentScene = null;

  /* -----------------------------------------------
     DEFINIÇÃO DAS CENAS (5 blocos narrativos)

     Distribuição proporcional sobre 560 frames (0-559):
       dawn:      0–111   (112 frames) — Amanhecer
       morning:   112–223 (112 frames) — Manhã
       afternoon: 224–335 (112 frames) — Tarde
       sunset:    336–447 (112 frames) — Pôr do Sol
       night:     448–559 (112 frames) — Noite / Via Láctea
  ----------------------------------------------- */
  var SCENE_RANGES = {
    dawn: {
      start:     0,   end: 111,
      tint:      [255, 140, 50, 0.04],
      overlay:   'topic-dawn',
      indicator: { icon: '🌅', text: 'Amanhecer' }
    },
    morning: {
      start:     112, end: 223,
      tint:      [255, 255, 200, 0.03],
      overlay:   'topic-morning',
      indicator: { icon: '☀️', text: 'Manhã' }
    },
    afternoon: {
      start:     224, end: 335,
      tint:      [100, 160, 255, 0.03],
      overlay:   'topic-afternoon',
      indicator: { icon: '⛅', text: 'Tarde' }
    },
    sunset: {
      start:     336, end: 447,
      tint:      [255, 80, 20, 0.05],
      overlay:   'topic-sunset',
      indicator: { icon: '🌇', text: 'Pôr do Sol' }
    },
    night: {
      start:     448, end: 559,
      tint:      [20, 20, 60, 0.06],
      overlay:   'topic-night',
      indicator: { icon: '🌙', text: 'Noite' }
    }
  };

  var SCENE_ORDER = ['dawn', 'morning', 'afternoon', 'sunset', 'night'];

  /* -----------------------------------------------
     SUBTÓPICOS NARRATIVOS POR CENA
     Controlam os textos laterais durante o scroll.
     A lógica de exibição é baseada no progresso local
     dentro de cada cena (não no frame absoluto).
  ----------------------------------------------- */
  var BLOCK_MAP = {
    dawn: {
      subtopics: [
        'Localização geográfica do bioma',
        'Extensão territorial: ~210.000 km²',
        'Clima tropical semiúmido com secas e cheias',
        'Vegetação: campo limpo, cerrado, floresta',
        'Uma das maiores biodiversidades do planeta'
      ]
    },
    morning: {
      subtopics: [
        'Principais espécies: Aguapé, Ipê, Carandá',
        'Estratificação vegetal: dossel, sub-bosque, epífitas',
        'Funções ecológicas: oxigenação, habitat, filtro',
        'Fauna: Onça-pintada, Capivaras, 650+ espécies de aves',
        'Adaptações únicas às cheias e secas anuais',
        'Relações ecológicas: predação, mutualismo, parasitismo'
      ]
    },
    afternoon: {
      subtopics: [
        'Cadeias alimentares: produtores → consumidores → decompositores',
        'Níveis tróficos: plantas, herbívoros, carnívoros',
        'Fluxo de energia: 10% transferido entre níveis',
        'Matéria reciclada pelos decompositores: bactérias e fungos'
      ]
    },
    sunset: {
      subtopics: [
        'Desmatamento: 35% da cobertura original perdida',
        'Queimadas: 2020 — recorde histórico de incêndios',
        'Expansão agropecuária nas bordas do bioma',
        'Aquecimento global: secas e cheias mais extremas',
        'Serviços ecossistêmicos: água doce, carbono, biodiversidade',
        'Unidades de conservação: PARNA do Pantanal e outras',
        'Convenção de Ramsar — proteção de zonas úmidas',
        'Turismo sustentável e educação ambiental'
      ]
    },
    night: {
      subtopics: [
        'Curiosidade: Pantanal faz parte do Aquífero Guarani',
        'Espécies ameaçadas: Arara-azul, Cervo-do-pantanal, Tamanduá',
        'Comparação: maior que Amazônia em concentração de vida',
        'Síntese: bioma único, frágil e essencial ao equilíbrio climático',
        'Reflexão: a ação humana define o futuro do Pantanal'
      ]
    }
  };

  /* ═══════════════════════════════════════════════
     INICIALIZAÇÃO DO CANVAS ENGINE
  ═══════════════════════════════════════════════ */
  function init() {
    canvas = document.getElementById('pantanal-canvas');
    if (!canvas) return;

    // Contexto 2D com alpha:false (performance — sem compositing)
    ctx = canvas.getContext('2d', { alpha: false });

    // Conecta ao array de imagens do preloader
    images      = PantanalPreloader.getImages();
    FRAME_COUNT = PantanalPreloader.getFrameCount();

    // Dimensiona o canvas ao viewport
    resizeCanvas();

    // Configura o canvas de grain
    initGrainCanvas();

    // Renderiza o frame 0 imediatamente (antes do scroll)
    render();

    // Debounce de resize — evita rerenders excessivos
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resizeCanvas();
        initGrainCanvas();
        render(); // re-renderiza com novo tamanho
      }, 200);
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════
     RESIZE DO CANVAS
  ═══════════════════════════════════════════════ */
  function resizeCanvas() {
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /* ═══════════════════════════════════════════════
     GRAIN CANVAS (off-screen, 50% de resolução)
  ═══════════════════════════════════════════════ */
  function initGrainCanvas() {
    if (!grainCanvas) {
      grainCanvas = document.createElement('canvas');
      grainCtx    = grainCanvas.getContext('2d');
    }
    grainCanvas.width  = canvas.width;
    grainCanvas.height = canvas.height;
    generateGrain();
  }

  /* ═══════════════════════════════════════════════
     drawCoverImage — Comportamento CSS object-fit: cover

     Escala a imagem para preencher TODA a tela sem
     deformar, cortando as bordas se necessário.
     Equivalente exato ao CSS: object-fit: cover.
  ═══════════════════════════════════════════════ */
  function drawCoverImage(img) {
    var scale = Math.max(
      canvas.width  / img.naturalWidth,
      canvas.height / img.naturalHeight
    );
    var w = img.naturalWidth  * scale;
    var h = img.naturalHeight * scale;
    var x = (canvas.width  - w) / 2;
    var y = (canvas.height - h) / 2;
    ctx.drawImage(img, x, y, w, h);
  }

  /* ═══════════════════════════════════════════════
     RENDER — FUNÇÃO MESTRE

     Chamada EXCLUSIVAMENTE via GSAP onUpdate.
     Não existe loop de RAF separado.
     Render só acontece quando o scroll move.
  ═══════════════════════════════════════════════ */
  function render() {
    if (!ctx) return;

    // Frame atual do playhead (arredondado para índice inteiro)
    var idx = Math.round(playhead.frame);
    idx = Math.max(0, Math.min(idx, FRAME_COUNT - 1));

    // Obtém imagem do array global
    var img      = images[idx];
    var imgReady = img && img.complete && img.naturalWidth > 0;

    // Atualiza fallback com o último frame válido
    if (imgReady) lastValidImage = img;

    // Usa frame atual ou fallback — JAMAIS tela preta
    var imgToRender = imgReady ? img : lastValidImage;

    // Base preta (importante quando alpha:false)
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Renderiza o frame com object-fit: cover
    if (imgToRender) {
      drawCoverImage(imgToRender);
    }

    // Efeitos cinematográficos
    applyAtmosphericOverlay(idx);
    applyVignette();
    applyFilmGrain();

    // Atualiza HUD (mudança de cena)
    var scene = getSceneForFrame(idx);
    if (scene !== currentScene) {
      currentScene = scene;
      updateBlockIndicator(scene);
    }
  }

  /* ═══════════════════════════════════════════════
     UTILITÁRIO — Detecta cena para um frame index
  ═══════════════════════════════════════════════ */
  function getSceneForFrame(frameIndex) {
    for (var i = 0; i < SCENE_ORDER.length; i++) {
      var key = SCENE_ORDER[i];
      var s   = SCENE_RANGES[key];
      if (frameIndex >= s.start && frameIndex <= s.end) return key;
    }
    return 'dawn'; // fallback
  }

  /* ═══════════════════════════════════════════════
     EFEITO: OVERLAY ATMOSFÉRICO POR CENA
     Aplica tint sutil que evolui conforme a hora do dia.
  ═══════════════════════════════════════════════ */
  function applyAtmosphericOverlay(frameIndex) {
    var scene = getSceneForFrame(frameIndex);
    var t     = SCENE_RANGES[scene].tint;
    ctx.fillStyle = 'rgba(' + t[0] + ',' + t[1] + ',' + t[2] + ',' + t[3] + ')';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  /* ═══════════════════════════════════════════════
     EFEITO: VIGNETTE RADIAL
  ═══════════════════════════════════════════════ */
  function applyVignette() {
    var cx = canvas.width  / 2;
    var cy = canvas.height / 2;
    var r  = Math.sqrt(cx * cx + cy * cy) * 1.2;

    var gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    gradient.addColorStop(0,   'rgba(0,0,0,0)');
    gradient.addColorStop(0.6, 'rgba(0,0,0,0)');
    gradient.addColorStop(1,   'rgba(0,0,0,0.4)');

    ctx.globalAlpha = 0.35;
    ctx.fillStyle   = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
  }

  /* ═══════════════════════════════════════════════
     EFEITO: FILM GRAIN (atualiza a cada 8 renders)
  ═══════════════════════════════════════════════ */
  function applyFilmGrain() {
    grainCounter++;
    if (grainCounter % 8 === 0) generateGrain();

    ctx.globalAlpha = 0.04;
    ctx.drawImage(grainCanvas, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
  }

  function generateGrain() {
    if (!grainCtx) return;

    // Gera em 50% da resolução (upscale via drawImage = blur gratuito)
    var bw = Math.max(1, Math.floor(grainCanvas.width  * 0.5));
    var bh = Math.max(1, Math.floor(grainCanvas.height * 0.5));

    var imageData = grainCtx.createImageData(bw, bh);
    var data      = imageData.data;

    for (var i = 0; i < data.length; i += 4) {
      var noise  = Math.random() * 255 | 0;
      data[i]    = noise;
      data[i + 1] = noise;
      data[i + 2] = noise;
      data[i + 3] = 255;
    }

    grainCtx.putImageData(imageData, 0, 0);
  }

  /* ═══════════════════════════════════════════════
     HUD — INDICADOR DE BLOCO NARRATIVO
  ═══════════════════════════════════════════════ */
  function updateBlockIndicator(sceneKey) {
    var data   = SCENE_RANGES[sceneKey];
    var iconEl = document.getElementById('block-indicator-icon');
    var textEl = document.getElementById('block-indicator-text');
    var hud    = document.getElementById('block-indicator');

    if (!data || !iconEl || !textEl || !hud) return;

    iconEl.textContent = data.indicator.icon;
    textEl.textContent = data.indicator.text;
    hud.classList.add('visible');
  }

  /* ═══════════════════════════════════════════════
     TEXTOS LATERAIS — Atualiza por progresso local
     localProg: 0.0 → 1.0 dentro de cada cena
  ═══════════════════════════════════════════════ */
  function updateTopicText(sceneKey, localProg) {
    var blockData = BLOCK_MAP[sceneKey];
    var sceneData = SCENE_RANGES[sceneKey];
    if (!blockData || !sceneData) return;

    var subtopics = blockData.subtopics;
    var total     = subtopics.length;
    var overlayId = sceneData.overlay;
    var overlay   = document.getElementById(overlayId);
    var textEl    = document.getElementById(overlayId + '-text');

    if (!overlay || !textEl) return;

    // Esconde overlays de todas as outras cenas
    for (var i = 0; i < SCENE_ORDER.length; i++) {
      var key = SCENE_ORDER[i];
      if (key === sceneKey) continue;
      var other = document.getElementById(SCENE_RANGES[key].overlay);
      if (other) other.classList.remove('visible');
    }

    // Determina subtópico atual e janela de exibição
    var subIndex   = Math.min(Math.floor(localProg * total), total - 1);
    var subProgress = (localProg * total) - subIndex;
    var show        = subProgress >= 0.15 && subProgress <= 0.88;

    if (show) {
      if (textEl.dataset.lastIndex !== String(subIndex)) {
        textEl.textContent       = subtopics[subIndex];
        textEl.dataset.lastIndex = subIndex;
      }
      overlay.classList.add('visible');
    } else {
      overlay.classList.remove('visible');
    }
  }

  /* ═══════════════════════════════════════════════
     MASTER GSAP TIMELINE — ScrollTrigger Único

     UM único gsap.to() anima playhead.frame de 0 → 559.
     Nenhuma outra lógica controla frames.
     As sections controlam APENAS texto/UI.
  ═══════════════════════════════════════════════ */
  function setupMasterTimeline() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[PantanalCanvas] GSAP ou ScrollTrigger não encontrado.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    /* ─── MASTER ScrollTrigger ─── */
    gsap.to(playhead, {
      frame:  FRAME_COUNT - 1,   // 0 → 559
      ease:   'none',
      scrollTrigger: {
        trigger:             '#scroll-container',
        start:               'top top',
        end:                 'bottom bottom',
        scrub:               1.2,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          // Chama o render master — único ponto de renderização
          render();

          // Atualiza texto narrativo lateral
          var frameIdx  = Math.round(self.progress * (FRAME_COUNT - 1));
          var scene     = getSceneForFrame(frameIdx);
          var sceneData = SCENE_RANGES[scene];
          var range     = sceneData.end - sceneData.start;
          var localProg = range > 0
            ? (frameIdx - sceneData.start) / range
            : 0;

          updateTopicText(scene, Math.max(0, Math.min(localProg, 1)));
        }
      }
    });

    /* ─── ScrollTriggers de OVERLAY por cena ─── */
    /* Controlam visibilidade dos overlays de texto
       (NUNCA renderização de frames) */
    for (var si = 0; si < SCENE_ORDER.length; si++) {
      (function (sceneKey) {
        var sectionEl = document.getElementById('scene-' + sceneKey);
        if (!sectionEl) return;

        var overlayId = SCENE_RANGES[sceneKey].overlay;

        ScrollTrigger.create({
          trigger:             sectionEl,
          start:               'top 80%',
          end:                 'bottom 20%',
          invalidateOnRefresh: true,
          onEnter:     function () { setOverlay(overlayId, true);  },
          onLeave:     function () { setOverlay(overlayId, false); },
          onEnterBack: function () { setOverlay(overlayId, true);  },
          onLeaveBack: function () { setOverlay(overlayId, false); }
        });
      }(SCENE_ORDER[si]));
    }

    // Refresh após montagem (garante medidas corretas)
    requestAnimationFrame(function () {
      ScrollTrigger.refresh();
    });
  }

  /* ═══════════════════════════════════════════════
     UTILITÁRIO — Toggle de overlay
  ═══════════════════════════════════════════════ */
  function setOverlay(id, visible) {
    var el = document.getElementById(id);
    if (el) el.classList.toggle('visible', visible);
  }

  /* ═══════════════════════════════════════════════
     ESCONDE TODOS OS OVERLAYS
  ═══════════════════════════════════════════════ */
  function hideAllTopicOverlays() {
    var overlays = document.querySelectorAll('.topic-overlay');
    for (var i = 0; i < overlays.length; i++) {
      overlays[i].classList.remove('visible');
    }
  }

  /* ═══════════════════════════════════════════════
     API PARA COMPONENTES EXTERNOS
  ═══════════════════════════════════════════════ */
  function getLastFrame() {
    return Math.round(playhead.frame);
  }

  function getCurrentScene() {
    return currentScene || 'dawn';
  }

  /* ═══════════════════════════════════════════════
     API PÚBLICA
  ═══════════════════════════════════════════════ */
  global.PantanalCanvas = {
    init:               init,
    setupMasterTimeline: setupMasterTimeline,
    setupScrollTriggers: setupMasterTimeline,  // alias de compatibilidade
    getLastFrame:        getLastFrame,
    getCurrentScene:     getCurrentScene,
    hideAllOverlays:     hideAllTopicOverlays
  };

}(window));