/* =====================================================
   preloader.js — Preload Global Único (Arquitetura Flat)

   NOVA ARQUITETURA:
   - UM array global:  images[0..559]
   - UM path template: assets/frames/v01/frame_XXXX.webp
   - Mapeamento de índice → número de frame:
       índices  0–279  →  frames 0001–0280
       índices 280–559 →  frames 0300–0579
       (gap 0281–0299 não existe no disco — é pulado)
   - Fase 0: primeiros 30 frames (bloqueante, exibe loading)
   - Fase 1: restante em background (concorrência 6)
   - ZERO lógica de vídeo/bloco/pasta
   ===================================================== */

(function (global) {
  'use strict';

  /* -----------------------------------------------
     CONFIGURAÇÃO
  ----------------------------------------------- */
  var FRAME_COUNT    = 560;   // total de frames reais
  var PHASE0_COUNT   = 30;    // frames carregados antes de liberar a intro
  var CONCURRENCY    = 6;     // downloads paralelos no background

  /* -----------------------------------------------
     ARRAY GLOBAL DE IMAGENS (0-indexed)
     images[0]  = frame_0001.webp
     images[279]= frame_0280.webp
     images[280]= frame_0300.webp  ← gap pulado aqui
     images[559]= frame_0579.webp
  ----------------------------------------------- */
  var images = new Array(FRAME_COUNT);

  /* -----------------------------------------------
     ESTADO
  ----------------------------------------------- */
  var loadedCount      = 0;
  var onReadyCallback  = null;
  var isWeak           = false;

  /* -----------------------------------------------
     MAPEAMENTO: índice → número do arquivo físico
     A gap de 0281–0299 (19 frames ausentes) é tratada
     somando 20 para índices ≥ 280.
  ----------------------------------------------- */
  function getFrameNumber(index) {
    if (index < 280) {
      return index + 1;          // 0→1, 279→280
    }
    return index + 20;           // 280→300, 559→579
  }

  function getFramePath(index) {
    var n = getFrameNumber(index);
    return 'assets/frames/v01/frame_' + String(n).padStart(4, '0') + '.webp';
  }

  /* -----------------------------------------------
     CARREGAMENTO INDIVIDUAL
  ----------------------------------------------- */
  function loadFrame(index, callback) {
    // Já está carregado? Reutiliza.
    var existing = images[index];
    if (existing && existing.complete && existing.naturalWidth > 0) {
      if (callback) callback();
      return;
    }

    var img       = new Image();
    img.decoding  = 'async';

    img.onload = function () {
      images[index] = img;
      loadedCount++;
      if (callback) callback();
    };

    img.onerror = function () {
      // Frame não existe no disco (ex: gap 281–299).
      // Deixa images[index] como undefined — render usará fallback.
      if (callback) callback();
    };

    img.src = getFramePath(index);
  }

  /* -----------------------------------------------
     FASE 0 — Primeiros PHASE0_COUNT frames (bloqueante)
     Exibe barra de loading. Ao concluir, chama onReady.
  ----------------------------------------------- */
  function executePhase0(onComplete) {
    var done = 0;

    for (var i = 0; i < PHASE0_COUNT; i++) {
      (function (idx) {
        loadFrame(idx, function () {
          done++;
          updateLoadingUI(Math.round((done / PHASE0_COUNT) * 100));
          if (done >= PHASE0_COUNT && onComplete) {
            onComplete();
          }
        });
      }(i));
    }
  }

  /* -----------------------------------------------
     FILA COM CONCORRÊNCIA — Fase 1
  ----------------------------------------------- */
  var loadQueue   = [];
  var activeLoads = 0;

  function scheduleLoad(index) {
    // Não re-enfileira frames já carregados ou undefined-pending
    if (images[index] !== undefined) return;
    // Marca slot como 'pending' para evitar duplicatas
    images[index] = 'pending';
    loadQueue.push(index);
    drainQueue();
  }

  function drainQueue() {
    while (activeLoads < CONCURRENCY && loadQueue.length > 0) {
      var idx = loadQueue.shift();
      activeLoads++;
      // Reseta 'pending' para undefined antes de carregar
      // (loadFrame só salva se carregar com sucesso)
      images[idx] = undefined;
      loadFrame(idx, function () {
        activeLoads--;
        drainQueue();
      });
    }
  }

  /* -----------------------------------------------
     FASE 1 — Restante dos frames em background
  ----------------------------------------------- */
  function executePhase1() {
    for (var i = PHASE0_COUNT; i < FRAME_COUNT; i++) {
      scheduleLoad(i);
    }
  }

  /* -----------------------------------------------
     UI DE LOADING
  ----------------------------------------------- */
  function updateLoadingUI(percent) {
    var bar     = document.getElementById('loading-bar-fill');
    var pctText = document.getElementById('loading-percent');
    var msg     = document.getElementById('loading-message');

    if (bar)     bar.style.width       = Math.min(percent, 100) + '%';
    if (pctText) pctText.textContent   = Math.min(percent, 100) + '%';

    if (msg) {
      if (percent < 50)      msg.textContent = 'Carregando experiência...';
      else if (percent < 90) msg.textContent = 'Preparando o Pantanal...';
      else                   msg.textContent = 'Quase lá...';
    }
  }

  /* -----------------------------------------------
     DETECÇÃO DE HARDWARE FRACO
  ----------------------------------------------- */
  function detectWeakDevice() {
    try {
      if (performance.memory) {
        var limit = performance.memory.jsHeapSizeLimit;
        if (limit && limit < 512 * 1024 * 1024) {
          isWeak = true;
          CONCURRENCY = 3; // reduz concorrência em dispositivos fracos
        }
      }
    } catch (e) {}
  }

  /* -----------------------------------------------
     INICIALIZAÇÃO
  ----------------------------------------------- */
  function init(onReady) {
    onReadyCallback = onReady;
    detectWeakDevice();

    executePhase0(function () {
      if (onReadyCallback) onReadyCallback();
      // Pequeno delay para não competir com animação da intro
      setTimeout(executePhase1, 300);
    });
  }

  /* -----------------------------------------------
     API PÚBLICA
  ----------------------------------------------- */
  global.PantanalPreloader = {
    init:         init,
    getImages:    function () { return images; },
    getFrameCount: function () { return FRAME_COUNT; },
    getFramePath: getFramePath,
    isWeakDevice: function () { return isWeak; },

    /* --- Stubs de compatibilidade (canvas-engine antigo) --- */
    executePhase2:   function () {},
    loadAheadBlocks: function () {},
    getFramePool:    function () { return images; },
    getFrameKey:     function (v, f) { return (v - 1) * 40 + (f - 1); },
    totalVideos:     1,
    framesPerVid:    function () { return FRAME_COUNT; }
  };

}(window));