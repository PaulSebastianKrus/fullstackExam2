<script>
  export let question = '';
  export let options = ['', '', '', ''];
  export let disabledOptions = [false, false, false, false];
  export let submitAnswer;
  export let level = 1;
  export let fiftyFiftyOptions = null;

  const optionLabels = ['A', 'B', 'C', 'D'];
  let selectedOption = null;
  let answerLocked = false;

  function isOptionDisabledByFiftyFifty(index) {
    if (!fiftyFiftyOptions) return false;

    const letter = optionLabels[index];

    if (Array.isArray(fiftyFiftyOptions)) {
      return !fiftyFiftyOptions.includes(letter);
    } else if (typeof fiftyFiftyOptions === 'object' && fiftyFiftyOptions !== null) {
      const optionsArray = Object.values(fiftyFiftyOptions);
      if (Array.isArray(optionsArray[0])) {
        return !optionsArray[0].includes(letter);
      }
    }

    return false;
  }

  $: if (question) {
    resetQuestion();
  }

  function resetQuestion() {
    selectedOption = null;
    answerLocked = false;
  }

  function selectOption(index) {
    if (answerLocked) return;

    selectedOption = index;
    answerLocked = true;

    setTimeout(() => {
      submitAnswer(optionLabels[index]);
    }, 2000);
  }
</script>

<div class="question-container">
  <div class="level-info">
    Question {level} - ${level > 0
      ? level === 15
        ? '1,000,000'
        : [0, 100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000][level]
      : 0}
  </div>

  <div class="question">
    {question}
  </div>

  <div class="options">
    {#each options as option, index}
      {#if !isOptionDisabledByFiftyFifty(index)}
        <button
          class="option"
          class:selected={selectedOption === index}
          class:disabled={(answerLocked && selectedOption !== index) || disabledOptions[index]}
          on:click={() => !answerLocked && selectOption(index)}
          disabled={answerLocked || disabledOptions[index]}
        >
          <span class="option-label">{optionLabels[index]}</span>
          <span class="option-text">{option || '——'}</span>
        </button>
      {:else}
        <button class="option eliminated" disabled={true}>
          <span class="option-label">{optionLabels[index]}</span>
          <span class="option-text">{option || '——'}</span>
        </button>
      {/if}
    {/each}
  </div>
</div>

<style>
  .eliminated {
    opacity: 0.3;
    background-color: #888 !important;
    color: #ddd !important;
    text-decoration: line-through;
    cursor: not-allowed !important;
  }

  .question-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .level-info {
    font-size: 1.2rem;
    font-weight: bold;
    text-align: center;
    margin-bottom: 1rem;
  }

  .question {
    background-color: #000080;
    color: white;
    padding: 1.5rem;
    border-radius: 10px;
    font-size: 1.2rem;
    text-align: center;
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .option {
    background-color: #000080;
    color: white;
    border: none;
    border-radius: 10px;
    padding: 1rem;
    text-align: left;
    font-size: 1rem;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .option:hover:not(.disabled) {
    background-color: #1e3a8a;
  }

  .option.selected {
    background-color: #fbbf24;
    color: #000;
  }

  .option.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .option-label {
    font-weight: bold;
    margin-right: 0.5rem;
    min-width: 24px;
  }
</style>
