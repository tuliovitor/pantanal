# 🌿 Pantanal — Experiência Cinematográfica

> Documentário interativo controlado pelo scroll. Nível Awwwards/National Geographic.

---

## 📁 Estrutura de Arquivos

```
pantanal/
├── index.html          ← Estrutura HTML completa
├── styles.css          ← Sistema de design + animações
├── scripts.js          ← Orquestrador da experiência
├── preloader.js        ← Pré-carregamento inteligente em 3 fases
├── canvas-engine.js    ← Motor de renderização 60fps + GSAP
├── quiz.js             ← Quiz interativo com 10 perguntas
├── typewriter.js       ← Engine de digitação cinematográfica
│
└── assets/
    ├── anime-01.webp   ← Foto do apresentador (joinha irônico)
    └── frames/
        ├── v01/        ← frame_0001.webp até frame_0040.webp
        ├── v02/        ← frame_0001.webp até frame_0040.webp
        ├── v03/        ← (... mesma estrutura para todos)
        ├── v04/
        ├── v05/
        ├── v06/
        ├── v07/
        ├── v08/
        ├── v09/
        ├── v10/
        ├── v11/
        ├── v12/
        ├── v13/
        ├── v14/
        └── v15/        ← frame_0001.webp até frame_0040.webp
```

---

## 🎬 Como Adicionar os Frames

### Extraindo frames de vídeos com FFmpeg

Para cada vídeo, execute no terminal:

```bash
# Exemplo para o vídeo 1 (v01):
ffmpeg -i video_amanhecer.mp4 -vf "fps=8,scale=1920:-1" -q:v 80 -frames:v 40 assets/frames/v01/frame_%04d.webp

# Substitua video_amanhecer.mp4 pelo nome do seu vídeo
# fps=8 gera 8 frames por segundo (40 frames = 5 segundos)
# scale=1920:-1 mantém proporção em 1920px de largura
```

### Nomeação obrigatória dos frames

Os arquivos **devem** seguir exatamente este padrão:
- `frame_0001.webp` — primeiro frame
- `frame_0002.webp` — segundo frame
- ...
- `frame_0040.webp` — quadragésimo frame

---

## 🖼️ Foto do Apresentador

Coloque a foto em:
```
assets/anime-01.webp
```
- Formato: WebP ou JPG/PNG (renomeie para `.webp` ou ajuste o `src` no HTML)
- Aparece no canto superior direito durante a pausa dramática do typewriter

---

## 🚀 Como Rodar

### Opção 1: Abrir direto (sem servidor)
```
Abrir index.html diretamente no navegador Chrome/Edge
```
> ⚠️ Algumas funcionalidades podem ser bloqueadas em `file://`.
> Recomendamos a Opção 2.

### Opção 2: Servidor local simples (recomendado)

Com Python (já instalado na maioria dos sistemas):
```bash
# Na pasta do projeto:
python -m http.server 8080
# Acesse: http://localhost:8080
```

Com Node.js:
```bash
npx serve .
# Acesse: http://localhost:3000
```

Com VS Code: instale a extensão **Live Server** e clique em "Go Live".

---

## 🎯 Mapeamento Narrativo dos Vídeos

| Pasta | Momento | Fauna/Flora Sugerida | Tópico |
|-------|---------|---------------------|--------|
| v01 | Pré-amanhecer | Araras-azuis, céu índigo | Caracterização Geral |
| v02 | Primeira luz | Tuiuiú, horizonte coral | Localização Geográfica |
| v03 | Amanhecer pleno | Garça branca | Clima e Vegetação |
| v04 | Manhã viva | Capivaras, Tamanduá | Flora |
| v05 | Flora rica | Aguapé, Jacaré, Colhereiros | Flora |
| v06 | Tensão | Onça espreitando | Fauna |
| v07 | Calor | Anaconda, Ariranhas | Dinâmica Ecológica |
| v08 | Território | Onça caminhando | Cadeias Alimentares |
| v09 | Pré-tempestade | Capivaras fugindo | Fluxo de Energia |
| v10 | Hora dourada | Cervo-do-pantanal | Impactos Ambientais |
| v11 | Revoada | Bando de pássaros | Queimadas |
| v12 | Crepúsculo | Tuiuiú + fumaça | Conservação |
| v13 | Entrada da noite | Anta, Coruja | Dados Complementares |
| v14 | Via Láctea | Cachorros-do-mato | Espécies Ameaçadas |
| v15 | Lua cheia | Tatu-canastra, Jacaré | Conclusão |

---

## 🎮 Fluxo da Experiência

```
Loading Screen
    ↓ (20 frames carregados)
Intro Typewriter
    "Sejam Bem-Vindos ao Pantanal!"
    → apaga tudo
    "Atenção!" ← pausa dramática + anime aparece
    " Obrigado pela atenção :) Boa Experiência!"
    ↓ (primeiro scroll)
Máscara Circular Verde (reveal)
    ↓
Canvas Cinematográfico
    BLOCO 1: Amanhecer (v01→v02→v03) — 600vh
    BLOCO 2: Manhã     (v04→v05→v06) — 600vh
    BLOCO 3: Tarde     (v07→v08→v09) — 600vh
    BLOCO 4: Pôr do Sol(v10→v11→v12) — 600vh
    BLOCO 5: Noite     (v13→v14→v15) — 600vh
    ↓ (após último frame)
Quiz Interativo (10 perguntas)
    ↓ (após responder tudo)
Placar Final + Botão "Recomeçar"
```

---

## 🎨 Paleta de Cores

| Token | Cor | Uso |
|-------|-----|-----|
| `--color-bg-intro` | `#F5FAF2` | Fundo da intro |
| `--color-text-dark` | `#2C3E2D` | Texto na intro |
| `--color-mask` | `#1a3a1f` | Máscara circular |
| `--color-accent` | `#4A7C59` | Destaques verdes |
| `--color-quiz-correct` | `#2ECC71` | Resposta correta |
| `--color-quiz-wrong` | `#E74C3C` | Resposta errada |

---

## ⚙️ Personalização

### Alterar velocidade do typewriter
Em `scripts.js`, modifique os valores `speed`:
```js
.type('Sejam Bem-Vindos ao Pantanal!', { speed: 80 }) // ms por char
```

### Adicionar/remover subtópicos
Em `canvas-engine.js`, edite o array `subtopics` de cada bloco:
```js
dawn: {
  subtopics: [
    'Localização geográfica do bioma',
    // adicione mais aqui...
  ]
}
```

### Ajustar duração do scroll por bloco
Em `index.html`, altere o `style="height: 600vh"` em cada `.scroll-block`.

### Adicionar imagem do anime no quiz
No `index.html`, localize o comentário `/* ANIME-PLACEHOLDER */` e adicione:
```html
<div id="quiz-anime-placeholder">
  <img src="assets/anime-01.webp" alt="Apresentador" style="height: 180px;" />
</div>
```

---

## 📱 Compatibilidade

| Navegador | Suporte |
|-----------|---------|
| Chrome 90+ | ✅ Total |
| Edge 90+ | ✅ Total |
| Firefox 88+ | ✅ Total |
| Safari 14+ | ✅ Total |
| Mobile Chrome | ✅ Adaptado |

---

## 🏫 Equipe de Desenvolvimento

| Apresentador | Tópico |
|-------------|--------|
| Coelho | Caracterização Geral do Bioma |
| Weverton | Flora |
| Octávio | Fauna |
| Murillo | Dinâmica Ecológica, Importância, Conservação, Conclusão |
| Túlio | Impactos Ambientais |
| Codho | Dados Complementares |

---

*"O Pantanal merece isso." 🌿*
