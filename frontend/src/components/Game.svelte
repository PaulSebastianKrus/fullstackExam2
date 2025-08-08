<script>
  import { onMount } from 'svelte';
  import { gameStore } from '../stores/gameStore.js';
  import Question from './Question.svelte';
  import MoneyLadder from './MoneyLadder.svelte';
  import Lifelines from './Lifelines.svelte';
  import { currentUser } from '../stores/generalStore.js';

  export let gameId = null;

  $: gameStatus = $gameStore.gameStatus;
  $: currentQuestion = $gameStore.currentQuestion;
  $: currentLevel = $gameStore.currentLevel;
  $: securedMoney = $gameStore.securedMoney;
  $: moneyWon = $gameStore.moneyWon;
  $: usedLifelines = $gameStore.usedLifelines;
  $: lifelines = $gameStore.lifelines;

  onMount(async () => {
    try {
      await gameStore.startGame(gameId);
    } catch (error) {}
  });

  const handleSubmitAnswer = (answer) => gameStore.submitAnswer(answer);
  const handleQuitGame = () => gameStore.quitGame();
  const handleRestartGame = () => gameStore.startGame(gameId);

  async function useLifeline(lifeline) {
    try {
      await gameStore.useLifeline(lifeline);
    } catch (error) {}
  }

</script>

