<script>
  export let userStats;
  export let text = "I reached level {level} in Who Wants to Be a Millionaire and won ${money}!";
  
  function formatShareText() {
    if (!userStats) return text;
    
    return text
      .replace('{level}', userStats.highestLevel || 0)
      .replace('{money}', userStats.totalEarnings?.toLocaleString() || 0);
  }
  
  function shareStats() {
    const shareText = formatShareText();
    const shareUrl = window.location.origin;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Millionaire Quiz Results',
        text: shareText,
        url: shareUrl,
      })
      .catch(err => console.error('Error sharing:', err));
    } else {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(twitterUrl, '_blank');
    }
  }
</script>

<button class="share-button" on:click={shareStats}>
  <i class="fas fa-share-alt"></i> Share My Results
</button>

<style>
  .share-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .share-button:hover {
    background-color: #2563eb;
    transform: translateY(-2px);
  }
</style>