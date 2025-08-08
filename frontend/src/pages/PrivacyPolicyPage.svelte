<script>
  import PrivacyPolicy from '../components/PrivacyPolicy.svelte';
  import { navigate } from 'svelte-routing';

  function goBack() {
    navigate('/');
  }
</script>

<div class="page-container">
  <div class="page-header">
    <div class="container">
      <h1>Privacy Policy</h1>
      <button class="btn-secondary" on:click={goBack}>
        <i class="fas fa-arrow-left"></i> Back to Game
      </button>
    </div>
  </div>

  <div class="container">
    <div class="content-area">
      <section class="section">
        <PrivacyPolicy />
      </section>
    </div>
  </div>
</div>

<style>
  .page-container {
    width: 100%;
    min-height: 100vh;
    background-color: var(--background-dark, #0f172a);
    color: var(--text-light, #f8fafc);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .page-header {
    background-color: var(--card-background, #1e293b);
    padding: 1.5rem 0;
    border-bottom: 1px solid var(--border-color, #334155);
    margin-bottom: 2rem;
    width: 100%;
  }

  .page-header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .page-header h1 {
    margin: 0;
    font-size: 1.8rem;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .container {
    width: 100%;
    max-width: 1200px;
    padding: 0 1rem;
    box-sizing: border-box;
  }

  .content-area {
    width: 100%;
    padding-bottom: 3rem;
  }

  .section {
    margin-bottom: 2.5rem;
  }

  .btn-secondary {
    background-color: rgba(51, 65, 85, 0.5);
    color: var(--text-light, #f8fafc);
    border: 1px solid var(--border-color, #334155);
    border-radius: 6px;
    padding: 0.75rem 1.25rem;
    cursor: pointer;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-secondary:hover {
    background-color: rgba(71, 85, 105, 0.5);
  }
</style>
