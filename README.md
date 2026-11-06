# Voxa

Aplicativo gratuito de **comunicação alternativa** e **expressão de emoções** para crianças com Transtorno do Espectro Autista (TEA). Funciona **sem internet** e guarda tudo **no próprio aparelho**.

**Acesse:** https://hyogaherking.github.io/voxa/ — abra no celular e instale na tela inicial (Chrome: menu → *Instalar app*; iPhone: Compartilhar → *Adicionar à Tela de Início*).

Trabalho de Conclusão de Curso — Tecnologia em Análise e Desenvolvimento de Sistemas, Centro Universitário UnEduvale (Avaré/SP).
Autor: Gabriel Eduardo Filadelfo Serafim · Orientador: Prof. Nicolas Antonio Messias dos Santos Collo.

---

## Como rodar

Requisito: [Node.js](https://nodejs.org) 20 ou mais novo.

```bash
npm install        # instala as dependências (só na primeira vez)
npm run dev        # abre em http://localhost:3000 para desenvolver
npm run build      # gera a versão final na pasta out/ (com o service worker)
npm run preview    # serve a pasta out/ em http://localhost:3000
```

O modo offline e a instalação na tela inicial só funcionam na versão final (`npm run build`) e em endereço **HTTPS** (ou `localhost`).

### Testar no celular

A pasta `out/` é um site estático: qualquer hospedagem gratuita com HTTPS serve.

- **GitHub Pages**: o arquivo `.github/workflows/publicar.yml` gera a versão final e publica na branch `gh-pages` a cada envio para a `main`. No repositório, em Settings → Pages, escolha "Deploy from a branch" → `gh-pages`. O site fica em `usuario.github.io/voxa/` (os caminhos são relativos, então funciona em subpasta).
- **Vercel** ou **Netlify**: importe o repositório; comando de build `npm run build`, pasta de saída `out`.

No celular, abra o endereço uma vez com internet. Depois, no Chrome do Android, use o menu → **Instalar app**. A partir daí o Voxa abre e funciona sem internet.

---

## Como usar

**Criança** (duas abas, nada de configuração):
- **Falar** — toca na figura e a voz fala. As figuras vão para a faixa de frase; **Falar frase** fala a frase inteira.
- **Sentimentos** — escolhe como está; a voz fala "Eu estou triste". Pode dizer quanto (um pouco, bastante, muito), pedir apoio (abraço, silêncio, fone, ajuda…) ou abrir a **respiração guiada**.

**Responsável**: segure o **cadeado** no canto da tela até o círculo fechar e digite o PIN de 4 números (criado no primeiro acesso).

---

## Requisitos do artigo → implementação

| Código | Requisito | Onde está |
|---|---|---|
| RF01 | Seleção de imagens pela criança | `crianca/Comunicacao.tsx` — pranchas em abas e grade de figuras |
| RF02 | Voz em português brasileiro | `lib/voz.ts` — Web Speech API, voz pt-BR do aparelho |
| RF03 | Tela de expressão de emoções | `crianca/Emocoes.tsx`, `data/emocoes.ts`, `crianca/Respirar.tsx` |
| RF04 | Composição de frases | `crianca/FaixaFrase.tsx` — faixa de frase + botão Falar frase |
| RF05 | Área do responsável com acesso restrito | `crianca/BotaoCadeado.tsx` (segurar) + `responsavel/Portao.tsx` (PIN) + `lib/pin.ts` |
| RF06 | Cadastro e edição do perfil | `responsavel/PerfilCrianca.tsx` |
| RF07 | Personalização das pranchas | `responsavel/Pranchas.tsx`, `EditorPrancha.tsx`, `EditorCartao.tsx`, `SeletorPicto.tsx` |
| RF08 | Histórico local e consulta | `lib/dados.ts` (`registrar`), `responsavel/Historico.tsx` |
| RF09 | Configuração da voz | `responsavel/ConfigVoz.tsx` |
| RNF01 | Funcionar 100% offline | `scripts/gerar-sw.mjs` (service worker), `lib/pwa.ts` |
| RNF02 | Dados só no aparelho | `lib/db.ts` — IndexedDB com Dexie; nenhuma chamada de rede |
| RNF03 | Botões grandes, cores suaves, poucos níveis | `app/globals.css` (tokens), máximo de 2 níveis na tela da criança |
| RNF04 | Gratuito | Licença MIT, sem conta, sem anúncios |

---

## Mudanças em relação ao artigo (para atualizar a documentação)

**Tecnologias**

| No artigo | No app | Motivo |
|---|---|---|
| Flutter + Dart | Next.js 16 + React 19 + TypeScript, como PWA instalável | Mesma base roda em Android, iPhone, tablet e computador, sem loja de aplicativos |
| sqflite | IndexedDB com a biblioteca Dexie | Banco local do próprio navegador |
| flutter_tts | Web Speech API (`speechSynthesis`) | Usa as vozes já instaladas no aparelho |
| — | Tailwind CSS 4 | Estilos da interface |
| — | anime.js 4 | Animações curtas de confirmação |
| — | Service worker gerado no build | Guarda todos os arquivos no aparelho (RNF01) |

**Pontos que o artigo deixou para a continuidade e que foram resolvidos**

- **Tela de emoções (RF03)** — criada: 12 emoções, intensidade, "O que pode ajudar?" e respiração guiada.
- **Mecanismo de acesso restrito (RF05)** — duas barreiras: segurar o cadeado por cerca de 2 segundos e digitar um PIN de 4 números. O PIN é guardado só como resumo SHA-256 com sal. "Esqueci o PIN" pede uma conta de multiplicação e não apaga os dados. A proteção é contra acesso acidental da criança, não contra outros adultos.
- **Conteúdo do histórico (RF08)** — cada registro guarda tipo (figura, frase, sentimento, pedido de apoio), texto falado, intensidade e data/hora. A tela mostra totais do período, figuras mais usadas, sentimentos expressos e linha do tempo; permite baixar planilha (CSV), apagar e desligar o registro.
- **Offline como função × restrição** — o item "Modo offline" saiu do menu e virou um aviso de situação no painel ("Pronto para usar sem internet"). Sugestão para o diagrama de casos de uso: retirar "Usar aplicativo offline" do Responsável e manter o offline só como RNF01.

**Outras diferenças**

- O botão único "Salvar ajustes" (Figura 3) foi trocado: ajustes de voz e de tela salvam na hora; perfil, figuras e pranchas têm botão **Salvar** próprio.
- Recursos acrescentados: foto da câmera ou galeria como figura, texto falado diferente do nome da figura ("Água" → "Eu quero água"), concordância de gênero nas falas ("cansado/cansada"), letra bastão, contraste reforçado, três tamanhos de figura, vibração ao tocar, cópia de segurança em arquivo, volta ao vocabulário inicial.
- Pictogramas: Fluent Emoji (Microsoft, licença MIT), 212 figuras com busca em português. O ARASAAC, padrão em CAA, pode ser integrado no futuro (licença CC BY-NC-SA).
- Cores dos cartões inspiradas na Chave de Fitzgerald (uma cor por tipo de palavra), com a sugestão mostrada no editor.

**Referências que podem entrar**

Next.js (documentação oficial), MDN Web Docs — Web Speech API e IndexedDB, W3C — WCAG 2.1, Dexie.js, anime.js, Braille Institute — Atkinson Hyperlegible.

---

## Testes realizados

- Build de produção sem erros e checagem de tipos (TypeScript estrito).
- Roteiro automatizado (Playwright, Chrome) em tela de celular 390 × 844 e tablet 1180 × 820: tocar figuras, montar e falar frase, sentimentos com intensidade e apoio, respiração, criar PIN, editar figura, buscar pictograma, perfil, histórico, voz e preferências.
- Acessibilidade com axe-core (WCAG 2.1 A/AA): nenhuma violação nas telas principais.
- Offline: com a internet cortada, o app recarrega com todas as telas e figuras.

**Ainda não testado**: uso em celular real, som das vozes em diferentes aparelhos, e uso por crianças, responsáveis e profissionais. Essas avaliações continuam como trabalho futuro, como o artigo já indica.

---

## Estrutura

```
src/
  app/                 layout, página única e estilos globais (tokens de cor)
  components/
    crianca/           telas da criança (Falar, Sentimentos, Respirar, cadeado)
    responsavel/       painel e telas de administração
    ui/                componentes reutilizáveis (botão, diálogo, interruptor…)
  data/                vocabulário inicial, emoções, catálogo de pictogramas
  lib/                 banco local, voz, animações, PIN, offline, cópia
public/pictos/         pictogramas SVG (gerados por `npm run pictos`)
scripts/               geração de pictogramas, ícones e service worker
```

## Licenças

- Código: MIT.
- Pictogramas: [Fluent Emoji](https://github.com/microsoft/fluentui-emoji), Microsoft, MIT.
- Fonte: Atkinson Hyperlegible Next, Braille Institute, SIL Open Font License.
