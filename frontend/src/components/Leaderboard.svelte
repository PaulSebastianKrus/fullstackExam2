<script>
  import { currentUser } from '../stores/generalStore.js';

  export let leaderboardData = [];
  export let userStats = null;
  export let globalStats = null;
  export let loading = false;
  export let showPersonalStats = true;
  export let showGlobalStats = true;
  export let maxDisplayPlayers = 10;

  let activeTab = 'personal';

  function getUserRank() {
    if (!userStats || !$currentUser || !Array.isArray(leaderboardData) || leaderboardData.length === 0) {
      return null;
    }
    const userIndex = leaderboardData.findIndex((player) => player && player.userId === $currentUser._id);
    return userIndex >= 0 ? userIndex + 1 : null;
  }

  function getUserStat(statName, defaultValue = 0) {
    if (!userStats || typeof userStats !== 'object') return defaultValue;
    return userStats[statName] ?? defaultValue;
  }

  function getPlayerStat(player, statName, defaultValue = null) {
    if (!player || typeof player !== 'object') return defaultValue;
    return player[statName] ?? defaultValue;
  }

  $: calculatedGlobalStats = (() => {
    if (globalStats) {
      return globalStats;
    }

    if (!Array.isArray(leaderboardData) || leaderboardData.length === 0) {
      return null;
    }

    const validPlayers = leaderboardData.filter((player) => player && typeof player === 'object' && typeof (player.highestScore || 0) === 'number');

    if (validPlayers.length === 0) {
      return null;
    }

    const totalPlayers = validPlayers.length;
    const totalGamesPlayed = validPlayers.reduce((sum, player) => sum + (player.gamesPlayed || 0), 0);
    const totalGamesWon = validPlayers.reduce((sum, player) => sum + (player.gamesWon || 0), 0);
    const scores = validPlayers.map((player) => player.highestScore || 0);
    const levels = validPlayers.map((player) => player.highestLevel || 0);
    const highestScore = Math.max(...scores);
    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / totalPlayers);
    const highestLevel = Math.max(...levels);

    return {
      totalPlayers,
      totalGamesPlayed,
      totalGamesWon,
      highestScore,
      averageScore,
      highestLevel,
    };
  })();

  $: displayedPlayers = Array.isArray(leaderboardData) ? leaderboardData.slice(0, maxDisplayPlayers) : [];
</script>

