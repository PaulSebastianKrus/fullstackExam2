<script>
  import { useParams } from 'svelte-routing';
  import GameComponent from '../components/Game.svelte';
  
  // Get game ID from URL parameters if using svelte-routing
  const params = useParams();
  const gameId = params?.gameId || null;
</script>

<div class="page-container">
  <GameComponent {gameId} />
</div>

<style>
  .page-container {
    min-height: 100vh;
    background-color: #121212;
    color: white;
  }
</style>