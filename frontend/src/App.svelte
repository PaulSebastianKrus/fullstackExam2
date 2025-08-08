<script>
  import { onMount } from 'svelte';
  import { Router, Link, Route } from 'svelte-routing';
  import { Toaster } from 'svelte-french-toast';
  import { currentUser, logout, tokenExpiry } from './stores/generalStore.js';
  import { refreshAccessToken } from './util/token.js';
  import { get } from 'svelte/store';
  import Login from './pages/Login.svelte';
  import Game from './components/Game.svelte';
  import Leaderboard from './pages/Leaderboard.svelte';
  import PrivateRouteGuard from './components/PrivateRouteGuard.svelte';
  import HomeMenu from './pages/HomeMenu.svelte';
  import GameSelect from './pages/GameSelect.svelte';
  import CreateGame from './pages/CreateGame.svelte';
  import PrivacyPolicyPage from './pages/PrivacyPolicyPage.svelte';

  export let url = '';
  let menuOpen = false;

  const handleUserAction = async () => {
    const expiry = parseInt(get(tokenExpiry), 10);
    if (expiry && Date.now() >= expiry - 60000) {
      try {
        await refreshAccessToken();
      } catch (err) {
        logout();
        window.location.href = '/login';
      }
    }
  };

  const toggleMenu = () => {
    menuOpen = !menuOpen;
  };

  onMount(() => {
    document.body.addEventListener('click', handleUserAction);
    document.body.addEventListener('keydown', handleUserAction);

    return () => {
      document.body.removeEventListener('click', handleUserAction);
      document.body.removeEventListener('keydown', handleUserAction);
    };
  });
</script>

<div class="app-wrapper">
  <Router {url}>
    {#if $currentUser}
      <header class="main-header">
        <div class="container">
          <div class="logo">
            <Link to="/">Millionaire Quiz</Link>
          </div>

          <button class="menu-toggle" on:click={toggleMenu} aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav class="main-nav" class:open={menuOpen}>
            <ul>
              <li><Link to="/" on:click={() => (menuOpen = false)}>Menu</Link></li>
              <li><Link to="/game-select" on:click={() => (menuOpen = false)}>Custom Games</Link></li>
              <li><Link to="/leaderboard" on:click={() => (menuOpen = false)}>Leaderboard</Link></li>
            </ul>
            <button
              class="logout-btn"
              on:click={() => {
                logout();
                menuOpen = false;
              }}
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
    {/if}

    <main>
      <Route path="/login">
        <Login />
      </Route>

      <Route path="/game-select">
        <PrivateRouteGuard>
          <GameSelect />
        </PrivateRouteGuard>
      </Route>

      <Route path="/create-game">
        <PrivateRouteGuard>
          <CreateGame />
        </PrivateRouteGuard>
      </Route>

      <Route path="/game/:id" let:params>
        <PrivateRouteGuard>
          <Game gameId={params.id || null} />
        </PrivateRouteGuard>
      </Route>

      <Route path="/game">
        <PrivateRouteGuard>
          <Game />
        </PrivateRouteGuard>
      </Route>

      <Route path="/leaderboard">
        <PrivateRouteGuard>
          <Leaderboard />
        </PrivateRouteGuard>
      </Route>

      <Route path="/">
        <PrivateRouteGuard>
          <HomeMenu />
        </PrivateRouteGuard>
      </Route>

      <Route path="/privacy-policy">
        <PrivacyPolicyPage />
      </Route>
    </main>
  </Router>

  <Toaster position="top-center" toastOptions={{ style: 'background: #1e293b; color: #f8fafc;' }} />
</div>

<style>
  .app-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
  }

  main {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .main-header {
    background-color: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(51, 65, 85, 0.5);
    position: sticky;
    top: 0;
    width: 100%;
    z-index: 100;
    padding: 1rem 0;
  }

  .main-header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .logo {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .menu-toggle {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 30px;
    height: 21px;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  .menu-toggle span {
    display: block;
    height: 3px;
    width: 100%;
    background-color: #f8fafc;
    transition: all 0.3s;
  }

  .main-nav {
    display: flex;
    align-items: center;
  }

  .main-nav ul {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .main-nav ul li {
    margin-right: 1.5rem;
  }

  .logout-btn {
    background-color: transparent;
    border: 2px solid #3b82f6;
    color: #3b82f6;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .logout-btn:hover {
    background-color: #3b82f6;
    color: white;
  }

  @media (max-width: 768px) {
    .menu-toggle {
      display: flex;
    }

    .main-nav {
      position: fixed;
      top: 70px;
      right: -100%;
      background-color: #1e293b;
      width: 80%;
      max-width: 300px;
      height: calc(100vh - 70px);
      flex-direction: column;
      align-items: flex-start;
      padding: 2rem;
      transition: right 0.3s ease;
      box-shadow: -5px 0 15px rgba(0, 0, 0, 0.2);
    }

    .main-nav.open {
      right: 0;
    }

    .main-nav ul {
      flex-direction: column;
      width: 100%;
    }

    .main-nav ul li {
      margin-right: 0;
      margin-bottom: 1.5rem;
      width: 100%;
    }

    .logout-btn {
      margin-top: 2rem;
      width: 100%;
    }
  }
</style>
