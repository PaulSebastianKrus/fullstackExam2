<script>
  export let currentLevel = 1;

  const moneyValues = [0, 100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000];

  const safePoints = [0, 1000, 32000];
</script>

<div class="money-ladder">
  <h3>Prize Ladder</h3>
  <ul>
    {#each [...moneyValues].reverse() as money, i}
      {@const level = 15 - i}
      <li class:current={level === currentLevel} class:milestone={safePoints.includes(money)}>
        <span class="level">{level}</span>
        <span class="money">${money.toLocaleString()}</span>
      </li>
    {/each}
  </ul>
</div>

<style>
  .money-ladder {
    background-color: #1e293b;
    border-radius: 10px;
    padding: 1rem;
    height: 100%;
    color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid #334155;
  }

  h3 {
    text-align: center;
    margin-top: 0;
    margin-bottom: 1rem;
    border-bottom: 1px solid #475569;
    padding-bottom: 0.5rem;
    color: #f8fafc;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    border-radius: 5px;
    margin-bottom: 0.25rem;
    color: #f8fafc;
  }

  .current {
    background-color: #ca8a04;
    font-weight: bold;
    box-shadow: 0 0 0 2px #facc15;
  }

  .milestone {
    background-color: #065f46;
  }

  .level {
    font-weight: bold;
    min-width: 20px;
  }

  .money {
    color: #fcd34d;
  }
</style>
