"use strict";

/*
 * EQUAÇÃO EM FOCO
 * questoes.js
 *
 * Banco e gerenciamento das questões, incluindo a
 * animação de memorização e embaralhamento das cartas.
 */

const QuestionManager = (() => {

    /* =========================================================
       CONFIGURAÇÃO DA ANIMAÇÃO
    ========================================================= */

    const ANIMATION = {
        FLIP_TIME: 500,        // duração da virada da carta
        SHUFFLE_STEP_TIME: 650 // duração de cada troca de posição
    };


    /* =========================================================
       QUANTIDADE DE EMBARALHAMENTOS POR RODADA
       Começa com mais trocas do que antes e vai aumentando a
       cada fase, até um teto máximo (pra não ficar embaralhando
       pra sempre nas fases finais).
    ========================================================= */

    const SHUFFLE_PASSES_CONFIG = {
        START: 5,  // trocas na 1ª fase
        STEP: 1,   // aumenta 1 troca por fase
        MAX: 12    // nunca passa de 12 trocas
    };

    const getShufflePasses = (round) =>
        Math.min(
            SHUFFLE_PASSES_CONFIG.MAX,
            SHUFFLE_PASSES_CONFIG.START + (round - 1) * SHUFFLE_PASSES_CONFIG.STEP
        );


    /* =========================================================
       TEMPO DE MEMORIZAÇÃO POR RODADA
       Começa em um tempo confortável e vai diminuindo aos
       poucos a cada rodada, sem exageros, até um piso mínimo.
    ========================================================= */

    const MEMORIZE_TIME_CONFIG = {
        START: 6000,   // 6s na 1ª fase
        STEP: 350,     // reduz 0,35s por fase
        MIN: 2500      // nunca fica abaixo de 2,5s
    };

    const getMemorizeTime = (round) =>
        Math.max(
            MEMORIZE_TIME_CONFIG.MIN,
            MEMORIZE_TIME_CONFIG.START - (round - 1) * MEMORIZE_TIME_CONFIG.STEP
        );


    /* =========================================================
       DISTRIBUIÇÃO DE DIFICULDADE POR FASE
       (10 fases, 4 cartas por fase, níveis de 1 a 5)
       Fase 1: todas fáceis (nível 1)
       Fase 10: todas difíceis (nível 5)
    ========================================================= */

    const PHASE_LEVELS = [
        [1, 1, 1, 1],
        [1, 1, 1, 2],
        [1, 1, 2, 2],
        [1, 2, 2, 3],
        [2, 2, 3, 3],
        [2, 3, 3, 4],
        [3, 3, 4, 4],
        [3, 4, 4, 5],
        [4, 4, 5, 5],
        [5, 5, 5, 5]
    ];


    /* =========================================================
       BANCO DE QUESTÕES
       Revisão de matemática — Ensino Médio
    ========================================================= */

    const QUESTIONS = [

        /* NÍVEL 1 — MUITO FÁCIL (100 pontos) */
        { id: 1, level: 1, points: 100, equation: "Qual é o valor de 2⁴?", answer: "16", options: ["8", "12", "16", "24"], explanation: "2⁴ = 2 × 2 × 2 × 2 = 16." },
        { id: 2, level: 1, points: 100, equation: "Qual é o valor de 3² + 4²?", answer: "25", options: ["12", "18", "20", "25"], explanation: "3² + 4² = 9 + 16 = 25." },
        { id: 3, level: 1, points: 100, equation: "Qual é o valor de √81?", answer: "9", options: ["7", "8", "9", "10"], explanation: "√81 = 9, pois 9² = 81." },
        { id: 4, level: 1, points: 100, equation: "Qual é o valor de √25 + √9?", answer: "8", options: ["6", "7", "8", "9"], explanation: "√25 + √9 = 5 + 3 = 8." },
        { id: 5, level: 1, points: 100, equation: "Na função f(x) = x² + 3x + 2, qual é o valor de a?", answer: "1", options: ["1", "2", "3", "-1"], explanation: "O coeficiente de x² é a = 1." },
        { id: 6, level: 1, points: 100, equation: "Qual é o valor de f(2) na função f(x) = x² + 1?", answer: "5", options: ["3", "4", "5", "6"], explanation: "f(2) = 2² + 1 = 4 + 1 = 5." },
        { id: 7, level: 1, points: 100, equation: "A função f(x) = x² + 2x + 1 possui:", answer: "Mínimo", options: ["Máximo", "Mínimo", "Nenhum dos dois", "Dois máximos"], explanation: "Como a = 1 > 0, a parábola abre para cima e possui mínimo." },
        { id: 8, level: 1, points: 100, equation: "Qual é o vértice da função f(x) = x² - 4x + 3?", answer: "(2, -1)", options: ["(2, -1)", "(2, 1)", "(-2, 1)", "(4, 3)"], explanation: "x = -b/2a = 4/2 = 2; f(2) = 4 - 8 + 3 = -1. Vértice (2, -1)." },
        { id: 9, level: 1, points: 100, equation: "Resolva: 2ˣ = 16.", answer: "4", options: ["2", "3", "4", "5"], explanation: "16 = 2⁴, logo x = 4." },
        { id: 10, level: 1, points: 100, equation: "Resolva: 5ˣ = 25.", answer: "2", options: ["1", "2", "3", "4"], explanation: "25 = 5², logo x = 2." },

        /* NÍVEL 2 — FÁCIL (200 pontos) */
        { id: 11, level: 2, points: 200, equation: "Qual é o resultado de 2³ · 2²?", answer: "32", options: ["16", "24", "32", "64"], explanation: "2³ · 2² = 2⁵ = 32." },
        { id: 12, level: 2, points: 200, equation: "Simplifique √50.", answer: "5√2", options: ["5√2", "10√5", "2√5", "25√2"], explanation: "√50 = √(25 · 2) = 5√2." },
        { id: 13, level: 2, points: 200, equation: "Na função f(x) = 2x² - 5x + 3, qual é o valor de b?", answer: "-5", options: ["2", "-5", "3", "-2"], explanation: "O coeficiente de x é b = -5." },
        { id: 14, level: 2, points: 200, equation: "Quais são as raízes de x² - 5x + 6 = 0?", answer: "2 e 3", options: ["1 e 6", "2 e 3", "-2 e -3", "3 e 4"], explanation: "x² - 5x + 6 = (x-2)(x-3), raízes 2 e 3." },
        { id: 15, level: 2, points: 200, equation: "Qual é o valor de Δ em x² - 4x + 3 = 0?", answer: "4", options: ["2", "4", "8", "16"], explanation: "Δ = b² - 4ac = 16 - 12 = 4." },
        { id: 16, level: 2, points: 200, equation: "Qual é o vértice de f(x) = x² - 6x + 5?", answer: "(3, -4)", options: ["(3, -4)", "(3, 4)", "(-3, -4)", "(6, 5)"], explanation: "x = 6/2 = 3; f(3) = 9 - 18 + 5 = -4. Vértice (3, -4)." },
        { id: 17, level: 2, points: 200, equation: "A função f(x) = -x² + 4x possui:", answer: "Máximo", options: ["Máximo", "Mínimo", "Nenhum dos dois", "Duas raízes iguais"], explanation: "Como a = -1 < 0, a parábola abre para baixo e possui máximo." },
        { id: 18, level: 2, points: 200, equation: "Resolva: 2ˣ⁺¹ = 8.", answer: "2", options: ["1", "2", "3", "4"], explanation: "8 = 2³, então x + 1 = 3, logo x = 2." },
        { id: 19, level: 2, points: 200, equation: "Resolva: 3ˣ = 81.", answer: "4", options: ["2", "3", "4", "5"], explanation: "81 = 3⁴, logo x = 4." },
        { id: 20, level: 2, points: 200, equation: "Resolva: 2ˣ > 8.", answer: "x > 3", options: ["x > 2", "x > 3", "x < 3", "x < 2"], explanation: "8 = 2³, então x > 3." },

        /* NÍVEL 3 — MÉDIO (300 pontos) */
        { id: 21, level: 3, points: 300, equation: "Qual é o resultado de 3⁵ ÷ 3²?", answer: "27", options: ["3", "9", "27", "81"], explanation: "3⁵ ÷ 3² = 3³ = 27." },
        { id: 22, level: 3, points: 300, equation: "Simplifique √18.", answer: "3√2", options: ["2√3", "3√2", "6√2", "9√2"], explanation: "√18 = √(9 · 2) = 3√2." },
        { id: 23, level: 3, points: 300, equation: "Quais são as raízes de x² - 7x + 12 = 0?", answer: "3 e 4", options: ["2 e 6", "3 e 4", "1 e 12", "-3 e -4"], explanation: "x² - 7x + 12 = (x-3)(x-4), raízes 3 e 4." },
        { id: 24, level: 3, points: 300, equation: "Qual é o Δ da equação 2x² - 4x + 2 = 0?", answer: "0", options: ["0", "2", "4", "8"], explanation: "Δ = 16 - 16 = 0." },
        { id: 25, level: 3, points: 300, equation: "O vértice de f(x) = x² - 4x + 3 é:", answer: "(2, -1)", options: ["(2, -1)", "(2, 1)", "(-2, -1)", "(4, 3)"], explanation: "x = 4/2 = 2; f(2) = 4 - 8 + 3 = -1. Vértice (2, -1)." },
        { id: 26, level: 3, points: 300, equation: "Qual é o valor máximo de f(x) = -x² + 6x?", answer: "9", options: ["6", "8", "9", "12"], explanation: "x = 3; f(3) = -9 + 18 = 9." },
        { id: 27, level: 3, points: 300, equation: "Uma bola tem sua altura dada por h(t) = -5t² + 20t. Em qual instante ela atinge a altura máxima?", answer: "2 s", options: ["1 s", "2 s", "3 s", "4 s"], explanation: "t = -20/(2·-5) = 2 s." },
        { id: 28, level: 3, points: 300, equation: "Resolva: 2ˣ + 2ˣ = 16.", answer: "3", options: ["2", "3", "4", "5"], explanation: "2·2ˣ = 16 → 2ˣ = 8 → x = 3." },
        { id: 29, level: 3, points: 300, equation: "Resolva: 4ˣ = 64.", answer: "3", options: ["2", "3", "4", "6"], explanation: "64 = 4³, logo x = 3." },
        { id: 30, level: 3, points: 300, equation: "Resolva: 3ˣ ≤ 27.", answer: "x ≤ 3", options: ["x ≤ 2", "x ≤ 3", "x ≥ 3", "x ≥ 4"], explanation: "27 = 3³, então x ≤ 3." },

        /* NÍVEL 4 — DIFÍCIL (400 pontos) */
        { id: 31, level: 4, points: 400, equation: "Qual é o resultado de 2⁵ · 2⁻²?", answer: "8", options: ["2", "4", "8", "16"], explanation: "2⁵ · 2⁻² = 2³ = 8." },
        { id: 32, level: 4, points: 400, equation: "Resolva: √(x + 4) = 3.", answer: "5", options: ["3", "4", "5", "9"], explanation: "x + 4 = 9 → x = 5." },
        { id: 33, level: 4, points: 400, equation: "Para qual valor de m a equação x² - 6x + m = 0 possui uma única raiz real?", answer: "9", options: ["6", "8", "9", "12"], explanation: "Δ = 0 → 36 - 4m = 0 → m = 9." },
        { id: 34, level: 4, points: 400, equation: "A função f(x) = -x² + 8x - 7 possui valor máximo igual a:", answer: "9", options: ["7", "8", "9", "10"], explanation: "x = 4; f(4) = -16 + 32 - 7 = 9." },
        { id: 35, level: 4, points: 400, equation: "Quais são as raízes de 2x² - 10x + 12 = 0?", answer: "2 e 3", options: ["1 e 6", "2 e 3", "3 e 4", "4 e 6"], explanation: "Simplificando: x² - 5x + 6 = 0 → raízes 2 e 3." },
        { id: 36, level: 4, points: 400, equation: "L(x) = -x² + 10x representa o lucro de uma empresa. Qual é o lucro máximo?", answer: "25", options: ["20", "25", "50", "100"], explanation: "x = 5; L(5) = -25 + 50 = 25." },
        { id: 37, level: 4, points: 400, equation: "Resolva: 2ˣ⁺² = 32.", answer: "3", options: ["2", "3", "4", "5"], explanation: "32 = 2⁵ → x + 2 = 5 → x = 3." },
        { id: 38, level: 4, points: 400, equation: "Resolva: 3²ˣ = 81.", answer: "2", options: ["1", "2", "3", "4"], explanation: "81 = 3⁴ → 2x = 4 → x = 2." },
        { id: 39, level: 4, points: 400, equation: "Resolva: 2ˣ ≥ 16.", answer: "x ≥ 4", options: ["x ≥ 2", "x ≥ 3", "x ≥ 4", "x ≤ 4"], explanation: "16 = 2⁴, então x ≥ 4." },
        { id: 40, level: 4, points: 400, equation: "Uma população é dada por P(t) = 100 · 2ᵗ. Qual será a população após 3 períodos?", answer: "800", options: ["300", "400", "600", "800"], explanation: "P(3) = 100 · 2³ = 100 · 8 = 800." },

        /* NÍVEL 5 — MUITO DIFÍCIL (500 pontos) */
        { id: 41, level: 5, points: 500, equation: "Qual é o valor de √50 + √8?", answer: "7√2", options: ["5√2", "6√2", "7√2", "8√2"], explanation: "√50 + √8 = 5√2 + 2√2 = 7√2." },
        { id: 42, level: 5, points: 500, equation: "A função f(x) = x² - 6x + 5 possui valor mínimo igual a:", answer: "-4", options: ["-5", "-4", "-3", "0"], explanation: "x = 3; f(3) = 9 - 18 + 5 = -4." },
        { id: 43, level: 5, points: 500, equation: "Uma função quadrática possui raízes 2 e 4. Qual pode ser sua lei?", answer: "x² - 6x + 8", options: ["x² + 6x + 8", "x² - 6x + 8", "x² - 2x + 4", "x² + 2x - 8"], explanation: "(x-2)(x-4) = x² - 6x + 8." },
        { id: 44, level: 5, points: 500, equation: "h(t) = -t² + 6t. Qual é a altura máxima?", answer: "9", options: ["6", "8", "9", "12"], explanation: "t = 3; h(3) = -9 + 18 = 9." },
        { id: 45, level: 5, points: 500, equation: "Para f(x) = -2x² + 8x + 1, em qual valor de x ocorre o máximo?", answer: "2", options: ["1", "2", "3", "4"], explanation: "x = -b/2a = -8/-4 = 2." },
        { id: 46, level: 5, points: 500, equation: "Resolva: 2ˣ + 2ˣ⁺¹ = 24.", answer: "3", options: ["2", "3", "4", "5"], explanation: "3 · 2ˣ = 24 → 2ˣ = 8 → x = 3." },
        { id: 47, level: 5, points: 500, equation: "Resolva: 3ˣ + 3ˣ = 54.", answer: "3", options: ["2", "3", "4", "5"], explanation: "2 · 3ˣ = 54 → 3ˣ = 27 → x = 3." },
        { id: 48, level: 5, points: 500, equation: "Resolva: 4ˣ - 5 · 2ˣ + 4 = 0.", answer: "x = 0 e x = 2", options: ["x = 0 e x = 1", "x = 0 e x = 2", "x = 1 e x = 2", "x = 2 e x = 3"], explanation: "Fazendo y = 2ˣ: y² - 5y + 4 = 0 → y = 1 ou y = 4 → x = 0 ou x = 2." },
        { id: 49, level: 5, points: 500, equation: "Uma população começa com 500 indivíduos e dobra a cada período. Qual será a população após 4 períodos?", answer: "8.000", options: ["2.000", "4.000", "8.000", "16.000"], explanation: "500 · 2⁴ = 500 · 16 = 8.000." },
        { id: 50, level: 5, points: 500, equation: "Uma função exponencial passa pelos pontos (0, 2) e (1, 6). Qual é a sua lei?", answer: "f(x) = 2 · 3ˣ", options: ["f(x) = 2 · 3ˣ", "f(x) = 3 · 2ˣ", "f(x) = 2 · 6ˣ", "f(x) = 6 · 2ˣ"], explanation: "a = f(0) = 2; f(1) = 2b = 6 → b = 3. f(x) = 2 · 3ˣ." }

    ];


    /* =========================================================
       ESTADO
    ========================================================= */

    const state = {
        currentRound: 1,
        currentQuestions: [],
        selectedQuestion: null,
        usedQuestionIds: new Set(),
        selectionLocked: true,
        hasAnswered: false,
        pendingTimeouts: []
    };


    /* =========================================================
       UTILITÁRIOS
    ========================================================= */

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];

    const shuffleArray = (array) => {
        const copy = [...array];

        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }

        return copy;
    };

    /*
     * Gera uma permutação aleatória de 0..length-1 que nunca
     * é a identidade, para garantir que o embaralhamento
     * sempre mova as cartas de lugar de verdade.
     */
    const randomPermutation = (length) => {
        const indices = shuffleArray(
            Array.from({ length }, (_, i) => i)
        );

        const isIdentity = indices.every((value, i) => value === i);

        if (isIdentity && length > 1) {
            [indices[0], indices[1]] = [indices[1], indices[0]];
        }

        return indices;
    };

    const clearPendingTimeouts = () => {
        state.pendingTimeouts.forEach((id) => window.clearTimeout(id));
        state.pendingTimeouts = [];
    };

    const setRoundStatus = (eyebrow, title) => {
        const statusElement = $("#round-status");
        const titleElement = $("#round-title");

        if (statusElement) statusElement.textContent = eyebrow;
        if (titleElement) titleElement.textContent = title;
    };


    /* =========================================================
       SELEÇÃO DAS QUESTÕES DA FASE
    ========================================================= */

    const pickQuestionsForRound = (round) => {

        const levels = PHASE_LEVELS[
            Math.min(round, PHASE_LEVELS.length) - 1
        ] || PHASE_LEVELS[PHASE_LEVELS.length - 1];

        return levels.map((level) => {

            const unused = QUESTIONS.filter(
                (question) =>
                    question.level === level &&
                    !state.usedQuestionIds.has(question.id)
            );

            const pool = unused.length > 0
                ? unused
                : QUESTIONS.filter((question) => question.level === level);

            const chosen = pool[Math.floor(Math.random() * pool.length)];

            state.usedQuestionIds.add(chosen.id);

            return chosen;
        });
    };


    /* =========================================================
       RENDERIZAÇÃO DAS CARTAS
    ========================================================= */

    const renderQuestionCards = () => {

        const board = $("#equation-board");

        if (!board) {
            return;
        }

        board.classList.remove("shuffle-mode", "board-compact");

        // Remove qualquer estilo inline (posição/tamanho) deixado
        // pela fase de embaralhamento da rodada anterior.
        board.innerHTML = "";

        state.currentQuestions.forEach((question) => {

            const card = document.createElement("div");

            card.className = "equation-card";
            card.dataset.id = String(question.id);
            card.setAttribute("role", "button");
            card.setAttribute("tabindex", "0");
            card.setAttribute(
                "aria-label",
                `Equação valendo ${question.points} pontos`
            );

            const inner = document.createElement("div");
            inner.className = "card-inner";

            const front = document.createElement("div");
            front.className = "card-face card-front";
            front.innerHTML = `
                <span class="card-points">${question.points} pts</span>
                <span class="card-equation">${question.equation}</span>
                <span class="card-status">Nível ${question.level}</span>
            `;

            const back = document.createElement("div");
            back.className = "card-face card-back";
            back.innerHTML = `<span class="card-back-symbol">?</span>`;

            inner.appendChild(front);
            inner.appendChild(back);
            card.appendChild(inner);
            board.appendChild(card);
        });
    };


    /* =========================================================
       FASE DE MEMORIZAÇÃO E EMBARALHAMENTO
    ========================================================= */

    const startMemorizePhase = () => {

        setRoundStatus(
            "MEMORIZE AS EQUAÇÕES",
            "Decorem a posição de cada equação"
        );

        const memorizeTime = getMemorizeTime(state.currentRound);

        const timeoutId = window.setTimeout(() => {
            startShufflePhase();
        }, memorizeTime);

        state.pendingTimeouts.push(timeoutId);
    };

    const startShufflePhase = () => {

        const board = $("#equation-board");
        const cards = $$(".equation-card", board);

        if (!board || cards.length === 0) {
            return;
        }

        setRoundStatus("EMBARALHANDO...", "Preparando o desafio");

        // Captura a posição real de cada carta no layout em
        // flex ANTES de trocar para posicionamento absoluto,
        // para que a troca de modo não desloque nada visualmente
        // (é a mesma posição, só que agora "presa" via left/top).
        const boardRect = board.getBoundingClientRect();

        const slots = cards.map((card) => {
            const rect = card.getBoundingClientRect();

            return {
                left: rect.left - boardRect.left,
                top: rect.top - boardRect.top,
                width: rect.width,
                height: rect.height
            };
        });

        cards.forEach((card, index) => {
            card.style.width = `${slots[index].width}px`;
            card.style.height = `${slots[index].height}px`;
            card.style.left = `${slots[index].left}px`;
            card.style.top = `${slots[index].top}px`;
        });

        // Só agora o CSS passa a tratar as cartas como
        // position: absolute — como já fixamos left/top acima,
        // nenhuma carta pula ou some nesse instante.
        board.classList.add("shuffle-mode");

        const flipTimeoutId = window.setTimeout(() => {

            cards.forEach((card) => card.classList.add("flipped"));

            const totalPasses = getShufflePasses(state.currentRound);

            const shuffleStartId = window.setTimeout(() => {
                runShuffleSequence(cards, slots, 0, totalPasses);
            }, ANIMATION.FLIP_TIME + 100);

            state.pendingTimeouts.push(shuffleStartId);

        }, 150);

        state.pendingTimeouts.push(flipTimeoutId);
    };

    const runShuffleSequence = (cards, slots, passIndex, totalPasses) => {

        const permutation = randomPermutation(cards.length);

        cards.forEach((card, index) => {
            const target = slots[permutation[index]];
            card.style.left = `${target.left}px`;
            card.style.top = `${target.top}px`;
        });

        if (passIndex < totalPasses - 1) {

            const nextId = window.setTimeout(() => {
                runShuffleSequence(cards, slots, passIndex + 1, totalPasses);
            }, ANIMATION.SHUFFLE_STEP_TIME);

            state.pendingTimeouts.push(nextId);

        } else {

            const finishId = window.setTimeout(() => {
                finishShuffle();
            }, ANIMATION.SHUFFLE_STEP_TIME);

            state.pendingTimeouts.push(finishId);
        }
    };

    const finishShuffle = () => {
        state.selectionLocked = false;

        setRoundStatus(
            "ESCOLHA UMA CARTA",
            "Qual equação a dupla quer resolver?"
        );
    };


    /* =========================================================
       SELEÇÃO DE UMA CARTA
    ========================================================= */

    const showSelectedQuestion = (question) => {

        const section = $("#selected-question");
        const level = $("#question-level");
        const points = $("#question-points");
        const text = $("#question-text");

        if (level) level.textContent = question.level;
        if (points) points.textContent = question.points;
        if (text) text.textContent = question.equation;

        if (section) section.hidden = false;
    };

    const renderAnswers = (question) => {

        const container = $("#answers");

        if (!container) {
            return;
        }

        const buttons = $$(".answer-option", container);
        const options = shuffleArray(question.options);

        buttons.forEach((button, index) => {
            const optionText = options[index] ?? "";
            const textElement = $(".answer-text", button);

            if (textElement) {
                textElement.textContent = optionText;
            }

            button.dataset.answer = optionText;
            button.disabled = false;
        });

        container.hidden = false;
    };

    const selectQuestion = (id) => {

        if (state.selectionLocked || state.selectedQuestion || state.hasAnswered) {
            return;
        }

        const question = state.currentQuestions.find(
            (item) => item.id === id
        );

        if (!question) {
            return;
        }

        state.selectedQuestion = question;
        state.selectionLocked = true;

        const board = $("#equation-board");
        const cards = $$(".equation-card", board);

        cards.forEach((card) => {
            const isChosen = Number(card.dataset.id) === question.id;
            card.classList.toggle("selected", isChosen);
            card.classList.toggle("disabled", !isChosen);

            // A carta escolhida vira de volta para mostrar a
            // equação (em vez de continuar de costas com o "?").
            if (isChosen) {
                card.classList.remove("flipped");
            }
        });

        if (board) {
            board.classList.add("board-compact");
        }

        showSelectedQuestion(question);
        renderAnswers(question);

        setRoundStatus("RESOLVA A EQUAÇÃO", "Escolham a alternativa correta");

        // O cronômetro só começa agora, com a duração que
        // corresponde ao nível de dificuldade da carta escolhida.
        if (
            window.GameApp &&
            typeof window.GameApp.startTimerForLevel === "function"
        ) {
            window.GameApp.startTimerForLevel(question.level);
        }
    };


    /* =========================================================
       RESPOSTA E FEEDBACK
    ========================================================= */

    const submitAnswer = (selectedAnswer) => {

        if (state.hasAnswered || !state.selectedQuestion) {
            return;
        }

        state.hasAnswered = true;

        if (
            window.GameApp &&
            typeof window.GameApp.stopTimer === "function"
        ) {
            window.GameApp.stopTimer();
        }

        const question = state.selectedQuestion;
        const isCorrect = selectedAnswer === question.answer;

        if (
            window.ScoreManager &&
            typeof window.ScoreManager.registerAnswer === "function"
        ) {
            window.ScoreManager.registerAnswer({
                question,
                selectedAnswer,
                isCorrect
            });
        }

        showFeedback(question, selectedAnswer, isCorrect);
    };

    const forceTimeout = () => {

        if (state.hasAnswered || !state.selectedQuestion) {
            return;
        }

        state.hasAnswered = true;

        const question = state.selectedQuestion;

        if (
            window.ScoreManager &&
            typeof window.ScoreManager.registerAnswer === "function"
        ) {
            window.ScoreManager.registerAnswer({
                question,
                selectedAnswer: null,
                isCorrect: false
            });
        }

        showFeedback(question, null, false);
    };

    const showFeedback = (question, selectedAnswer, isCorrect) => {

        const feedback = $("#answer-feedback");

        if (!feedback) {
            return;
        }

        const status = $("#feedback-status");
        const message = $("#feedback-message");
        const correctAnswer = $("#correct-answer");
        const solution = $("#solution-text");

        feedback.hidden = false;

        feedback.classList.remove("feedback-correct", "feedback-wrong");
        feedback.classList.add(isCorrect ? "feedback-correct" : "feedback-wrong");

        if (status) {
            status.textContent = isCorrect ? "Correto!" : "Incorreto!";
        }

        if (message) {
            message.textContent = selectedAnswer === null
                ? `Tempo esgotado! Você perdeu ${question.points} pontos.`
                : isCorrect
                    ? `Você ganhou ${question.points} pontos.`
                    : `Você perdeu ${question.points} pontos.`;
        }

        if (correctAnswer) {
            correctAnswer.textContent = question.answer;
        }

        if (solution) {
            solution.textContent = question.explanation;
        }

        document.querySelectorAll(".answer-option").forEach(button => {
            button.disabled = true;
        });
    };


    /* =========================================================
       CONTROLE DE RODADA
    ========================================================= */

    const hideSelectedQuestion = () => {
        const element = $("#selected-question");
        if (element) element.hidden = true;
    };

    const hideFeedback = () => {
        const feedback = $("#answer-feedback");
        if (feedback) feedback.hidden = true;
    };

    const hideAnswers = () => {
        const container = $("#answers");
        if (container) container.hidden = true;
    };

    const updatePhaseIndicator = (round) => {

        const indicator = $("#phase-indicator");

        if (!indicator) {
            return;
        }

        indicator.textContent = round;
    };

    const prepareRound = () => {

        clearPendingTimeouts();

        state.currentQuestions = pickQuestionsForRound(state.currentRound);
        state.selectedQuestion = null;
        state.selectionLocked = true;
        state.hasAnswered = false;

        updatePhaseIndicator(state.currentRound);

        renderQuestionCards();

        hideSelectedQuestion();
        hideFeedback();
        hideAnswers();

        startMemorizePhase();
    };

    const nextRound = (round) => {
        state.currentRound = round;
        prepareRound();
    };


    /* =========================================================
       EVENTOS
    ========================================================= */

    const initBoardEvents = () => {

        const board = $("#equation-board");

        if (!board) {
            return;
        }

        board.addEventListener("click", (event) => {
            const card = event.target.closest(".equation-card");

            if (!card || card.classList.contains("disabled")) {
                return;
            }

            selectQuestion(Number(card.dataset.id));
        });

        board.addEventListener("keydown", (event) => {

            if (event.key !== "Enter" && event.key !== " ") {
                return;
            }

            const card = event.target.closest(".equation-card");

            if (!card || card.classList.contains("disabled")) {
                return;
            }

            event.preventDefault();
            selectQuestion(Number(card.dataset.id));
        });
    };

    const initAnswerEvents = () => {

        const container = $("#answers");

        if (!container) {
            return;
        }

        container.addEventListener("click", (event) => {
            const button = event.target.closest(".answer-option");

            if (!button || button.disabled) {
                return;
            }

            submitAnswer(button.dataset.answer);
        });
    };


    /* =========================================================
       INICIALIZAÇÃO
    ========================================================= */

    const init = () => {

        state.currentRound = 1;
        state.usedQuestionIds = new Set();

        initBoardEvents();
        initAnswerEvents();

        prepareRound();
    };


    /* =========================================================
       API PÚBLICA
    ========================================================= */

    return {

        init,
        nextRound,

        selectQuestion,
        submitAnswer,
        forceTimeout,

        getQuestionById: (id) => QUESTIONS.find((q) => q.id === id) || null,

        getCurrentQuestions: () => [...state.currentQuestions],
        getSelectedQuestion: () => state.selectedQuestion,
        getAllQuestions: () => [...QUESTIONS]

    };

})();


/*
 * Disponibiliza o gerenciador para os outros scripts.
 */
window.QuestionManager = QuestionManager;
