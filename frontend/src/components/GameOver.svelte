<script>
  export let gameStatus = 'lost';  
  export let moneyWon = 0;  
  export let onPlayAgain = () => {};  
  
  let message = '';
  
  $: {
    if (gameStatus === 'won') {
      message = 'Congratulations! You won the grand prize!';
    } else if (gameStatus === 'lost') {
      message = 'Game over! Better luck next time.';
    } else {
      message = 'You walked away with your winnings.';
    }
  }
</script>

<div class="game-over">
  <h2 class="status {gameStatus}">{gameStatus === 'won' ? 'YOU WON!' : gameStatus === 'lost' ? 'GAME OVER' : 'CASH OUT'}</h2>
  
  <div class="result">
    <p>{message}</p>
    <h3>You won: <span class="money">${moneyWon.toLocaleString()}</span></h3>
  </div>
  
  <div class="actions">
    <button on:click={onPlayAgain} class="play-again">Play Again</button>
    
  </div>
</div>

<style>
  .game-over {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 70vh;
    text-align: center;
    padding: 2rem;
  }
  
  h2 {
    font-size: 3rem;
    margin-bottom: 2rem;
  }
  
  .status.won {
    color: #16a34a;
  }
  
  .status.lost {
    color: #dc2626;
  }
  
  .status.quit {
    color: #0284c7;
  }
  
  .result {
    font-size: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .money {
    color: #16a34a;
    font-weight: bold;
    font-size: 2rem;
  }
  
  .actions {
    display: flex;
    gap: 1rem;
  }
  
  button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }
  
  .play-again {
    background-color: #16a34a;
    color: white;
  }
  
  .view-leaderboard {
    background-color: #0284c7;
    color: white;
  }
</style>