<div class="leaderboard-component">
  {#if loading}
    <div class="loading">Loading statistics...</div>
  {:else}
    {#if showPersonalStats && showGlobalStats}
      <div class="tab-navigation">
        <button class="tab-button" class:active={activeTab === 'personal'} on:click={() => (activeTab = 'personal')} disabled={!userStats}>
          📊 Personal Stats
        </button>
        <button class="tab-button" class:active={activeTab === 'global'} on:click={() => (activeTab = 'global')}> 🌍 Global Stats </button>
      </div>
    {/if}

    {#if (activeTab === 'personal' && showPersonalStats) || (!showGlobalStats && showPersonalStats)}
      {#if userStats && typeof userStats === 'object'}
        <div class="stats-section personal-stats">
          <div class="section-header">
            <h2>Your Performance</h2>
            {#if getUserRank()}
              <div class="rank-badge">Rank #{getUserRank()}</div>
            {/if}
          </div>

          <div class="stats-grid">
            <div class="stat-card highlight">
              <div class="stat-icon">💰</div>
              <div class="stat-content">
                <span class="label">Highest Score</span>
                <span class="value">${getUserStat('highestScore').toLocaleString()}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">💎</div>
              <div class="stat-content">
                <span class="label">Total Earnings</span>
                <span class="value">${getUserStat('totalEarnings').toLocaleString()}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">🎮</div>
              <div class="stat-content">
                <span class="label">Games Played</span>
                <span class="value">{getUserStat('gamesPlayed')}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">🏆</div>
              <div class="stat-content">
                <span class="label">Games Won</span>
                <span class="value">{getUserStat('gamesWon')}</span>
                <span class="subtext">
                  {getUserStat('gamesPlayed') > 0 ? Math.round((getUserStat('gamesWon') / getUserStat('gamesPlayed')) * 100) : 0}% win rate
                </span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">⭐</div>
              <div class="stat-content">
                <span class="label">Highest Level</span>
                <span class="value">{getUserStat('highestLevel')}</span>
              </div>
            </div>
          </div>
        </div>
      {:else}
        <div class="empty-state">
          <h3>🔒 Login Required</h3>
          <p>Sign in to view your personal statistics and track your progress!</p>
        </div>
      {/if}
    {/if}

    {#if (activeTab === 'global' && showGlobalStats) || (!showPersonalStats && showGlobalStats)}
      <div class="stats-section global-stats">
        <div class="section-header">
          <h2>Community Statistics</h2>
        </div>

        {#if calculatedGlobalStats}
          <div class="stats-grid">
            <div class="stat-card highlight">
              <div class="stat-icon">👥</div>
              <div class="stat-content">
                <span class="label">Total Players</span>
                <span class="value">{calculatedGlobalStats.totalPlayers.toLocaleString()}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">🎯</div>
              <div class="stat-content">
                <span class="label">Games Played</span>
                <span class="value">{calculatedGlobalStats.totalGamesPlayed.toLocaleString()}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">👑</div>
              <div class="stat-content">
                <span class="label">Highest Score</span>
                <span class="value">${calculatedGlobalStats.highestScore.toLocaleString()}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">📈</div>
              <div class="stat-content">
                <span class="label">Average Score</span>
                <span class="value">${calculatedGlobalStats.averageScore.toLocaleString()}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">🚀</div>
              <div class="stat-content">
                <span class="label">Highest Level</span>
                <span class="value">{calculatedGlobalStats.highestLevel}</span>
              </div>
            </div>
          </div>
        {/if}

        <div class="leaderboard-table">
          <h3>🥇 Top Players</h3>

          {#if displayedPlayers.length === 0}
            <div class="empty-state">No players on the leaderboard yet. Be the first!</div>
          {:else}
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Score</th>
                    <th>Wins</th>
                    <th>Level</th>
                  </tr>
                </thead>
                <tbody>
                  {#each displayedPlayers as player, i}
                    {#if player && typeof player === 'object'}
                      <tr class:is-current-user={$currentUser && getPlayerStat(player, 'userId') === $currentUser._id}>
                        <td>
                          <div class="rank">
                            {#if i === 0}🥇
                            {:else if i === 1}🥈
                            {:else if i === 2}🥉
                            {:else}#{i + 1}
                            {/if}
                          </div>
                        </td>
                        <td class="player-name">{getPlayerStat(player, 'username', 'Unknown')}</td>
                        <td>${getPlayerStat(player, 'highestScore', 0).toLocaleString()}</td>
                        <td>{getPlayerStat(player, 'gamesWon', 0)}</td>
                        <td>{getPlayerStat(player, 'highestLevel', 0)}</td>
                      </tr>
                    {/if}
                  {/each}
                </tbody>
              </table>
            </div>

            {#if Array.isArray(leaderboardData) && leaderboardData.length > maxDisplayPlayers}
              <div class="show-more">
                Showing top {maxDisplayPlayers} of {leaderboardData.length} players
              </div>
            {/if}
          {/if}
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .leaderboard-component {
    width: 100%;
  }

  .tab-navigation {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
    gap: 1rem;
  }

  .tab-button {
    padding: 1rem 2rem;
    border: none;
    border-radius: 25px;
    background-color: #1e293b;
    color: #94a3b8;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
  }

  .tab-button:hover:not(:disabled) {
    background-color: #334155;
    color: #f8fafc;
  }

  .tab-button.active {
    background-color: #3b82f6;
    color: white;
    border-color: #60a5fa;
  }

  .tab-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .stats-section {
    margin-bottom: 2rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .section-header h2 {
    color: #f8fafc;
    font-size: 1.8rem;
    margin: 0;
  }

  .rank-badge {
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    color: #1a202c;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: bold;
    font-size: 0.9rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: linear-gradient(135deg, #1e293b, #334155);
    border-radius: 15px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border: 1px solid #475569;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }

  .stat-card.highlight {
    border-color: #3b82f6;
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  }

  .stat-icon {
    font-size: 2.5rem;
    min-width: 60px;
    text-align: center;
  }

  .stat-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .stat-content .label {
    font-size: 0.9rem;
    color: #94a3b8;
    margin-bottom: 0.25rem;
  }

  .stat-content .value {
    font-size: 1.8rem;
    font-weight: bold;
    color: #3b82f6;
    line-height: 1;
  }

  .stat-content .subtext {
    font-size: 0.8rem;
    color: #64748b;
    margin-top: 0.25rem;
  }

  .leaderboard-table {
    background-color: #1e293b;
    border-radius: 15px;
    padding: 1.5rem;
    border: 1px solid #334155;
  }

  .leaderboard-table h3 {
    color: #f8fafc;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    border-radius: 10px;
    overflow: hidden;
  }

  th,
  td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #334155;
  }

  th {
    background-color: #0f172a;
    color: #f8fafc;
    font-weight: bold;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  td {
    color: #e2e8f0;
  }

  .rank {
    font-weight: bold;
    font-size: 1.1rem;
  }

  .player-name {
    font-weight: 500;
  }

  tr.is-current-user {
    background-color: rgba(59, 130, 246, 0.2);
    border-left: 4px solid #3b82f6;
  }

  tbody tr:hover {
    background-color: #334155;
  }

  .show-more {
    text-align: center;
    margin-top: 1rem;
    color: #94a3b8;
    font-size: 0.9rem;
  }

  .loading {
    text-align: center;
    padding: 4rem 0;
    color: #94a3b8;
    font-size: 1.2rem;
  }

  .loading::after {
    content: '...';
    animation: dots 1.5s infinite;
  }

  @keyframes dots {
    0%,
    20% {
      content: '.';
    }
    40% {
      content: '..';
    }
    60%,
    100% {
      content: '...';
    }
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: #94a3b8;
    background-color: #1e293b;
    border-radius: 15px;
    border: 1px solid #334155;
  }

  .empty-state h3 {
    color: #f8fafc;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  .empty-state p {
    font-size: 1.1rem;
    line-height: 1.6;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
    100% {
      opacity: 1;
    }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .tab-navigation {
      flex-direction: column;
      align-items: center;
    }

    .tab-button {
      width: 100%;
      max-width: 300px;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .section-header {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }
  }
</style>
