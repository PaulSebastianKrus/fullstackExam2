<script>
  import { navigate } from "svelte-routing";
  import toast from 'svelte-french-toast';
  
  let defaultThemes = ['Classic', 'Sports', 'Science', 'Movies', 'Music', 'History'];
  let gameTitle = '';
  let gameDescription = '';
  let selectedTheme = 'Classic';
  let customTheme = '';
  let questions = [];
  let currentQuestion = createEmptyQuestion();
  let isSubmitting = false;
  
  $: maxLevel = questions.length > 0 ? Math.max(...questions.map(q => q.difficulty)) : 1;
  $: minLevel = questions.length > 0 ? Math.min(...questions.map(q => q.difficulty)) : 1;
  $: levelsWithQuestions = [...new Set(questions.map(q => q.difficulty))].sort((a, b) => a - b);
  $: missingLevels = [];
  $: {
    missingLevels = [];
    if (questions.length > 0) {
      for (let i = minLevel; i <= maxLevel; i++) {
        if (!levelsWithQuestions.includes(i)) {
          missingLevels.push(i);
        }
      }
    }
  }
  
  function createEmptyQuestion() {
    return {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 'A',
      difficulty: 1
    };
  }
  
  function addQuestion() {
    if (!validateQuestion()) return;
    
    questions = [...questions, {...currentQuestion}];
    currentQuestion = createEmptyQuestion();
    toast.success('Question added');
  }
  
  function validateQuestion() {
    if (!currentQuestion.question.trim()) {
      toast.error('Question text is required');
      return false;
    }
    
    for (let i = 0; i < 4; i++) {
      if (!currentQuestion.options[i].trim()) {
        toast.error(`Option ${['A', 'B', 'C', 'D'][i]} is required`);
        return false;
      }
    }
    
    if (currentQuestion.difficulty < 1 || currentQuestion.difficulty > 15) {
      toast.error('Difficulty must be a number between 1 and 15');
      return false;
    }
    
    return true;
  }
  
  function removeQuestion(index) {
    questions = questions.filter((_, i) => i !== index);
  }
  
  function isGameValid() {
    if (questions.length < 5) return false;
    if (missingLevels.length > 0) return false;
    return true;
  }
  
  async function submitGame() {
    if (questions.length < 5) {
      toast.error('Your game needs at least 5 questions');
      return;
    }
    
    if (!gameTitle.trim()) {
      toast.error('Game title is required');
      return;
    }
    
    if (missingLevels.length > 0) {
      toast.error(`Missing questions for levels: ${missingLevels.join(', ')}. Fill all levels between ${minLevel} and ${maxLevel}.`);
      return;
    }
    
    const finalTheme = selectedTheme === 'Custom' ? customTheme : selectedTheme;
    if (selectedTheme === 'Custom' && !customTheme.trim()) {
      toast.error('Custom theme name is required');
      return;
    }
    
    try {
      isSubmitting = true;
      const token = localStorage.getItem('token');
      const response = await fetch('/api/game-management/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: gameTitle,
          description: gameDescription,
          theme: finalTheme,
          questions: questions,
          maxLevel: maxLevel  
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Game created successfully!');
        setTimeout(() => navigate('/game-select'), 1500);
      } else {
        toast.error(data.message || 'Failed to create game');
      }
    } catch (error) {
      toast.error('Error creating game');
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="page-container">
  <div class="page-header">
    <div class="container">
      <h1>Create Custom Game</h1>
      <button class="btn-secondary" on:click={() => navigate('/game-select')}>
        <i class="fas fa-arrow-left"></i> Back to Games
      </button>
    </div>
  </div>
  
  <div class="container">
    <div class="content-area">
      <!-- Game Details Section -->
      <section class="section">
        <div class="section-header">
          <h2>Game Details</h2>
        </div>
        
        <div class="form-group">
          <label for="gameTitle">Game Title</label>
          <input id="gameTitle" type="text" bind:value={gameTitle} placeholder="My Millionaire Quiz">
        </div>
        
        <div class="form-group">
          <label for="gameDescription">Description</label>
          <textarea 
            id="gameDescription" 
            bind:value={gameDescription} 
            placeholder="Tell players about your game..."
            rows="3"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="gameTheme">Theme</label>
          <select id="gameTheme" bind:value={selectedTheme}>
            {#each defaultThemes as theme}
              <option value={theme}>{theme}</option>
            {/each}
            <option value="Custom">Custom Theme</option>
          </select>
          
          {#if selectedTheme === 'Custom'}
            <div class="custom-theme-input">
              <input 
                type="text" 
                bind:value={customTheme} 
                placeholder="Enter custom theme name"
              >
            </div>
          {/if}
        </div>
      </section>
      
      <!-- Game Status Section -->
      <section class="section">
        <div class="section-header">
          <h2>Game Status</h2>
        </div>
        
        <div class="status-grid">
          <div class="status-card">
            <div class="status-icon">
              <i class="fas fa-list-ol"></i>
            </div>
            <div class="status-details">
              <span class="status-value">{questions.length}</span>
              <span class="status-label">Total Questions</span>
            </div>
          </div>
          
          <div class="status-card">
            <div class="status-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="status-details">
              <span class="status-value">{questions.length > 0 ? `${minLevel} - ${maxLevel}` : '0'}</span>
              <span class="status-label">Difficulty Range</span>
            </div>
          </div>
          
          <div class="status-card">
            <div class="status-icon">
              <i class="fas fa-layer-group"></i>
            </div>
            <div class="status-details">
              <span class="status-value">{levelsWithQuestions.length}</span>
              <span class="status-label">Levels Covered</span>
            </div>
          </div>
        </div>
        
        {#if missingLevels.length > 0}
          <div class="status-warning">
            <i class="fas fa-exclamation-triangle"></i>
            <span>Missing questions for levels: <strong>{missingLevels.join(', ')}</strong></span>
          </div>
        {/if}
      </section>
      
      <section class="section">
        <div class="section-header">
          <h2>Questions ({questions.length}/5+ required)</h2>
        </div>
        
        {#if questions.length > 0}
          <div class="questions-list">
            {#each questions as question, i}
              <div class="question-card">
                <div class="question-header">
                  <div class="question-number">#{i + 1}</div>
                  <div class="question-difficulty">Level {question.difficulty}</div>
                  <button class="remove-button" 
                          on:click={() => removeQuestion(i)} 
                          aria-label="Remove question #{i + 1}">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                
                <div class="question-body">
                  <h3>{question.question}</h3>
                  
                  <div class="options-grid">
                    {#each question.options as option, idx}
                      <div class="option-item {question.correctAnswer === ['A', 'B', 'C', 'D'][idx] ? 'correct' : ''}">
                        <span class="option-letter">{['A', 'B', 'C', 'D'][idx]}</span>
                        <span class="option-text">{option}</span>
                        {#if question.correctAnswer === ['A', 'B', 'C', 'D'][idx]}
                          <span class="correct-badge">
                            <i class="fas fa-check"></i>
                          </span>
                        {/if}
                      </div>
                    {/each}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
        
        <div class="add-question-form">
          <div class="form-header">
            <h3>Add New Question</h3>
          </div>
          
          <div class="form-body">
            <div class="form-group">
              <label for="questionText">Question</label>
              <input 
                id="questionText" 
                type="text" 
                bind:value={currentQuestion.question} 
                placeholder="Enter your question"
              >
            </div>
            
            <div class="form-row">
              <div class="form-group difficulty-group">
                <label for="questionDifficulty">Difficulty Level (1-15)</label>
                <select
                  id="questionDifficulty"
                  bind:value={currentQuestion.difficulty}
                >
                  {#each Array(15) as _, i}
                    <option value={i + 1}>
                      {i + 1} {i === 0 ? '(Easiest)' : i === 14 ? '(Hardest)' : ''}
                    </option>
                  {/each}
                </select>
                <small>
                    Each question is assigned a difficulty level from 1 (Easiest) to 15 (Hardest).  
                    You can add multiple questions to any level.  
                    Make sure every level in your chosen range has at least one question.
                </small>
              </div>
            </div>
            
            <div class="form-section-label">Answer Options</div>
            
            <div class="options-form-grid">
              {#each ['A', 'B', 'C', 'D'] as letter, i}
                <div class="option-form-group">
                  <div class="option-header">
                    <label for="option{letter}">
                      <input 
                        type="radio" 
                        id="option{letter}"
                        name="correctAnswer" 
                        value={letter} 
                        bind:group={currentQuestion.correctAnswer}
                      >
                      Option {letter}
                    </label>
                    
                    {#if currentQuestion.correctAnswer === letter}
                      <span class="correct-indicator">CORRECT</span>
                    {/if}
                  </div>
                  
                  <input 
                    type="text" 
                    bind:value={currentQuestion.options[i]} 
                    placeholder={`Enter option ${letter}`}
                  >
                </div>
              {/each}
            </div>
            
            <button class="btn-primary add-question-btn" on:click={addQuestion}>
              <i class="fas fa-plus"></i> Add This Question
            </button>
          </div>
        </div>
      </section>
      
      <div class="submit-section">
        <button 
          class="btn-large btn-success" 
          on:click={submitGame} 
          disabled={isSubmitting || !isGameValid()}
        >
          {#if isSubmitting}
            <i class="fas fa-circle-notch fa-spin"></i> Creating...
          {:else if questions.length < 5}
            <i class="fas fa-exclamation-circle"></i> Add More Questions (Need {5 - questions.length} more)
          {:else if missingLevels.length > 0}
            <i class="fas fa-exclamation-triangle"></i> Fill Missing Levels ({missingLevels.join(', ')})
          {:else}
            <i class="fas fa-check-circle"></i> Create Game
          {/if}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  /* Page layout */
  .page-container {
    width: 100%;
    min-height: 100vh;
    background-color: var(--background-dark);
    color: var(--text-light);
    display: flex;
    flex-direction: column;
    align-items: center; 
  }
  
  .page-header {
    background-color: var(--card-background);
    padding: 1.5rem 0;
    border-bottom: 1px solid var(--border-color);
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
  
  .section-header {
    margin-bottom: 1.5rem;
    border-bottom: 2px solid rgba(59, 130, 246, 0.2);
    padding-bottom: 0.75rem;
  }
  
  .section-header h2 {
    font-size: 1.5rem;
    margin: 0;
    color: var(--text-light);
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-row {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .difficulty-group {
    width: 200px;
  }
  
  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--text-light);
  }
  
  small {
    color: var(--text-muted);
    font-size: 0.85rem;
    display: block;
    margin-top: 0.5rem;
  }
  
  .custom-theme-input {
    margin-top: 1rem;
  }
  
  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .status-card {
    background-color: rgba(30, 41, 59, 0.5);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .status-icon {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1));
    border-radius: 12px;
    font-size: 1.5rem;
    color: #3b82f6;
  }
  
  .status-details {
    display: flex;
    flex-direction: column;
  }
  
  .status-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-light);
  }
  
  .status-label {
    font-size: 0.85rem;
    color: var(--text-muted);
  }
  
  .status-warning {
    background-color: rgba(153, 27, 27, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #fca5a5;
  }
  
  .status-warning i {
    font-size: 1.25rem;
    color: #ef4444;
  }
  
  .questions-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2.5rem;
  }
  
  .question-card {
    background-color: rgba(30, 41, 59, 0.5);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
  }
  
  .question-header {
    background-color: rgba(15, 23, 42, 0.7);
    padding: 1rem;
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
  }
  
  .question-number {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #3b82f6;
    color: white;
    border-radius: 50%;
    font-weight: 700;
    font-size: 0.9rem;
  }
  
  .question-difficulty {
    margin-left: 1rem;
    font-size: 0.9rem;
    color: var(--text-muted);
    background-color: rgba(59, 130, 246, 0.15);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
  }
  
  .remove-button {
    margin-left: auto;
    background-color: transparent;
    color: #ef4444;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    font-size: 1rem;
  }
  
  .remove-button:hover {
    background-color: rgba(239, 68, 68, 0.1);
  }
  
  .question-body {
    padding: 1.5rem;
  }
  
  .question-body h3 {
    margin: 0 0 1.25rem 0;
    font-size: 1.1rem;
    color: var(--text-light);
  }
  
  .options-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .option-item {
    background-color: rgba(51, 65, 85, 0.4);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    position: relative;
  }
  
  .option-item.correct {
    background-color: rgba(6, 95, 70, 0.2);
    border-color: rgba(5, 150, 105, 0.4);
  }
  
  .option-letter {
    font-weight: 700;
    color: var(--text-muted);
  }
  
  .option-text {
    flex: 1;
    color: var(--text-light);
    font-size: 0.95rem;
  }
  
  .correct-badge {
    background-color: #10b981;
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
  }
  
  .add-question-form {
    background-color: rgba(15, 23, 42, 0.4);
    border: 2px dashed rgba(71, 85, 105, 0.5);
    border-radius: 12px;
    overflow: hidden;
  }
  
  .form-header {
    background-color: rgba(15, 23, 42, 0.6);
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
  }
  
  .form-header h3 {
    margin: 0;
    font-size: 1.2rem;
  }
  
  .form-body {
    padding: 1.5rem;
  }
  
  .form-section-label {
    font-weight: 600;
    color: var(--text-light);
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(71, 85, 105, 0.5);
  }
  
  .options-form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .option-form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .option-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .option-header label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0;
    cursor: pointer;
  }
  
  .option-header input[type="radio"] {
    width: auto;
  }
  
  .correct-indicator {
    font-size: 0.8rem;
    font-weight: 700;
    color: #10b981;
    background-color: rgba(16, 185, 129, 0.1);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }
  
  .add-question-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1rem;
    font-size: 1rem;
  }
  
  .submit-section {
    display: flex;
    justify-content: center;
    padding: 2rem 0;
  }
  
  .btn-large {
    padding: 1.25rem 2.5rem;
    font-size: 1.1rem;
    min-width: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    border-radius: 12px;
  }
  
  .btn-secondary {
    background-color: rgba(51, 65, 85, 0.5);
    color: var(--text-light);
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .btn-secondary:hover {
    background-color: rgba(71, 85, 105, 0.5);
  }
  
  @media (max-width: 768px) {
    .form-row {
      flex-direction: column;
      gap: 1rem;
    }
    
    .difficulty-group {
      width: 100%;
    }
    
    .options-form-grid,
    .options-grid {
      grid-template-columns: 1fr;
    }
    
    .btn-large {
      min-width: 200px;
    }
  }
</style>