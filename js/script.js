"use strict";

/*
 * EQUAÇÃO EM FOCO
 * script.js
 *
 * Responsável por:
 * - detectar a página atual;
 * - controlar elementos gerais da interface;
 * - iniciar o jogo;
 * - controlar tutorial;
 * - controlar o timer de cada questão (varia de 1 a 5 minutos
 *   conforme o nível de dificuldade da carta escolhida pela dupla);
 * - conectar a interface aos módulos de questões e pontuação.
 *
 * Questões: js/questoes.js
 * Pontuação: js/pontuacao.js
 */

const GameApp = (() => {

    /* =========================================================
       CONFIGURAÇÕES
    ========================================================= */

    const CONFIG = {
        TOTAL_ROUNDS: 10
    };


    /* =========================================================
       TEMPO DE RESPOSTA POR DIFICULDADE
       Nível 1 (Super Fácil)  → 1 minuto
       Nível 2 (Fácil)        → 2 minutos
       Nível 3 (Médio)        → 3 minutos
       Nível 4 (Difícil)      → 4 minutos
       Nível 5 (Super Difícil) → 5 minutos
    ========================================================= */

    const TIME_BY_DIFFICULTY = {
        1: 1 * 60,
        2: 2 * 60,
        3: 3 * 60,
        4: 4 * 60,
        5: 5 * 60
    };


    /* =========================================================
       ESTADO DA APLICAÇÃO
    ========================================================= */

    const state = {
        currentRound: 1,
        remainingTime: null,
        timerId: null,
        gameStarted: false
    };


    /* =========================================================
       UTILITÁRIOS
    ========================================================= */

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];


    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    };


    /* =========================================================
       DETECÇÃO DA PÁGINA
    ========================================================= */

    const getPage = () => {
        const path = window.location.pathname;

        if (path.includes("jogo.html")) {
            return "game";
        }

        if (path.includes("tutorial.html")) {
            return "tutorial";
        }

        if (path.includes("resultado.html")) {
            return "result";
        }

        return "home";
    };


    /* =========================================================
       HOME
    ========================================================= */

    const initHome = () => {
        const startButtons = $$(
            'a[href*="jogo.html"], a[href*="tutorial.html"]'
        );

        startButtons.forEach((button) => {
            button.addEventListener("click", () => {
                sessionStorage.removeItem("equacaoEmFoco");
            });
        });
    };


    /* =========================================================
       TUTORIAL
    ========================================================= */

    const initTutorial = () => {
        const skipButton = $(".skip-tutorial");

        if (!skipButton) {
            return;
        }

        skipButton.addEventListener("click", () => {
            sessionStorage.setItem("tutorialSkipped", "true");
        });
    };


    /* =========================================================
       TIMER DA QUESTÃO
    ========================================================= */

    const updateTimerDisplay = () => {
        const timerElement = $("#timer");

        if (!timerElement) {
            return;
        }

        if (state.remainingTime === null) {
            timerElement.textContent = "--:--";
            timerElement.classList.remove("timer-warning", "timer-danger");
            return;
        }

        timerElement.textContent = formatTime(state.remainingTime);

        timerElement.classList.toggle(
            "timer-warning",
            state.remainingTime <= 60
        );

        timerElement.classList.toggle(
            "timer-danger",
            state.remainingTime <= 30
        );
    };


    const stopTimer = () => {
        if (state.timerId !== null) {
            clearInterval(state.timerId);
            state.timerId = null;
        }
    };


    /*
     * Limpa o timer e deixa o mostrador em "--:--", usado
     * enquanto a dupla ainda não escolheu uma carta (durante
     * a memorização e o embaralhamento).
     */
    const resetTimerDisplay = () => {
        stopTimer();
        state.remainingTime = null;
        updateTimerDisplay();
    };


    /*
     * Inicia o cronômetro de resposta com a duração que
     * corresponde ao nível de dificuldade da carta que a
     * dupla acabou de escolher (1 a 5 minutos). Chamado pelo
     * QuestionManager assim que uma carta é selecionada.
     */
    const startTimerForLevel = (level) => {

        stopTimer();

        state.remainingTime =
            TIME_BY_DIFFICULTY[level] || TIME_BY_DIFFICULTY[5];

        updateTimerDisplay();

        state.timerId = setInterval(() => {

            state.remainingTime--;

            updateTimerDisplay();

            if (state.remainingTime <= 0) {
                state.remainingTime = 0;

                updateTimerDisplay();
                stopTimer();
                handleTimeExpired();
            }

        }, 1000);
    };


    /*
     * Quando o tempo de uma questão acaba: registra o
     * tempo esgotado. A dupla vê o feedback normalmente e
     * avança clicando em "Próxima rodada", assim como numa
     * resposta certa ou errada.
     */
    const handleTimeExpired = () => {

        if (
            window.QuestionManager &&
            typeof window.QuestionManager.forceTimeout === "function"
        ) {
            window.QuestionManager.forceTimeout();
        }
    };


    /* =========================================================
       RODADAS
    ========================================================= */

    const updateRoundDisplay = () => {
        const roundElements = [
            $("#round-number"),
            $("#current-round")
        ];

        roundElements.forEach((element) => {
            if (element) {
                element.textContent = state.currentRound;
            }
        });
    };


    const updateTotalRounds = () => {
        const totalRounds = $("#total-rounds");

        if (totalRounds) {
            totalRounds.textContent = CONFIG.TOTAL_ROUNDS;
        }
    };


    const nextRound = () => {
        if (state.currentRound >= CONFIG.TOTAL_ROUNDS) {
            finishGame();
            return;
        }

        state.currentRound++;

        updateRoundDisplay();

        /*
         * O módulo de questões assume o controle da
         * renderização e da animação da próxima rodada.
         */
        if (
            window.QuestionManager &&
            typeof window.QuestionManager.nextRound === "function"
        ) {
            window.QuestionManager.nextRound(state.currentRound);
        }

        /*
         * O tempo só volta a correr quando a dupla escolher
         * uma nova carta (ver startTimerForLevel).
         */
        resetTimerDisplay();
    };


    /* =========================================================
       FINALIZAÇÃO
    ========================================================= */

    const finishGame = () => {
        stopTimer();

        state.gameStarted = false;

        saveGameState();

        window.location.href = "resultado.html";
    };


    /* =========================================================
       ESTADO DA PARTIDA
    ========================================================= */

    const saveGameState = () => {
        const gameState = {
            currentRound: state.currentRound,
            remainingTime: state.remainingTime
        };

        sessionStorage.setItem(
            "equacaoEmFocoGame",
            JSON.stringify(gameState)
        );
    };


    const clearGameState = () => {
        sessionStorage.removeItem("equacaoEmFocoGame");
    };


    /* =========================================================
       CONTROLES DO JOGO
    ========================================================= */

    const initGameControls = () => {

        const nextRoundButton = $("#next-round");

        if (nextRoundButton) {
            nextRoundButton.addEventListener("click", nextRound);
        }
    };


    /* =========================================================
       INICIALIZAÇÃO DO JOGO
    ========================================================= */

    const initGame = () => {

        clearGameState();

        state.currentRound = 1;
        state.gameStarted = true;

        updateRoundDisplay();
        updateTotalRounds();

        initGameControls();

        /*
         * Inicializa o sistema de questões.
         */
        if (
            window.QuestionManager &&
            typeof window.QuestionManager.init === "function"
        ) {
            window.QuestionManager.init();
        }

        /*
         * Inicializa o sistema de pontuação, sempre
         * zerada no começo de uma nova partida.
         */
        if (
            window.ScoreManager &&
            typeof window.ScoreManager.reset === "function"
        ) {
            window.ScoreManager.reset();
        }

        if (
            window.ScoreManager &&
            typeof window.ScoreManager.init === "function"
        ) {
            window.ScoreManager.init();
        }

        resetTimerDisplay();
    };


    /* =========================================================
       INICIALIZAÇÃO GERAL
    ========================================================= */

    const init = () => {

        const page = getPage();

        switch (page) {

            case "home":
                initHome();
                break;

            case "tutorial":
                initTutorial();
                break;

            case "game":
                initGame();
                break;

            case "result":
                /*
                 * O resultado será controlado pelo pontuacao.js.
                 */
                break;

            default:
                break;
        }
    };


    /* =========================================================
       API PÚBLICA
    ========================================================= */

    return {
        init,
        nextRound,
        finishGame,
        startTimerForLevel,
        stopTimer,
        getState: () => ({ ...state }),
        CONFIG
    };

})();


/* =============================================================
   START
============================================================= */

window.GameApp = GameApp;

document.addEventListener("DOMContentLoaded", () => {
    GameApp.init();
});
