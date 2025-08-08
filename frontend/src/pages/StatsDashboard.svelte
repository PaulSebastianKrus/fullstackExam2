<script>
  import { onMount } from 'svelte';
  import { currentUser } from '../stores/generalStore.js';
  import { navigate } from 'svelte-routing';
  import toast from 'svelte-french-toast';

  let userStats = null;
  let loading = true;
  let error = null;
  let showAdvanced = false;

  onMount(async () => {
    await loadStats();
  });

  async function loadStats() {
    try {
      if (!$currentUser) {
        navigate('/login');
        return;
      }

      loading = true;
      // Add the token to the request
      const token = localStorage.getItem('token');
      const response = await fetch('/api/stats/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Handle expired token
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.stats) {
        userStats = data.stats;
      } else {
        throw new Error(data.message || 'Failed to load stats');
      }
    } catch (err) {
      error = err.message;
      toast.error(`Error: ${err.message}`);
    } finally {
      loading = false;
    }
  }
</script>

<div class="stats-dashboard">
  <header>
    <h1>Player Statistics Dashboard</h1>
    <p>Performance metrics for {$currentUser?.username || 'Guest'}</p>
    <button class="back-button" on:click={() => navigate('/')}>
      <i class="fas fa-arrow-left"></i> Back to Menu
    </button>
  </header>

  {#if loading}
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>Loading stats...</p>
    </div>
  {:else if error}
    <div class="error-message">
      <p>{error}</p>
      <button on:click={loadStats}>Try Again</button>
    </div>
  {:else if userStats}
    <div class="stats-grid">
      <div class="stat-card highlight">
        <h3>Total Earnings</h3>
        <div class="stat-value">${userStats.totalEarnings.toLocaleString()}</div>
        <div class="stat-icon money-icon">💰</div>
      </div>

      <div class="stat-card">
        <h3>Games Played</h3>
        <div class="stat-value">{userStats.gamesPlayed}</div>
        <div class="stat-icon">🎮</div>
      </div>

      <div class="stat-card">
        <h3>Games Won</h3>
        <div class="stat-value">{userStats.gamesWon}</div>
        <div class="stat-icon">🏆</div>
      </div>

      <div class="stat-card">
        <h3>Win Rate</h3>
        <div class="stat-value">
          {userStats.gamesPlayed > 0 ? Math.round((userStats.gamesWon / userStats.gamesPlayed) * 100) : 0}%
        </div>
        <div class="stat-icon">📊</div>
      </div>

      <div class="stat-card">
        <h3>Highest Level</h3>
        <div class="stat-value">{userStats.highestLevel}</div>
        <div class="stat-icon">🔝</div>
      </div>

      <div class="stat-card">
        <h3>Highest Score</h3>
        <div class="stat-value">${userStats.highestScore.toLocaleString()}</div>
        <div class="stat-icon">⭐</div>
      </div>
    </div>

    <div class="advanced-stats">
      <button class="toggle-button" on:click={() => (showAdvanced = !showAdvanced)}>
        {showAdvanced ? 'Hide' : 'Show'} Advanced Statistics
      </button>

      {#if showAdvanced}
        <div class="advanced-grid">
          <div class="stat-card">
            <h3>Lifelines Used</h3>
            <div class="stat-value">{userStats.lifelinesUsed}</div>
          </div>

          <div class="stat-card">
            <h3>Avg. Time per Question</h3>
            <div class="stat-value">{Math.round(userStats.averageTimePerQuestion)}s</div>
          </div>

          <div class="stat-card">
            <h3>Avg. Earnings</h3>
            <div class="stat-value">
              ${userStats.gamesPlayed > 0 ? Math.floor(userStats.totalEarnings / userStats.gamesPlayed).toLocaleString() : 0}
            </div>
          </div>

          <div class="stat-card">
            <h3>Lifelines per Game</h3>
            <div class="stat-value">
              {userStats.gamesPlayed > 0 ? (userStats.lifelinesUsed / userStats.gamesPlayed).toFixed(1) : 0}
            </div>
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <p class="no-stats">No statistics available. Play some games to see your stats!</p>
  {/if}
</div>

<style>
  .stats-dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 3rem;
    position: relative;
  }

  header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: #f8f8f8;
  }

  header p {
    color: #a0aec0;
    margin: 0;
  }

  .back-button {
    position: absolute;
    left: 0;
    top: 0;
    background-color: transparent;
    color: #a0aec0;
    border: 1px solid #4a5568;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .back-button:hover {
    background-color: #2d3748;
    color: white;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .stat-card {
    background-color: #2d3748;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
    transition:
      transform 0.3s,
      box-shadow 0.3s;
  }

  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
  }

  .stat-card h3 {
    color: #a0aec0;
    margin-top: 0;
    font-size: 1.1rem;
  }

  .stat-value {
    font-size: 2.5rem;
    font-weight: bold;
    margin-top: 1rem;
    color: #f8f8f8;
  }

  .stat-icon {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 2rem;
    opacity: 0.2;
  }

  .highlight {
    background: linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%);
  }

  .money-icon {
    font-size: 2.5rem;
  }

  .advanced-stats {
    text-align: center;
  }

  .toggle-button {
    background-color: #4a5568;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    margin-bottom: 2rem;
  }

  .toggle-button:hover {
    background-color: #2d3748;
  }

  .advanced-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .loading,
  .error-message,
  .no-stats {
    text-align: center;
    margin: 3rem 0;
    color: #a0aec0;
  }

  .loading-spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: #3b82f6;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
