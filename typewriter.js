/* =====================================================
   typewriter.js — Engine de Typewriter Customizada
   Motor de digitação cinematográfico com suporte a:
   - Escrita humana (~80ms/char com variação)
   - Pausa programática
   - Backspace letra por letra
   - Callback encadeados
   ===================================================== */

(function(global) {
  'use strict';

  /**
   * PantanalTypewriter — Motor de typewriter
   * @param {Object} config
   * @param {HTMLElement} config.textEl    — elemento que recebe o texto
   * @param {HTMLElement} config.cursorEl  — elemento do cursor piscante
   */
  function PantanalTypewriter(config) {
    this.textEl   = config.textEl;
    this.cursorEl = config.cursorEl;
    this._queue   = [];
    this._running = false;
    this._paused  = false;
    this._timeout = null;
  }

  /* -----------------------------------------------
     API PÚBLICA
  ----------------------------------------------- */

  /**
   * Encadeia ação de escrever texto
   * @param {string}  text      — texto a digitar
   * @param {Object}  [options]
   * @param {number}  [options.speed=80]   — ms base por caractere
   * @param {boolean} [options.humanize=true] — variação humana
   */
  PantanalTypewriter.prototype.type = function(text, options) {
    var opts = options || {};
    this._queue.push({ action: 'type', text: text, opts: opts });
    return this;
  };

  /**
   * Encadeia pausa
   * @param {number} ms — milissegundos de pausa
   */
  PantanalTypewriter.prototype.pause = function(ms) {
    this._queue.push({ action: 'pause', ms: ms });
    return this;
  };

  /**
   * Encadeia backspace de tudo (apaga o conteúdo atual)
   * @param {number}  [speed=40] — ms entre cada caractere apagado
   */
  PantanalTypewriter.prototype.deleteAll = function(speed) {
    this._queue.push({ action: 'deleteAll', speed: speed || 40 });
    return this;
  };

  /**
   * Encadeia callback customizado
   * @param {Function} fn
   */
  PantanalTypewriter.prototype.call = function(fn) {
    this._queue.push({ action: 'call', fn: fn });
    return this;
  };

  /**
   * Inicia a fila de ações
   */
  PantanalTypewriter.prototype.start = function() {
    if (!this._running) {
      this._running = true;
      this._processQueue();
    }
    return this;
  };

  /**
   * Para todas as ações e limpa a fila
   */
  PantanalTypewriter.prototype.stop = function() {
    this._running = false;
    this._queue   = [];
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
    return this;
  };

  /* -----------------------------------------------
     PROCESSAMENTO INTERNO DA FILA
  ----------------------------------------------- */

  PantanalTypewriter.prototype._processQueue = function() {
    if (!this._running || this._queue.length === 0) {
      this._running = false;
      return;
    }

    var self  = this;
    var item  = this._queue.shift();

    switch (item.action) {
      case 'type':
        self._typeText(item.text, item.opts, function() {
          self._processQueue();
        });
        break;

      case 'pause':
        self._timeout = setTimeout(function() {
          self._processQueue();
        }, item.ms);
        break;

      case 'deleteAll':
        self._deleteAll(item.speed, function() {
          self._processQueue();
        });
        break;

      case 'call':
        try { item.fn(); } catch(e) {}
        self._processQueue();
        break;

      default:
        self._processQueue();
    }
  };

  /**
   * Digita caractere a caractere com velocidade humana
   */
  PantanalTypewriter.prototype._typeText = function(text, opts, callback) {
    var self     = this;
    var speed    = (opts && opts.speed) !== undefined ? opts.speed : 80;
    var humanize = (opts && opts.humanize) !== undefined ? opts.humanize : true;
    var chars    = Array.from(text); // suporte a emojis e unicode
    var index    = 0;

    function typeNext() {
      if (!self._running) return;
      if (index >= chars.length) {
        if (callback) callback();
        return;
      }

      // Acrescenta próximo caractere
      self.textEl.textContent += chars[index];
      index++;

      // Calcula delay com variação humana
      var delay = speed;
      if (humanize) {
        // Pausa mais longa em pontuação
        var lastChar = chars[index - 1];
        if (',;:'.indexOf(lastChar) !== -1) {
          delay = speed * 3 + Math.random() * speed;
        } else if ('.!?'.indexOf(lastChar) !== -1) {
          delay = speed * 4 + Math.random() * speed * 2;
        } else {
          // Variação orgânica: ±40% do speed base
          delay = speed * (0.6 + Math.random() * 0.8);
        }
      }

      self._timeout = setTimeout(typeNext, delay);
    }

    typeNext();
  };

  /**
   * Apaga o texto atual caractere a caractere
   */
  PantanalTypewriter.prototype._deleteAll = function(speed, callback) {
    var self = this;

    function deleteNext() {
      if (!self._running) return;

      var current = self.textEl.textContent;
      if (!current || current.length === 0) {
        if (callback) callback();
        return;
      }

      // Remove último caractere (suporte a emojis via spread)
      var chars = Array.from(current);
      chars.pop();
      self.textEl.textContent = chars.join('');

      // Pequena variação no backspace
      var delay = speed * (0.7 + Math.random() * 0.6);
      self._timeout = setTimeout(deleteNext, delay);
    }

    deleteNext();
  };

  /* -----------------------------------------------
     EXPORTA PARA USO GLOBAL (compatível com file://)
  ----------------------------------------------- */
  global.PantanalTypewriter = PantanalTypewriter;

}(window));
