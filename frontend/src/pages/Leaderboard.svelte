<script>
  import { onMount, onDestroy } from 'svelte';
  import { currentUser } from '../stores/generalStore.js';
  import toast from 'svelte-french-toast';
  import LeaderboardComponent from '../components/Leaderboard.svelte';
  import { io } from 'socket.io-client';

  let leaderboard = [];
  let userStats = null;
  let loading = true;
  let error = null;
  let socket = null;
  let isConnected = false;

  onMount(() => {
    loadLeaderboardData();
    setupSocket();
  });

  onDestroy(() => {
    if (socket) {
      socket.emit('leaveRoom', 'games');
      socket.off();
      socket.disconnect();
    }
  });
  
  function setupSocket() {
    socket = io(import.meta.env.SOCKET_URL);

    socket.on('connect', () => {
      isConnected = true;
      socket.emit('joinRoom', 'games');
    });

    socket.on('connect_error', () => {
      isConnected = false;
    });

    socket.on('disconnect', () => {
      isConnected = false;
    });
    
    socket.on('leaderboard:update', (data) => {
      if (data && Array.isArray(data.leaderboard)) {
        leaderboard = data.leaderboard;
        toast.success('Leaderboard updated', {
          duration: 2000,
          position: 'bottom-right',
          style: 'background: #064e3b; color: white;'
        });
      }
    });
    
    if ($currentUser) {
      socket.on(`stats:update:${$currentUser._id}`, (data) => {
        if (data && data.stats) {
          userStats = data.stats;
          toast.success('Your stats updated', {
            duration: 2000,
            position: 'bottom-right',
            style: 'background: #064e3b; color: white;'
          });
        }
      });
    }
  }

  async function loadLeaderboardData() {
    try {
      loading = true;
      error = null;

      const response = await fetch('/api/stats/leaderboard');

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        leaderboard = data.leaderboard;
      } else {
        throw new Error(data.message || 'Failed to load leaderboard');
      }

      if ($currentUser) {
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('Authentication token not found');
        }

        const statsResponse = await fetch('/api/stats/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!statsResponse.ok) {
          throw new Error(`Server returned ${statsResponse.status}: ${statsResponse.statusText}`);
        }

        const statsData = await statsResponse.json();

        if (statsData.success) {
          userStats = statsData.stats;
        } else {
          throw new Error(statsData.message || 'Failed to load user stats');
        }
      }
    } catch (err) {
      error = err.message;
      toast.error(`Error loading leaderboard: ${err.message}`);
    } finally {
      loading = false;
    }
  }
</script>

<div class="leaderboard-page">
  <h1>🏆 Game Statistics</h1>

  {#if error}
    <div class="error">
      {error}
      <button class="retry-btn" on:click={loadLeaderboardData}>
        Retry
      </button>
    </div>
  {/if}

  <LeaderboardComponent 
    leaderboardData={leaderboard}
    {userStats}
    {loading}
    showPersonalStats={true}
    showGlobalStats={true}
    maxDisplayPlayers={20}
  />
</div>

<style>
  .leaderboard-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    min-height: 100vh;
  }

  h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: #f8fafc;
    font-size: 2.5rem;
    font-weight: bold;
  }

  .error {
    color: #dc2626;
    background-color: #1e293b;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    border: 1px solid #334155;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .retry-btn {
    padding: 0.5rem 1rem;
    background-color: #dc2626;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.3s ease;
  }

  .retry-btn:hover {
    background-color: #b91c1c;
  }

  @media (max-width: 768px) {
    .leaderboard-page {
      padding: 1rem;
    }

    h1 {
      font-size: 2rem;
    }

    .error {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }
  }
</style>