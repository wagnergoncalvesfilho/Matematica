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
       (6 fases, 4 cartas por fase, 3 níveis de dificuldade)

       Fase 1, 2 e 3 — Igualação de bases:      todas fáceis
       Fase 4 e 5    — Fator comum em evidência: todas médias
       Fase 6        — Mudança de variável:      todas difíceis
    ========================================================= */

    const PHASE_LEVELS = [
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [2, 2, 2, 2],
        [2, 2, 2, 2],
        [3, 3, 3, 3]
    ];

    const LEVEL_LABELS = {
        1: "Fácil",
        2: "Médio",
        3: "Difícil"
    };


    /* =========================================================
       BANCO DE QUESTÕES
       Equações exponenciais — Ensino Médio
    ========================================================= */

    const QUESTIONS = [

        /* FÁCIL — Igualação de bases (10 pontos) */
        { id: 1, level: 1, points: 10, equation: "2ˣ = 16", answer: "x = 4", options: ["x = 2", "x = 3", "x = 4", "x = 5"], explanation: "16 = 2⁴, logo x = 4." },
        { id: 2, level: 1, points: 10, equation: "4ˣ = 64", answer: "x = 3", options: ["x = 2", "x = 3", "x = 4", "x = 6"], explanation: "64 = 4³, logo x = 3." },
        { id: 3, level: 1, points: 10, equation: "7ˣ = 49", answer: "x = 2", options: ["x = 1", "x = 2", "x = 3", "x = 7"], explanation: "49 = 7², logo x = 2." },
        { id: 4, level: 1, points: 10, equation: "3ˣ = 81", answer: "x = 4", options: ["x = 2", "x = 3", "x = 4", "x = 5"], explanation: "81 = 3⁴, logo x = 4." },
        { id: 5, level: 1, points: 10, equation: "5ˣ = 125", answer: "x = 3", options: ["x = 2", "x = 3", "x = 4", "x = 5"], explanation: "125 = 5³, logo x = 3." },
        { id: 6, level: 1, points: 10, equation: "6ˣ = 216", answer: "x = 3", options: ["x = 2", "x = 3", "x = 4", "x = 6"], explanation: "216 = 6³, logo x = 3." },
        { id: 7, level: 1, points: 10, equation: "2ˣ = 8", answer: "x = 3", options: ["x = 1", "x = 2", "x = 3", "x = 4"], explanation: "8 = 2³, logo x = 3." },
        { id: 8, level: 1, points: 10, equation: "3ˣ⁺¹ = 27", answer: "x = 2", options: ["x = 1", "x = 2", "x = 3", "x = 4"], explanation: "27 = 3³, então x + 1 = 3, logo x = 2." },
        { id: 9, level: 1, points: 10, equation: "5²ˣ = 25", answer: "x = 1", options: ["x = 1", "x = 2", "x = 3", "x = 4"], explanation: "25 = 5², então 2x = 2, logo x = 1." },
        { id: 10, level: 1, points: 10, equation: "4ˣ⁺¹ = 256", answer: "x = 3", options: ["x = 1", "x = 2", "x = 3", "x = 4"], explanation: "256 = 4⁴, então x + 1 = 4, logo x = 3." },
        { id: 11, level: 1, points: 10, equation: "8ˣ⁻² = 64", answer: "x = 4", options: ["x = 2", "x = 3", "x = 4", "x = 5"], explanation: "64 = 8², então x - 2 = 2, logo x = 4." },
        { id: 12, level: 1, points: 10, equation: "9²ˣ⁺¹ = 729", answer: "x = 1", options: ["x = 1", "x = 2", "x = 3", "x = 4"], explanation: "729 = 9³, então 2x + 1 = 3, logo x = 1." },

        /* MÉDIO — Fator comum em evidência (25 pontos) */
        { id: 13, level: 2, points: 25, equation: "2³ · 2ˣ + 2ˣ = 72", answer: "x = 3", options: ["x = 2", "x = 3", "x = 4", "x = 5"], explanation: "9 · 2ˣ = 72 → 2ˣ = 8 = 2³, logo x = 3." },
        { id: 14, level: 2, points: 25, equation: "(3²)ˣ - 4 · 3ˣ + 3 = 0", answer: "x = 0 ou x = 1", options: ["x = 0 ou x = 2", "x = 1 ou x = 2", "x = 0 ou x = 1", "x = -1 ou x = 1"], explanation: "y = 3ˣ: y² - 4y + 3 = 0 → (y-1)(y-3) = 0 → x = 0 ou x = 1." },
        { id: 15, level: 2, points: 25, equation: "4 · (2²)ˣ - 5 · 2ˣ + 1 = 0", answer: "x = -2 ou x = 0", options: ["x = -1 ou x = 0", "x = -2 ou x = 0", "x = 1 ou x = 2", "x = -2 ou x = 2"], explanation: "y = 2ˣ: 4y² - 5y + 1 = 0 → y = 1 ou y = ¼ → x = 0 ou x = -2." },
        { id: 16, level: 2, points: 25, equation: "2 · (2²)ˣ + 5 · 2ˣ - 3 = 0", answer: "x = -1", options: ["x = -2", "x = -1", "x = 1", "x = 2"], explanation: "y = 2ˣ: 2y² + 5y - 3 = 0 → y = ½ → 2ˣ = 2⁻¹, logo x = -1." },
        { id: 17, level: 2, points: 25, equation: "3 · 3ˣ + 3⁻¹ · 3ˣ = 90", answer: "x = 3", options: ["x = 1", "x = 2", "x = 3", "x = 4"], explanation: "(10/3) · 3ˣ = 90 → 3ˣ = 27, logo x = 3." },
        { id: 18, level: 2, points: 25, equation: "2ˣ⁺¹ + 2ˣ = 48", answer: "x = 4", options: ["x = 2", "x = 3", "x = 4", "x = 5"], explanation: "3 · 2ˣ = 48 → 2ˣ = 16, logo x = 4." },
        { id: 19, level: 2, points: 25, equation: "3ˣ⁺² - 3ˣ = 72", answer: "x = 2", options: ["x = 1", "x = 2", "x = 3", "x = 4"], explanation: "8 · 3ˣ = 72 → 3ˣ = 9, logo x = 2." },
        { id: 20, level: 2, points: 25, equation: "2ˣ + 2ˣ⁺¹ + 2ˣ⁺² = 56", answer: "x = 3", options: ["x = 1", "x = 2", "x = 3", "x = 4"], explanation: "2ˣ(1+2+4) = 56 → 2ˣ = 8, logo x = 3." },

        /* DIFÍCIL — Mudança de variável (40 pontos) */
        { id: 21, level: 3, points: 40, equation: "9ˣ + 6ˣ = 2 · 4ˣ", answer: "x = 0", options: ["x = -1", "x = 0", "x = 1", "x = 2"], explanation: "Dividindo por 4ˣ, em x = 0 ambos os lados valem 2, logo x = 0." },
        { id: 22, level: 3, points: 40, equation: "4ˣ - 3 · 2ˣ⁺¹ + 8 = 0", answer: "x = 1 ou x = 2", options: ["x = 0 ou x = 1", "x = 1 ou x = 2", "x = 2 ou x = 3", "x = -1 ou x = 2"], explanation: "y = 2ˣ: y² - 6y + 8 = 0 → (y-2)(y-4) = 0 → x = 1 ou x = 2." },
        { id: 23, level: 3, points: 40, equation: "3²ˣ - 10 · 3ˣ + 9 = 0", answer: "x = 0 ou x = 2", options: ["x = 0 ou x = 1", "x = 1 ou x = 2", "x = 0 ou x = 2", "x = -1 ou x = 2"], explanation: "y = 3ˣ: y² - 10y + 9 = 0 → (y-1)(y-9) = 0 → x = 0 ou x = 2." },
        { id: 24, level: 3, points: 40, equation: "2ˣ⁺² + 2ˣ⁺¹ + 2ˣ + 2ˣ⁻¹ = 30", answer: "x = 2", options: ["x = 1", "x = 2", "x = 3", "x = 4"], explanation: "2ˣ⁻¹(8+4+2+1) = 30 → 2ˣ⁻¹ = 2, logo x = 2." }

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

        board.hidden = false;
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
                `Equação ${LEVEL_LABELS[question.level]}, valendo ${question.points} pontos`
            );

            const inner = document.createElement("div");
            inner.className = "card-inner";

            const front = document.createElement("div");
            front.className = "card-face card-front";
            front.innerHTML = `
                <span class="card-points">${question.points} pts</span>
                <span class="card-equation">${question.equation}</span>
                <span class="card-status">${LEVEL_LABELS[question.level]}</span>
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

        if (level) level.textContent = LEVEL_LABELS[question.level];
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

        // Esconde o tabuleiro de cartas por completo: a carta
        // escolhida "vira" a própria questão ampliada logo abaixo,
        // em vez de deixar as cartas pequenas (ainda posicionadas
        // do embaralhamento) sobrepostas ao conteúdo.
        const board = $("#equation-board");
        if (board) {
            board.hidden = true;
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
