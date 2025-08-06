<script>
  export let usedLifelines = { fiftyFifty: false, phoneAFriend: false, askAudience: false };
  export let useLifeline;
</script>

<div class="lifelines">
  <button 
    class="lifeline-button fifty-fifty" 
    class:used={usedLifelines.fiftyFifty}
    on:click={() => useLifeline('fiftyFifty')}
    disabled={usedLifelines.fiftyFifty}>
    50:50
  </button>
  
  <button 
    class="lifeline-button phone-friend" 
    class:used={usedLifelines.phoneAFriend}
    on:click={() => useLifeline('phoneAFriend')}
    disabled={usedLifelines.phoneAFriend}>
    Phone a Friend
  </button>
  
  <button 
    class="lifeline-button ask-audience" 
    class:used={usedLifelines.askAudience}
    on:click={() => useLifeline('askAudience')}
    disabled={usedLifelines.askAudience}>
    Ask the Audience
  </button>
</div>

<style>
  .lifelines {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 20px;
  }
  
  .lifeline-button {
    padding: 12px;
    border: none;
    border-radius: 5px;
    background-color: #0066cc;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .lifeline-button:hover:not(.used) {
    background-color: #004c99;
  }
  
  .lifeline-button.used {
    background-color: #666;
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>