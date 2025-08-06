<script>
  import { onMount, onDestroy } from 'svelte';
  import { navigate } from "svelte-routing";
  import { io } from 'socket.io-client';
  
  let games = [];
  let allThemes = new Set(['All']);
  let selectedTheme = 'All';
  let isLoading = true;
  let error = null;
  let socket;
  
  onMount(async () => {
    await loadGames();
    setupSocket();
  });
  
  onDestroy(() => {
    if (socket) {
      socket.disconnect();
    }
  });
  
  function setupSocket() {
    socket = io('http://localhost:3000');
    
    socket.on('gameCreated', (data) => {
      games = [data.game, ...games];
      
      allThemes.add(data.game.theme);
      allThemes = allThemes;
    });
    
    socket.on('gameDeleted', (data) => {
      games = games.filter(game => game._id !== data.gameId);
      
      allThemes = new Set(['All']);
      games.forEach(game => {
        allThemes.add(game.theme);
      });
      allThemes = allThemes;
    });
  }
  
  async function loadGames() {
    try {
      isLoading = true;
      error = null;
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/game-management/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        games = data.games;
        
        allThemes = new Set(['All']);
        games.forEach(game => {
          allThemes.add(game.theme);
        });
        allThemes = allThemes;
      } else {
        error = data.message || 'Failed to load games';
      }
    } catch (err) {
      error = err.message || 'Failed to load games';
    } finally {
      isLoading = false;
    }
  }
  
  function startGame(gameId) {
    navigate(`/game/${gameId}`);
  }
  
  $: filteredGames = selectedTheme === 'All' 
    ? games 
    : games.filter(game => game.theme === selectedTheme);
</script>

<div class="game-select">
  <header>
    <div class="container">
      <h1>Select a Game</h1>
      <button class="back-button" on:click={() => navigate('/')}>
        <i class="fas fa-arrow-left"></i> Back to Menu
      </button>
    </div>
  </header>
  
  <div class="content-container">
    <div class="filter-controls">
      <div class="theme-filter">
        <label for="themeFilter">Filter by Theme:</label>
        <select id="themeFilter" bind:value={selectedTheme}>
          {#each Array.from(allThemes) as theme}
            <option value={theme}>{theme}</option>
          {/each}
        </select>
      </div>
    </div>
    
    {#if isLoading}
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading games...</p>
      </div>
    {:else if error}
      <div class="error-container">
        <p>Error loading games: {error}</p>
        <button on:click={loadGames}>Try Again</button>
      </div>
    {:else if filteredGames.length === 0}
      <div class="no-games">
        <p>No games found{selectedTheme !== 'All' ? ` for theme "${selectedTheme}"` : ''}.</p>
        <div class="actions">
          <button class="create-button" on:click={() => navigate('/create-game')}>
            <i class="fas fa-plus"></i> Create your own game
          </button>
          {#if selectedTheme !== 'All'}
            <button class="show-all-button" on:click={() => selectedTheme = 'All'}>
              <i class="fas fa-list"></i> Show all games
            </button>
          {/if}
        </div>
      </div>
    {:else}
      <div class="games-grid">
        {#each filteredGames as game}
          <button class="game-card" on:click={() => startGame(game._id)}>
            <div class="theme-badge">{game.theme}</div>
            <h3>{game.title}</h3>
            <p class="author">by {game.creatorName}</p>
            <p class="description">
              {game.description ? game.description : 'No description provided.'}
            </p>
            <div class="stats">
              <span><i class="fas fa-question"></i> {game.questionCount} questions</span>
              <span><i class="fas fa-play"></i> {game.playCount} plays</span>
            </div>
            <span class="play-button">Play Now</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .game-select {
    width: 100%;
    min-height: 100vh;
    background-color: var(--background-dark);
    color: var(--text-light);
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  /* Update header to be full width */
  header {
    background-color: var(--card-background);
    padding: 1.5rem 0;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 2rem;
    width: 100%;
  }
  
  header .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .content-container {
    width: 100%;
    max-width: 1200px;
    padding: 0 1rem;
    box-sizing: border-box;
  }
  
  h1 {
    font-size: 2rem;
    color: #f8fafc;
    margin: 0;
  }
  
  .back-button {
    padding: 0.5rem 1rem;
    background-color: #334155;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .back-button:hover {
    background-color: #475569;
  }
  
  .filter-controls {
    display: flex;
    justify-content: center; /* Center the filter */
    align-items: center;
    margin-bottom: 2rem;
    background-color: #1e293b;
    padding: 1rem;
    border-radius: 8px;
  }
  
  .theme-filter {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .theme-filter label {
    font-weight: bold;
    color: #e2e8f0;
  }
  
  select {
    padding: 0.5rem;
    border-radius: 4px;
    background-color: #334155;
    color: white;
    border: 1px solid #475569;
  }
  
  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .game-card {
    background-color: #1e293b;
    border-radius: 8px;
    padding: 1.5rem;
    position: relative;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
    border: 1px solid #334155;
    display: flex;
    flex-direction: column;
    height: 250px;
    
    /* Button-specific styles */
    text-align: left;
    font-family: inherit;
    font-size: inherit;
    width: 100%;
  }
  
  .game-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
    border-color: #3b82f6;
  }
  
  .game-card:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
  
  .theme-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background-color: #0369a1;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: bold;
  }
  
  h3 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    color: #f8fafc;
    font-size: 1.25rem;
  }
  
  .author {
    color: #94a3b8;
    font-size: 0.9rem;
    margin-top: 0;
    margin-bottom: 1rem;
  }
  
  .description {
    color: #cbd5e1;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    flex-grow: 1;
  
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  
    display: -webkit-box;
    display: box;
    -webkit-line-clamp: 3;
    line-clamp: 3; 
    -webkit-box-orient: vertical;
    box-orient: vertical;
  }
  
  .stats {
    display: flex;
    justify-content: space-between;
    color: #94a3b8;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
  
  .play-button {
    background-color: #16a34a;
    color: white;
    padding: 0.5rem 0;
    border-radius: 4px;
    font-weight: bold;
    width: 100%;
    transition: background-color 0.2s;
    text-align: center;
    display: block;
  }
  
  .game-card:hover .play-button {
    background-color: #15803d;
  }
  
  .loading-container, .error-container, .no-games {
    text-align: center;
    padding: 3rem;
    background-color: #1e293b;
    border-radius: 8px;
    margin-top: 2rem;
  }
  
  .loading-spinner {
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-left-color: #3b82f6;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .no-games .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
  }
  
  .no-games button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .create-button {
    background-color: #16a34a;
    color: white;
  }
  
  .show-all-button {
    background-color: #3b82f6;
    color: white;
  }
</style>