<div class="game-container">
  <header>
    <h1>Who Wants to Be a Millionaire</h1>

    {#if gameStatus === 'active'}
      <button class="restart-button" on:click={handleRestartGame}> Restart Game </button>
    {/if}
  </header>

  {#if gameStatus === 'loading'}
    <div class="loading">
      <p>Loading game...</p>
    </div>
  {:else if gameStatus === 'active'}
    <div class="game-area">
      <div class="sidebar">
        <Lifelines {usedLifelines} {useLifeline} />

        {#if lifelines?.friendAdvice}
          <div class="lifeline-feedback friend-advice">
            <h4>Phone A Friend</h4>
            <div class="friend-container">
              <div class="friend-message">
                <p class="advice">Your friend says:</p>
                <p class="answer-text">Answer: <span class="answer">{lifelines.friendAdvice.friendAnswer}</span></p>
              </div>
            </div>
          </div>
        {/if}

        {#if lifelines?.audienceResults}
          <div class="lifeline-feedback audience-results">
            <h4>Audience Results</h4>
            <div class="chart">
              {#each ['A', 'B', 'C', 'D'] as letter}
                <div class="chart-column">
                  <div class="percentage">{lifelines.audienceResults[letter]}%</div>
                  <div class="bar-container">
                    <div class="bar" style="height: {lifelines.audienceResults[letter]}%"></div>
                  </div>
                  <div class="letter">{letter}</div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <div class="main-content">
        <div class="question-area">
          {#key currentLevel}
            <Question
              question={currentQuestion?.question || ''}
              options={currentQuestion?.options || []}
              level={currentLevel}
              submitAnswer={handleSubmitAnswer}
              fiftyFiftyOptions={lifelines?.fiftyFiftyOptions}
            />
          {/key}

          <div class="controls">
            <button class="quit-button" on:click={handleQuitGame}>
              Walk Away with ${(securedMoney || 0).toLocaleString()}
            </button>
          </div>
        </div>
      </div>

      <div class="ladder-container">
        <MoneyLadder {currentLevel} />
      </div>
    </div>
  {:else if gameStatus === 'won'}
    <div class="game-result win">
      <h2>Congratulations!</h2>
      <p>You won:</p>
      <p class="money-won">${(moneyWon || 0).toLocaleString()}</p>
      <div class="buttons">
        <button class="btn-primary" on:click={handleRestartGame}>Play Again</button>
        <button class="btn-secondary" on:click={() => (window.location.href = '/game-select')}>Back to Games</button>
      </div>
    </div>
  {:else if gameStatus === 'failed'}
    <div class="game-result lose">
      <h2>Game Over</h2>
      <p>You lost with:</p>
      <p class="money-won">${(moneyWon || 0).toLocaleString()}</p>
      <div class="buttons">
        <button class="btn-primary" on:click={handleRestartGame}>Try Again</button>
        <button class="btn-secondary" on:click={() => (window.location.href = '/game-select')}>Back to Games</button>
      </div>
    </div>
  {:else if gameStatus === 'quit'}
    <div class="game-result quit">
      <h2>You walked away with:</h2>
      <p class="money-won">${(moneyWon || securedMoney || 0).toLocaleString()}</p>
      <div class="buttons">
        <button class="btn-primary" on:click={handleRestartGame}>Play Again</button>
        <button class="btn-secondary" on:click={() => (window.location.href = '/game-select')}>Back to Games</button>
      </div>
    </div>
  {:else}
    <div class="error">
      <p>Something went wrong. Please try again.</p>
      <button class="btn-primary" on:click={handleRestartGame}>Restart</button>
    </div>
  {/if}
</div>

<style>
  .game-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }

  .game-area {
    display: grid;
    grid-template-columns: 200px 1fr 220px;
    gap: 20px;
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .question-area {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .controls {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
  }

  .quit-button {
    padding: 0.75rem 1.5rem;
    background-color: #ff4500;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
  }

  .loading,
  .error {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50vh;
    font-size: 1.5rem;
  }

  .restart-button {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    padding: 0.5rem 1rem;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
  }

  header {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  header h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  header p {
    margin: 0;
  }

  .audience-results {
    background-color: #2c3e50;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    color: white;
    margin-top: 15px;
  }

  .audience-results h4 {
    margin-top: 0;
    color: #3498db;
    border-bottom: 1px solid #555;
    padding-bottom: 5px;
  }

  .chart {
    display: flex;
    justify-content: space-around;
    padding: 10px 0;
    height: 170px;
  }

  .chart-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 40px;
  }

  .percentage {
    font-size: 12px;
    font-weight: bold;
    color: #3498db;
    margin-bottom: 5px;
  }

  .bar-container {
    width: 25px;
    height: 120px;
    background-color: #34495e;
    border-radius: 3px;
    position: relative;
    display: flex;
    align-items: flex-end;
  }

  .bar {
    width: 100%;
    background-color: #3498db;
    border-radius: 3px 3px 0 0;
    transition: height 1s ease;
  }

  .letter {
    margin-top: 8px;
    font-weight: bold;
    background-color: #34495e;
    color: white;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .friend-advice {
    background-color: #2c3e50;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    color: white;
    margin-top: 15px;
  }

  .friend-advice h4 {
    margin-top: 0;
    color: #e74c3c;
    border-bottom: 1px solid #555;
    padding-bottom: 5px;
  }

  .friend-message {
    width: 100%;
  }

  .advice {
    margin: 5px 0;
  }

  .answer-text {
    margin: 5px 0 10px 0;
  }

  .answer {
    font-weight: bold;
    color: #f39c12;
    font-size: 1.2em;
  }

  .game-result {
    text-align: center;
    padding: 2rem;
    background-color: #1a1a1a;
    border-radius: 8px;
    max-width: 500px;
    margin: 3rem auto;
  }

  .game-result h2 {
    margin-bottom: 1rem;
    font-size: 2rem;
  }

  .money-won {
    font-size: 3rem;
    font-weight: bold;
    color: #ffd700;
    margin: 2rem 0;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  }

  .win h2 {
    color: #4caf50;
  }
  .lose h2 {
    color: #f44336;
  }
  .quit h2 {
    color: #ff9800;
  }

  .buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .btn-primary {
    background-color: #3b82f6;
    color: white;
  }

  .btn-primary:hover {
    background-color: #2563eb;
  }

  .btn-secondary {
    background-color: #4b5563;
    color: white;
  }

  .btn-secondary:hover {
    background-color: #374151;
  }
</style>
