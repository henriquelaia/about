# Stock Tokenization — Toggle de caminhos (LOCAL vs WordPress)

Este pacote foi ajustado para poderes trabalhar LOCALMENTE (VS/VSCode) **e** no WordPress/Elementor **sem duplicar código**.

## Como alternar (basta comentar/descomentar duas linhas)

1. **Abrir `stock_tokenization/pt.html`** (versão PT completa) **ou `stock_tokenization/en.html`** (secção EN).
2. No topo do ficheiro vais encontrar este bloco:

```html
<!-- ENV SWITCH (choose ONE mode) -->
<!-- LOCAL (VS/VSC): uncomment the two lines below -->
<!-- <script>window.STOCKTOK_BASE = ".";</script>
<script src="./env-switcher.js"></script> -->
<!-- WORDPRESS (Elementor/cPanel): keep the lines above commented (default) -->
```

- **Para LOCAL (VS/desktop)**: remove os `<!-- -->` das **duas** linhas do meio.  
  Isto define `window.STOCKTOK_BASE="."` e carrega `env-switcher.js`.

- **Para WordPress**: deixa essas linhas comentadas (por defeito).

## O que faz o `env-switcher.js`?

- **Garante** que o CSS local `stock-tokenization.css` é carregado quando estás em LOCAL.
- **Reescreve automaticamente** todos os `src`/`href` que começam por
  `"/wp-content/themes/lucrar-hello-child/stock_tokenization"`
  para usar o `BASE` local (`./`), ou seja:
  - `/wp-content/.../stock_tokenization/assets/Layer-24.png`
  - passa a `./assets/Layer-24.png` em LOCAL.
- Define `window.EVENTS_GALLERY_FOLDER = BASE + "/assets/slider_evento_ver_em_2023/"`  
  para o **slider** no JS continuar a funcionar em LOCAL.

> **Nota:** O CSS já usa paths **relativos** (`./assets/...`), por isso funciona **igual** em LOCAL e no servidor (o ficheiro `stock-tokenization.css` está na mesma pasta que `assets/`).

## Estrutura esperada no servidor

```
/wp-content/themes/lucrar-hello-child/stock_tokenization/
  ├─ stock-tokenization.css
  ├─ stock-tokenization.js
  ├─ env-switcher.js
  ├─ en.html (código a colar no Elementor se precisares da versão EN)
  ├─ pt.html (página de teste local com HEAD completo)
  └─ assets/ (...)
```

No Elementor, normalmente **copias só o `<section>...</section>`** de `en.html` para um widget HTML.  
Como os `src` já são absolutos para WordPress, **não precisas de alterar mais nada**.  
Para desenvolvimento LOCAL, basta **descomentar** as duas linhas do bloco ENV.

---

Se quiseres, posso também criar uma **versão "min"** dos ficheiros (HTML/CSS/JS) e preparar um **zip pronto** para subir via cPanel.

## Modo de uso rápido (LOCAL vs WordPress)

**LOCAL (VS/VSC)**
1. No `<head>` do `pt.html`/`en.html`, descomenta estas 2 linhas:
   ```html
   <script>window.STOCKTOK_BASE = ".";</script>
   <script src="./env-switcher.js"></script>
   ```
2. Abre o ficheiro diretamente no navegador (sem servidor).

**WordPress (Elementor/cPanel)**
- Mantém as duas linhas *comentadas* (default).
- Os caminhos absolutos `/wp-content/themes/…/stock_tokenization/...` continuarão a ser usados.

### O que o `env-switcher.js` faz no LOCAL
- Garante o carregamento do CSS local (`./stock-tokenization.css`), mesmo que exista um `@import` antigo.
- Reescreve todos os `src`, `href` e `srcset` que apontem para `/wp-content/themes/…/stock_tokenization` para caminhos relativos `./...`.
- Define/força as variáveis globais para o jogo e imagens (se existirem no HTML):
  ```js
  window.EVENTS_GALLERY_FOLDER = "./assets/slider_evento_ver_em_2023/";
  window.GAME_DESKTOP_URL = "./game/index.html";
  window.GAME_TESLA_URL   = "./Tesla-Jump-Game-WebGL-1.0/index.html";
  window.METAMASK_IMG     = "./assets/metamask/MetaMask_Fox.svg.png";
  ```

> **Nota**: Não precisas de duplicar imagens, jogos, PDFs ou fontes. Basta comentar/descomentar as 2 linhas acima.
