<script>
  import { navigate } from "svelte-routing";
  import { currentUser } from '../stores/generalStore.js';


  function capitalizeFirstLetter(str){
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  }
</script>

<div class="home-container">
  <h1>Who Wants to Be a Millionaire</h1>
  <p class="welcome">Welcome, {$currentUser ? capitalizeFirstLetter($currentUser.username) : 'Player'}!</p>
  
  <div class="menu-options">
    <button class="menu-button play" on:click={() => navigate('/game')}>
      <i class="fas fa-play"></i> Play Classic Game
    </button>
    
    <button class="menu-button browse" on:click={() => navigate('/game-select')}>
      <i class="fas fa-search"></i> Browse Custom Games
    </button>
    
    <button class="menu-button create" on:click={() => navigate('/create-game')}>
      <i class="fas fa-edit"></i> Create Custom Game
    </button>
    
    <button class="menu-button leaderboard" on:click={() => navigate('/leaderboard')}>
      <i class="fas fa-trophy"></i> Leaderboard
    </button>
  </div>
</div>

<style>
  .home-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: #f8fafc;
  }
  
  .welcome {
    font-size: 1.2rem;
    margin-bottom: 3rem;
    color: #f3f3f4;
  }
  
  .menu-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 400px;
    margin: 0 auto;
  }
  
  .menu-button {
    padding: 1.2rem;
    font-size: 1.2rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .menu-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  
  .menu-button i {
    margin-right: 0.5rem;
    font-size: 1.4rem;
  }
  
  .play {
    background-color: #16a34a;
    color: white;
  }
  
  .browse {
    background-color: #f59e0b;
    color: white;
  }
  
  .create {
    background-color: #0284c7;
    color: white;
  }
  
  .leaderboard {
    background-color: #9333ea;
    color: white;
  }
</style>