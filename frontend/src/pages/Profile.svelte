<script>
  import { onMount } from 'svelte';
  import { currentUser } from '../stores/generalStore.js';
  import toast from 'svelte-french-toast';
  import ProfileEditor from '../components/ProfileEditor.svelte';
  
  let loading = true;
  let error = null;

  onMount(async () => {
    try {
      loading = true;
      
      if (!$currentUser) {
        error = 'You must be logged in to view this page.';
      }
    } catch (err) {
      error = err.message || 'Failed to load profile data';
      toast.error(error);
    } finally {
      loading = false;
    }
  });

  function handleProfileUpdated(event) {
    toast.success(event.detail.message);
  }

  function handleError(event) {
    toast.error(event.detail.message);
  }
</script>

<div class="profile-page">
  <h1>My Profile</h1>
  
  {#if loading}
    <div class="loading">Loading profile data...</div>
  {:else if error && !$currentUser}
    <div class="error">
      {error}
      <p>Please log in to view and edit your profile.</p>
    </div>
  {:else}
    <ProfileEditor 
      userData={$currentUser} 
      on:profileUpdated={handleProfileUpdated}
      on:error={handleError}
    />
  {/if}
</div>

<style>
  .profile-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
  
  h1 {
    text-align: center;
    color: #f8fafc;
    margin-bottom: 2rem;
    font-size: 2.5rem;
  }
  
  .loading {
    text-align: center;
    padding: 4rem 0;
    color: #94a3b8;
    font-size: 1.2rem;
  }
  
  .loading::after {
    content: "...";
    animation: dots 1.5s infinite;
  }
  
  @keyframes dots {
    0%, 20% { content: "."; }
    40% { content: ".."; }
    60%, 100% { content: "..."; }
  }
  
  .error {
    text-align: center;
    padding: 3rem;
    color: #f87171;
    background-color: #1e293b;
    border-radius: 15px;
    border: 1px solid #334155;
    margin-top: 1rem;
  }
  
  .error p {
    color: #94a3b8;
    margin-top: 1rem;
  }
</style>