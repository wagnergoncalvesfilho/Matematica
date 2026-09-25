"use strict";

/*
 * EQUAÇÃO EM FOCO
 * pontuacao.js
 *
 * Responsável por:
 * - registrar acertos e erros da dupla;
 * - somar/subtrair pontos a cada resposta;
 * - manter o placarzinho do cabeçalho atualizado durante o jogo;
 * - preparar os dados (pontuação final + mensagem de desempenho)
 *   para a tela de resultado.
 */

const ScoreManager = (() => {

    /* =========================================================
       CONFIGURAÇÃO
    ========================================================= */

    const CONFIG = {
        STORAGE_KEY: "equacaoEmFocoScore"
    };


    /* =========================================================
       ESTADO
    ========================================================= */

    const state = {
        score: 0,
        correct: 0,
        wrong: 0
    };


    /* =========================================================
       INICIALIZAÇÃO
    ========================================================= */

    const init = () => {
        loadState();
        updateScoreDisplay();
    };


    /* =========================================================
       REGISTRO DA RESPOSTA
    ========================================================= */

    const registerAnswer = ({
        question,
        selectedAnswer,
        isCorrect
    }) => {

        if (!question) {
            return null;
        }

        const points = Number(question.points) || 0;

        if (isCorrect) {
            state.score += points;
            state.correct++;
        } else {
            state.score -= points;
            state.wrong++;
        }

        saveState();
        updateScoreDisplay();

        return {
            selectedAnswer,
            correctAnswer: question.answer,
            isCorrect,
            pointsChanged: isCorrect ? points : -points,
            currentScore: state.score
        };
    };


    /* =========================================================
       EXIBIÇÃO DO PLACAR DURANTE O JOGO
    ========================================================= */

    const updateScoreDisplay = () => {

        const scoreElement =
            document.querySelector("#score");

        if (scoreElement) {
            scoreElement.textContent = state.score;
        }
    };


    /* =========================================================
       MENSAGEM DE DESEMPENHO
    ========================================================= */

    const getPerformanceMessage = () => {

        const total = state.correct + state.wrong;

        if (total === 0) {
            return "Fim de jogo!";
        }

        const ratio = state.correct / total;

        if (ratio >= 0.8) {
            return "Mandou muito bem! Vocês dominam as equações.";
        }

        if (ratio >= 0.5) {
            return "Bom jogo! Continuem praticando para ir ainda mais longe.";
        }

        return "Continuem treinando — na próxima vocês vão mais longe!";
    };


    /* =========================================================
       RESULTADO FINAL
    ========================================================= */

    const renderResult = () => {

        const scoreElement =
            document.querySelector("#final-player-score");

        const messageElement =
            document.querySelector("#performance-message");

        if (scoreElement) {
            scoreElement.textContent = state.score;
        }

        if (messageElement) {
            messageElement.textContent = getPerformanceMessage();
        }

        updateResultSummary();
    };


    const updateResultSummary = () => {

        const totalRounds =
            document.querySelector("#total-rounds");

        const totalCorrect =
            document.querySelector("#total-correct");

        const totalWrong =
            document.querySelector("#total-wrong");

        const finalScore =
            document.querySelector("#final-score");

        if (totalCorrect) {
            totalCorrect.textContent = state.correct;
        }

        if (totalWrong) {
            totalWrong.textContent = state.wrong;
        }

        if (finalScore) {
            finalScore.textContent = state.score;
        }

        if (totalRounds) {

            const gameState =
                sessionStorage.getItem("equacaoEmFocoGame");

            if (gameState) {

                try {

                    const data = JSON.parse(gameState);

                    totalRounds.textContent =
                        data.currentRound || 0;

                } catch {
                    totalRounds.textContent = 0;
                }
            }
        }
    };


    /* =========================================================
       STORAGE
    ========================================================= */

    const saveState = () => {

        sessionStorage.setItem(
            CONFIG.STORAGE_KEY,
            JSON.stringify(state)
        );
    };


    const loadState = () => {

        const saved =
            sessionStorage.getItem(CONFIG.STORAGE_KEY);

        if (!saved) {
            return;
        }

        try {

            const data = JSON.parse(saved);

            state.score = Number(data.score) || 0;
            state.correct = Number(data.correct) || 0;
            state.wrong = Number(data.wrong) || 0;

        } catch (error) {

            console.error(
                "Não foi possível carregar a pontuação.",
                error
            );
        }
    };


    const reset = () => {

        state.score = 0;
        state.correct = 0;
        state.wrong = 0;

        sessionStorage.removeItem(CONFIG.STORAGE_KEY);
    };


    /* =========================================================
       GETTERS
    ========================================================= */

    const getScore = () => state.score;

    const getStats = () => ({ ...state });


    /* =========================================================
       API PÚBLICA
    ========================================================= */

    return {

        init,

        registerAnswer,

        getScore,
        getStats,

        renderResult,
        reset

    };

})();


/*
 * Disponibiliza o gerenciador para os outros scripts.
 */
window.ScoreManager = ScoreManager;


/*
 * Se estivermos na tela de resultado,
 * renderiza o placar automaticamente.
 */
document.addEventListener("DOMContentLoaded", () => {

    if (
        window.location.pathname.includes(
            "resultado.html"
        )
    ) {
        ScoreManager.init();
        ScoreManager.renderResult();
    }

});
