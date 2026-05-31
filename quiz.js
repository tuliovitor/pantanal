/* =====================================================
   quiz.js — Quiz Interativo sobre o Pantanal
   10 perguntas de múltipla escolha com:
   - Typewriter effect nas perguntas
   - Feedback visual (correto/errado) com animação
   - Barra de progresso por segmentos
   - Navegação via botão ou tecla →
   - Placar final com mensagem personalizada
   ===================================================== */

(function (global) {
  'use strict';

  /* -----------------------------------------------
     BANCO DE QUESTÕES
  ----------------------------------------------- */
  var QUESTIONS = [
    {
      id: 'q01',
      text: 'Qual é a principal característica que define o Pantanal como bioma único no mundo?',
      options: [
        { letter: 'A', text: 'A maior extensão contínua de floresta tropical da América do Sul' },
        { letter: 'B', text: 'A maior planície alagável tropical do planeta' },
        { letter: 'C', text: 'O bioma com maior altitude média do Brasil Central' },
        { letter: 'D', text: 'A região com maior volume de chuvas anuais do continente' }
      ],
      correct: 1,  // índice 0-based (B = índice 1)
      explanation: "O Pantanal é reconhecido como a maior planície alagável tropical do mundo, cobrindo cerca de 150 mil km² no Brasil. Não é uma floresta contínua — é um mosaico de ecossistemas alagáveis."
    },
    {
      id: 'q02',
      text: 'Qual espécie é considerada bioindicadora da saúde do ecossistema aquático do Pantanal?',
      options: [
        { letter: 'A', text: 'Tuiuiú, pois seu desaparecimento sinaliza desequilíbrio aquático' },
        { letter: 'B', text: 'Onça-pintada, por ser o predador de topo da cadeia' },
        { letter: 'C', text: 'Capivara, por depender diretamente da qualidade da água' },
        { letter: 'D', text: 'Arara-azul, por nidificar exclusivamente em palmeiras nativas' }
      ],
      correct: 0,  // A
      explanation: "O Tuiuiú (Jabiru mycteria) é considerado bioindicador porque sua presença sinaliza equilíbrio aquático. Quando as populações de Tuiuiú diminuem, indica que a qualidade e disponibilidade de peixes — sua principal fonte de alimento — está comprometida."
    },
    {
      id: 'q03',
      text: 'O que torna o solo pantaneiro fundamental para a formação das cheias sazonais?',
      options: [
        { letter: 'A', text: 'Alta concentração de argila que impermeabiliza a superfície' },
        { letter: 'B', text: 'Presença de rochas basálticas que bloqueiam a drenagem' },
        { letter: 'C', text: 'Composição arenosa que absorve rapidamente as chuvas' },
        { letter: 'D', text: 'Declividade quase nula que impede o escoamento rápido da água' }
      ],
      correct: 3,  // D
      explanation: "O solo pantaneiro tem declividade extremamente baixa — menos de 1 metro por cada 100 km em algumas áreas. Isso impede que a água das chuvas escoe rapidamente, criando as inundações sazonais que definem o bioma."
    },
    {
      id: 'q04',
      text: 'Em 2020, o Pantanal enfrentou seu maior incêndio registrado. Qual percentual do bioma brasileiro foi atingido?',
      options: [
        { letter: 'A', text: 'Aproximadamente 10%, concentrado nas bordas do bioma' },
        { letter: 'B', text: 'Aproximadamente 18%, principalmente na região sul' },
        { letter: 'C', text: 'Aproximadamente 30%, afetando fauna, flora e solo' },
        { letter: 'D', text: 'Aproximadamente 45%, considerado irreversível por especialistas' }
      ],
      correct: 2,  // C
      explanation: "Em 2020, aproximadamente 30% do Pantanal brasileiro — mais de 4,4 milhões de hectares — foram devastados pelo maior incêndio registrado na história do bioma. A combinação de seca extrema e ação humana foi determinante para a escala da catástrofe."
    },
    {
      id: 'q05',
      text: 'Qual é a função ecológica do aguapé no ecossistema pantaneiro?',
      options: [
        { letter: 'A', text: 'Purifica a água absorvendo metais pesados e serve de alimento para Capivaras' },
        { letter: 'B', text: 'Oxigena a água, serve de habitat para fauna aquática e base da cadeia alimentar' },
        { letter: 'C', text: 'Regula a temperatura da água impedindo a evaporação excessiva' },
        { letter: 'D', text: 'Impede a proliferação de algas tóxicas por competição direta' }
      ],
      correct: 1,  // B
      explanation: "O aguapé oxigena a água por fotossíntese, cria habitat para peixes, anfíbios e aves aquáticas, e serve de base para cadeias alimentares inteiras. Embora absorva metais pesados, essa não é sua função ecológica principal no Pantanal."
    },
    {
      id: 'q06',
      text: 'O que torna a Arara-azul dependente diretamente da palmeira Carandá?',
      options: [
        { letter: 'A', text: 'Ela se alimenta exclusivamente dos frutos da Carandá durante a seca' },
        { letter: 'B', text: 'Utiliza as folhas da Carandá para construir seu ninho no período chuvoso' },
        { letter: 'C', text: ' Nidifica nos ocos do tronco da Carandá, tornando-a insubstituível para reprodução' },
        { letter: 'D', text: 'Usa a sombra das palmeiras para regular sua temperatura corporal' }
      ],
      correct: 2,  // C
      explanation: "A Arara-azul (Anodorhynchus hyacinthinus) nidifica quase exclusivamente nos ocos naturais de palmeiras Carandá e Bocaiúva. Sem essas palmeiras, a espécie perde seus locais de reprodução — tornando a conservação dessas árvores essencial para a sobrevivência da espécie."
    },
    {
      id: 'q07',
      text: 'Se a onça-pintada fosse extinta do Pantanal, qual seria o impacto mais direto na dinâmica ecológica?',
      options: [
        { letter: 'A', text: 'Aumento de queimadas, pois a onça controla animais que compactam o solo' },
        { letter: 'B', text: 'Redução de aves aquáticas, que dependem da onça para limpar carcaças' },
        { letter: 'C', text: 'Explosão populacional de Capivaras, gerando a degradação da vegetação' },
        { letter: 'D', text: 'Proliferação de Jacarés, que perderiam seu principal competidor territorial' }
      ],
      correct: 2,  // C
      explanation: "A onça-pintada é o predador de topo que controla a população de Capivaras. Sem esse controle, as Capivaras se multiplicariam em excesso, consumindo a vegetação aquática além da capacidade de regeneração do ecossistema, gerando degradação em cascata."
    },
    {
      id: 'q08',
      text: 'Qual serviço ecossistêmico do Pantanal impacta diretamente a geração de energia elétrica no Brasil?',
      options: [
        { letter: 'A', text: 'A regulação do regime de chuvas que abastece represas hidrelétricas' },
        { letter: 'B', text: 'A decomposição orgânica que gera biogás aproveitado por usinas regionais' },
        { letter: 'C', text: 'A absorção solar pela vegetação que reduz o aquecimento das turbinas' },
        { letter: 'D', text: 'O controle de sedimentos que evita o assoreamento de reservatórios' }
      ],
      correct: 0,  // A
      explanation: "O Pantanal influencia o regime de chuvas de toda a região Centro-Oeste e Sul do Brasil pela evapotranspiração de sua vegetação e corpos d'água. Essas chuvas abastecem os rios que alimentam represas hidrelétricas responsáveis por parte significativa da energia elétrica nacional."
    },
    {
      id: 'q09',
      text: 'Como o Aquecimento Global afeta especificamente o ciclo do Pantanal?',
      options: [
        { letter: 'A', text: 'Acelera o crescimento da vegetação aquática, desequilibrando a cadeia alimentar' },
        { letter: 'B', text: 'Aumenta a evaporação e intensifica as cheias, beneficiando espécies aquáticas' },
        { letter: 'C', text: 'Reduz a temperatura média, diminuindo a biodiversidade de répteis' },
        { letter: 'D', text: 'Altera o regime de chuvas, tornando os incêndios mais frequentes' }
      ],
      correct: 3,  // D
      explanation: "O Aquecimento Global altera o ciclo de chuvas do Pantanal, prolongando períodos de seca e aumentando a frequência e intensidade de incêndios. A alternativa B é uma armadilha: o aquecimento pode até intensificar chuvas pontuais, mas os efeitos gerais no bioma são de desequilíbrio e degradação."
    },
    {
      id: 'q10',
      text: 'A Convenção de Ramsar, que protege o Pantanal internacionalmente, reconhece o bioma com base em qual critério principal?',
      options: [
        { letter: 'A', text: 'Por abrigar o maior número de espécies endêmicas de mamíferos do mundo' },
        { letter: 'B', text: 'Por ser Patrimônio Natural da Humanidade com maior área contínua protegida' },
        { letter: 'C', text: 'Por ser uma zona úmida de importância internacional para aves migratórias' },
        { letter: 'D', text: 'Por representar o único bioma transfronteiriço com legislação ambiental unificada' }
      ],
      correct: 2,  // C
      explanation: "A Convenção de Ramsar (1971) designa zonas úmidas de importância internacional com base em critérios ecológicos, botânicos, zoológicos e hidrológicos — especialmente para aves aquáticas e migratórias. O Pantanal foi listado por abrigar uma das maiores concentrações de vida aquática do planeta. A designation UNESCO é separada e complementar."
    }
  ];

  /* -----------------------------------------------
     MENSAGENS FINAIS POR FAIXA DE ACERTO
  ----------------------------------------------- */
  var RESULT_MESSAGES = [
    { min: 10, max: 10, icon: '🌿', title: 'Perfeito!', message: 'Você é um verdadeiro guardião do Pantanal! O bioma agradece sua dedicação.' },
    { min: 7, max: 9, icon: '🐦', title: 'Excelente!', message: 'O Pantanal te agradece! Seu conhecimento faz diferença na conservação do bioma.' },
    { min: 4, max: 6, icon: '🌊', title: 'Bom começo!', message: 'Continue explorando o Pantanal. Cada novo conhecimento ajuda a proteger este bioma único.' },
    { min: 0, max: 3, icon: '🌅', title: 'Continue tentando!', message: 'Volte ao início da experiência e explore mais — o Pantanal tem muito a ensinar.' }
  ];

  /* -----------------------------------------------
     ESTADO DO QUIZ
  ----------------------------------------------- */
  var quizState = {
    active: false,
    currentSlide: 0,
    score: 0,
    answered: false,
    selectedOption: -1,
    typewriterTimer: null
  };

  /* -----------------------------------------------
     REFERÊNCIAS DO DOM
  ----------------------------------------------- */
  var quizSection, quizCanvasOverlay, quizWelcome;
  var quizSlider, quizSlidesContainer, quizTrack;
  var quizProgressFill, quizProgressSegments;
  var quizResult, quizResultScore, quizResultMessage;
  var quizResultIcon, quizResultTitle;
  var quizBtnStart, quizBtnRestart;
  var quizWelcomeTitle;

  /* -----------------------------------------------
     INICIALIZAÇÃO DO QUIZ
  ----------------------------------------------- */
  function init() {
    // Captura referências
    quizSection = document.getElementById('quiz-section');
    quizCanvasOverlay = document.getElementById('quiz-canvas-overlay');
    quizWelcome = document.getElementById('quiz-welcome');
    quizSlider = document.getElementById('quiz-slider');
    quizSlidesContainer = document.getElementById('quiz-slides-container');
    quizProgressFill = document.getElementById('quiz-progress-fill');
    quizProgressSegments = document.getElementById('quiz-progress-segments');
    quizResult = document.getElementById('quiz-result');
    quizResultScore = document.getElementById('quiz-result-correct');
    quizResultMessage = document.getElementById('quiz-result-message');
    quizResultIcon = document.getElementById('quiz-result-icon');
    quizResultTitle = document.getElementById('quiz-result-title');
    quizBtnStart = document.getElementById('quiz-btn-start');
    quizBtnRestart = document.getElementById('quiz-btn-restart');
    quizWelcomeTitle = document.getElementById('quiz-welcome-title');

    // Gera segmentos da barra de progresso
    buildProgressSegments();

    // Gera o track e os slides dentro do viewport
    buildSlides();

    // Eventos
    if (quizBtnStart) quizBtnStart.addEventListener('click', startQuiz);
    if (quizBtnRestart) quizBtnRestart.addEventListener('click', restartExperience);

    // Navegação por teclado (seta direita)
    document.addEventListener('keydown', function (e) {
      if (!quizState.active) return;
      if (e.key === 'ArrowRight' && quizState.answered) {
        nextQuestion();
      }
    });
  }

  /* -----------------------------------------------
     CONSTRUÇÃO DOS SEGMENTOS DA BARRA DE PROGRESSO
  ----------------------------------------------- */
  function buildProgressSegments() {
    if (!quizProgressSegments) return;
    quizProgressSegments.innerHTML = '';

    for (var i = 0; i < QUESTIONS.length; i++) {
      var seg = document.createElement('div');
      seg.className = 'quiz-progress-segment';
      seg.id = 'quiz-seg-' + i;
      quizProgressSegments.appendChild(seg);
    }
  }

  /* -----------------------------------------------
     CONSTRUÇÃO DOS SLIDES DAS PERGUNTAS
     Estrutura: quiz-slides-container (viewport)
                  └─ quiz-track (flex row)
                       └─ quiz-slide (flex:0 0 100%)
  ----------------------------------------------- */
  function buildSlides() {
    if (!quizSlidesContainer) return;
    quizSlidesContainer.innerHTML = '';

    // Cria o track interno que será movido pelo GSAP
    quizTrack = document.createElement('div');
    quizTrack.className = 'quiz-track';
    quizTrack.id = 'quiz-track';
    quizSlidesContainer.appendChild(quizTrack);

    QUESTIONS.forEach(function (q, index) {
      var slide = document.createElement('div');
      slide.className = 'quiz-slide';
      slide.id = 'quiz-slide-' + index;

      slide.innerHTML = [
        '<div class="quiz-slide-inner">',
        '<span class="quiz-question-number" aria-label="Pergunta ' + (index + 1) + ' de 10">',
        String(index + 1).padStart(2, '0') + ' / 10',
        '</span>',
        '<h2 class="quiz-question-text" id="quiz-q-text-' + index + '" aria-live="polite"></h2>',
        '<div class="quiz-options" id="quiz-options-' + index + '" role="group" aria-label="Alternativas">',
        buildOptionsHTML(q, index),
        '</div>',
        '<button class="quiz-btn-next" id="quiz-btn-next-' + index + '"',
        ' aria-label="' + (index === QUESTIONS.length - 1 ? 'Ver resultado do quiz' : 'Próxima pergunta') + '" aria-disabled="true">',
        index === QUESTIONS.length - 1 ? 'Ver Resultado <span aria-hidden="true">→</span>' : 'Próxima <span aria-hidden="true">→</span>',
        '</button>',
        '</div>'
      ].join('');

      quizTrack.appendChild(slide);
    });
  }

  /* -----------------------------------------------
     HTML DAS ALTERNATIVAS DE UMA QUESTÃO
  ----------------------------------------------- */
  function buildOptionsHTML(question, slideIndex) {
    return question.options.map(function (opt, optIndex) {
      return [
        '<button class="quiz-option" ',
        'id="quiz-opt-' + slideIndex + '-' + optIndex + '" ',
        'data-index="' + optIndex + '" ',
        'aria-label="Alternativa ' + opt.letter + ': ' + opt.text + '">',
        '<span class="quiz-option-letter">' + opt.letter + '</span>',
        '<span class="quiz-option-text">' + opt.text + '</span>',
        '<span class="quiz-option-icon" aria-hidden="true">',
        optIndex === question.correct ? '✓' : '✗',
        '</span>',
        '</button>'
      ].join('');
    }).join('');
  }

  /* -----------------------------------------------
     ATIVA A SEÇÃO DO QUIZ (chamado do scripts.js)
  ----------------------------------------------- */
  function activate() {
    if (!quizSection) return;

    // Mostra a seção
    quizSection.classList.add('active');
    quizCanvasOverlay.classList.add('blurred');

    // Pequeno delay para a animação de blur começar
    setTimeout(function () {
      quizWelcome.classList.add('visible');

      // Typewriter no título de boas-vindas — cinematográfico
      if (quizWelcomeTitle && typeof PantanalTypewriter !== 'undefined') {
        var tw = new PantanalTypewriter({
          textEl: quizWelcomeTitle,
          cursorEl: null
        });
        // Opção #9 — ecoa a jornada que o usuário acabou de viver
        tw.type('O documentário terminou.\n     A experiência, não.', { speed: 52 }).start();
      } else if (quizWelcomeTitle) {
        quizWelcomeTitle.textContent = 'O documentário terminou.\n     A experiência, não.';
      }
    }, 600);

  }

  /* -----------------------------------------------
     INICIA O QUIZ (botão "Iniciar Quiz")
  ----------------------------------------------- */
  function startQuiz() {
    quizState.active = true;
    quizState.currentSlide = 0;
    quizState.score = 0;
    quizState.answered = false;

    // Esconde welcome card
    quizWelcome.classList.add('hidden');
    quizWelcome.classList.remove('visible');

    // Mostra slider e exibe primeira questão
    setTimeout(function () {
      quizSlider.classList.add('active');

      // Garante que o track começa na posição 0
      if (quizTrack && typeof gsap !== 'undefined') {
        gsap.set(quizTrack, { x: 0 });
      }

      showSlide(0);
    }, 400);
  }

  /* -----------------------------------------------
     EXIBE UMA QUESTÃO ESPECÍFICA
  ----------------------------------------------- */
  function showSlide(index) {
    if (index >= QUESTIONS.length) {
      showResult();
      return;
    }

    quizState.currentSlide = index;
    quizState.answered = false;

    var q = QUESTIONS[index];
    var textEl = document.getElementById('quiz-q-text-' + index);
    var nextBtn = document.getElementById('quiz-btn-next-' + index);

    // Reset do botão próxima
    if (nextBtn) {
      nextBtn.classList.remove('active');
      nextBtn.setAttribute('aria-disabled', 'true');
      nextBtn.addEventListener('click', function onNextClick() {
        if (quizState.answered) {
          nextBtn.removeEventListener('click', onNextClick);
          nextQuestion();
        }
      });
    }

    // Reativa os botões de alternativa
    enableOptions(index);

    // Typewriter na pergunta
    if (textEl) {
      textEl.textContent = '';
      if (typeof PantanalTypewriter !== 'undefined') {
        var tw = new PantanalTypewriter({ textEl: textEl, cursorEl: null });
        tw.type(q.text, { speed: 28, humanize: false }).start();
      } else {
        textEl.textContent = q.text;
      }
    }

    // Atualiza barra de progresso
    updateProgress(index);
  }

  /* -----------------------------------------------
     ATIVA OS BOTÕES DE ALTERNATIVA DE UM SLIDE
  ----------------------------------------------- */
  function enableOptions(slideIndex) {
    var q = QUESTIONS[slideIndex];
    var optEls = document.querySelectorAll('#quiz-options-' + slideIndex + ' .quiz-option');

    optEls.forEach(function (btn, optIndex) {
      // Remove classes de feedback anteriores
      btn.classList.remove('correct', 'wrong');
      btn.disabled = false;

      btn.onclick = function () {
        if (quizState.answered) return;
        handleAnswer(slideIndex, optIndex, q.correct, optEls);
      };
    });
  }

  /* -----------------------------------------------
     TYPEWRITER PARA A EXPLICAÇÃO (Ultraveloz, 18ms)
  ----------------------------------------------- */
  function runExplanationTypewriter(element, text, speed, onComplete) {
    var charIndex = 0;
    element.textContent = '';

    function nextChar() {
      if (charIndex < text.length) {
        element.textContent += text.charAt(charIndex);
        charIndex++;
        setTimeout(nextChar, speed);
      } else {
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }
    }

    nextChar();
  }

  /* -----------------------------------------------
     PROCESSA UMA RESPOSTA SELECIONADA
  ----------------------------------------------- */
  function handleAnswer(slideIndex, selectedIndex, correctIndex, optEls) {
    quizState.answered = true;
    quizState.selectedOption = selectedIndex;

    var isCorrect = (selectedIndex === correctIndex);
    if (isCorrect) quizState.score++;

    // Aplica feedback visual
    optEls.forEach(function (btn, i) {
      btn.disabled = true;

      if (i === correctIndex) {
        btn.classList.add('correct');
      } else if (i === selectedIndex && !isCorrect) {
        btn.classList.add('wrong');
      }
    });

    // Cria e exibe a div de explicação logo abaixo das alternativas
    var q = QUESTIONS[slideIndex];
    var optionsContainer = document.getElementById('quiz-options-' + slideIndex);

    // Evita duplicatas
    var existingExplanation = optionsContainer.parentNode.querySelector('.quiz-explanation');
    if (existingExplanation) {
      existingExplanation.parentNode.removeChild(existingExplanation);
    }

    var selectedLetter = optEls[selectedIndex].querySelector('.quiz-option-letter').textContent;
    var correctLetter = optEls[correctIndex].querySelector('.quiz-option-letter').textContent;

    var explanationDiv = document.createElement('div');
    explanationDiv.className = 'quiz-explanation ' + (isCorrect ? 'correct-explanation' : 'wrong-explanation');

    var headerHTML = '';
    if (isCorrect) {
      headerHTML = '✓ Resposta Correta: ' + correctLetter + ')';
    } else {
      headerHTML = '✗ Resposta Incorreta: ' + selectedLetter + ')<br>Resposta Correta: ' + correctLetter + ')';
    }

    explanationDiv.innerHTML = [
      '<div class="quiz-explanation-header">' + headerHTML + '</div>',
      '<div class="quiz-explanation-body"></div>'
    ].join('');

    // Insere logo após as alternativas e antes do botão próxima
    optionsContainer.parentNode.insertBefore(explanationDiv, optionsContainer.nextSibling);

    // Inicia typewriter de 18ms por caractere
    var bodyEl = explanationDiv.querySelector('.quiz-explanation-body');
    runExplanationTypewriter(bodyEl, q.explanation, 18, function () {
      // Após concluir a digitação, mostra o botão com fadeIn suave (delay de 0.3s)
      setTimeout(function () {
        var nextBtn = document.getElementById('quiz-btn-next-' + slideIndex);
        if (nextBtn) {
          nextBtn.classList.add('active');
          nextBtn.setAttribute('aria-disabled', 'false');
        }
      }, 300);
    });
  }

  /* -----------------------------------------------
     AVANÇA PARA PRÓXIMA PERGUNTA
  ----------------------------------------------- */
  function nextQuestion() {
    var nextIndex = quizState.currentSlide + 1;

    if (nextIndex >= QUESTIONS.length) {
      showResult();
      return;
    }

    // Atualiza o índice ANTES da animação para evitar index desatualizado
    quizState.currentSlide = nextIndex;
    quizState.answered = false;

    // Usa window.innerWidth: quizSlidesContainer pode ter offsetWidth=0 se estava hidden
    var slideWidth = window.innerWidth;

    // Slide para a esquerda via GSAP
    if (quizTrack && typeof gsap !== 'undefined') {
      gsap.to(quizTrack, {
        x:        -(nextIndex * slideWidth),
        duration: 0.8,
        ease:     'power3.inOut',
        onComplete: function () {
          showSlide(nextIndex);
        }
      });
    } else {
      // Fallback CSS
      if (quizTrack) {
        quizTrack.style.transform = 'translateX(-' + (nextIndex * 100) + 'vw)';
      }
      setTimeout(function () {
        showSlide(nextIndex);
      }, 400);
    }
  }

  /* -----------------------------------------------
     RESETA POSIÇÃO DO SLIDER
  ----------------------------------------------- */
  function resetSlidePosition() {
    if (quizTrack) {
      if (typeof gsap !== 'undefined') {
        gsap.set(quizTrack, { x: 0 });
      } else {
        quizTrack.style.transform = 'translateX(0)';
      }
    }
  }

  /* -----------------------------------------------
     ATUALIZA BARRA DE PROGRESSO
  ----------------------------------------------- */
  function updateProgress(currentIndex) {
    var pct = ((currentIndex) / QUESTIONS.length) * 100;

    if (quizProgressFill) {
      quizProgressFill.style.width = pct + '%';
      quizProgressFill.setAttribute('aria-valuenow', currentIndex);
    }
  }

  /* -----------------------------------------------
     EXIBE TELA DE RESULTADO FINAL (Stadium Overlay)
  ----------------------------------------------- */
  function showResult() {
    quizState.active = false;

    // A tela do quiz faz slideOut para a esquerda (0.4s)
    if (quizSlider && typeof gsap !== 'undefined') {
      gsap.to(quizSlider, {
        x: -window.innerWidth,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut',
        onComplete: function () {
          quizSlider.classList.remove('active');
        }
      });
    } else {
      quizSlider.classList.remove('active');
    }

    // Calcula score e mensagens customizadas
    var score = quizState.score;
    var msgText = '';
    if (score === 10) {
      msgText = 'Guardião do Pantanal! 🏆';
    } else if (score >= 7) {
      msgText = 'O Pantanal te agradece! 🐦';
    } else if (score >= 4) {
      msgText = 'Continue explorando! 🌊';
    } else {
      msgText = 'Volte ao início! 🌅';
    }

    // Preenche elementos DOM
    var correctScoreEl = document.getElementById('quiz-result-correct');
    var messageEl = document.getElementById('quiz-result-message');
    var progressScoreEl = document.getElementById('quiz-result-progress-score');
    var progressBarFillEl = document.getElementById('quiz-result-progress-bar-fill');

    if (correctScoreEl) correctScoreEl.textContent = score;
    if (messageEl) messageEl.textContent = msgText;
    if (progressScoreEl) progressScoreEl.textContent = score;

    // Ajusta a classe de cor da barra de progresso horizontal
    if (progressBarFillEl) {
      progressBarFillEl.className = 'quiz-result-progress-bar-fill'; // limpa antigas
      if (score >= 7) {
        progressBarFillEl.classList.add('success');
      } else if (score >= 4) {
        progressBarFillEl.classList.add('warning');
      } else {
        progressBarFillEl.classList.add('danger');
      }
    }

    // Ativa a tela final do quiz (display: block ou customizado)
    quizResult.classList.add('active');

    // Imagem base/Tela feedback-final.webp faz fadeIn (0.8s)
    if (typeof gsap !== 'undefined') {
      gsap.set(quizResult, { opacity: 0 });
      gsap.to(quizResult, {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: function () {
          quizResult.classList.add('visible');
        }
      });
    } else {
      quizResult.classList.add('visible');
    }

    // Staggered reveal dos elementos do placar adicionando classe '.animate-in'
    var topScoreEl = document.querySelector('.quiz-result-top-score');
    var progressContainerEl = document.querySelector('.quiz-result-progress-container');
    var restartBtnEl = document.querySelector('.quiz-btn-restart-stadium');

    // Remove classes anteriores
    if (topScoreEl) topScoreEl.classList.remove('animate-in');
    if (progressContainerEl) progressContainerEl.classList.remove('animate-in');
    if (restartBtnEl) restartBtnEl.classList.remove('animate-in');

    // Força layout reflow
    void quizResult.offsetWidth;

    if (topScoreEl) topScoreEl.classList.add('animate-in');
    if (progressContainerEl) progressContainerEl.classList.add('animate-in');
    if (restartBtnEl) restartBtnEl.classList.add('animate-in');

    // Animação de fill da barra proporcional aos acertos
    if (progressBarFillEl) {
      progressBarFillEl.style.width = '0%';
      setTimeout(function () {
        var percentage = (score / 10) * 100;
        progressBarFillEl.style.width = percentage + '%';
      }, 1400);
    }
  }

  /* -----------------------------------------------
     RETORNA MENSAGEM DE RESULTADO POR FAIXA
  ----------------------------------------------- */
  function getResultMessage(score) {
    for (var i = 0; i < RESULT_MESSAGES.length; i++) {
      var r = RESULT_MESSAGES[i];
      if (score >= r.min && score <= r.max) return r;
    }
    return RESULT_MESSAGES[RESULT_MESSAGES.length - 1];
  }

  /* -----------------------------------------------
     REINICIA A EXPERIÊNCIA (Lenis scroll para o topo)
  ----------------------------------------------- */
  function restartExperience() {
    // Usa Lenis se disponível (via scripts.js)
    if (global.pantanalLenis) {
      global.pantanalLenis.scrollTo(0, { immediate: false, duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Recarrega a página para reiniciar a experiência completa
    setTimeout(function () {
      location.reload();
    }, 1300);
  }

  /* -----------------------------------------------
     EXPORTA API PÚBLICA
  ----------------------------------------------- */
  global.PantanalQuiz = {
    init: init,
    activate: activate
  };

}(window));
