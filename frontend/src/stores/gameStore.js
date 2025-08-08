import { writable, get } from 'svelte/store';
import { apiRequest } from '../util/fetch.js';

const initialState = {
  gameStatus: 'loading',
  gameSessionId: null,
  gameId: null,
  currentQuestion: null,
  currentLevel: 1,
  moneyAtStake: 100,
  securedMoney: 0,
  usedLifelines: {
    fiftyFifty: false,
    phoneAFriend: false,
    askAudience: false,
  },
  lifelines: {
    fiftyFiftyOptions: null,
    friendAdvice: null,
    audienceResults: null,
  },
};

function createGameStore() {
  const store = writable(initialState);

  return {
    subscribe: store.subscribe,

    submitAnswer: async (answer) => {
      try {
        const currentState = get(store);

        if (!currentState.gameSessionId) {
          throw new Error('No active game session');
        }

        const data = await apiRequest('/api/game/answer', 'POST', {
          gameSessionId: currentState.gameSessionId,
          answer,
        });

        if (data.success) {
          if (data.status === 'active') {
            const previousQuestionMoney = currentState.moneyAtStake;

            store.update((state) => ({
              ...state,
              securedMoney: previousQuestionMoney,
              currentQuestion: {
                question: data.nextQuestion?.text || data.nextQuestion?.question || '',
                options: data.nextQuestion?.options || [],
              },
              currentLevel: state.currentLevel + 1,
              moneyAtStake: data.moneyAtStake || 0,
              lifelines: {
                fiftyFiftyOptions: null,
                friendAdvice: null,
                audienceResults: null,
              },
            }));
          } else if (['won', 'lost', 'quit', 'failed', 'completed', 'abandoned'].includes(data.status)) {
            let frontendStatus = data.status;
            if (data.status === 'failed' || data.status === 'lost') {
              frontendStatus = 'failed';
            } else if (data.status === 'completed') {
              frontendStatus = 'won';
            } else if (data.status === 'abandoned') {
              frontendStatus = 'quit';
            }

            store.update((state) => ({
              ...state,
              gameStatus: frontendStatus,
              moneyWon: data.moneyWon || 0,
            }));
          }
        }
        return data;
      } catch (error) {
        store.update((state) => ({ ...state, gameStatus: 'error' }));
        throw error;
      }
    },

    useLifeline: async (lifeline) => {
      try {
        const currentState = get(store);

        if (!currentState.gameSessionId) {
          throw new Error('No active game session');
        }

        store.update((state) => ({
          ...state,
          usedLifelines: {
            ...state.usedLifelines,
            [lifeline]: true,
          },
        }));

        const data = await apiRequest('/api/game/lifeline', 'POST', {
          gameSessionId: currentState.gameSessionId,
          lifeline,
        });

        if (data.success) {
          store.update((state) => {
            let updatedLifelines = { ...state.lifelines };

            if (lifeline === 'fiftyFifty') {
              updatedLifelines.fiftyFiftyOptions = data.result.fiftyFiftyOptions || data.result;
            } else if (lifeline === 'askAudience') {
              updatedLifelines.audienceResults = data.result.audienceResults || data.result;
            } else if (lifeline === 'phoneAFriend') {
              updatedLifelines.friendAdvice = data.result;
            }

            return {
              ...state,
              lifelines: updatedLifelines,
            };
          });
        }

        return data;
      } catch (error) {
        throw error;
      }
    },

    quitGame: async () => {
      try {
        const currentState = get(store);

        if (!currentState.gameSessionId) {
          throw new Error('No active game session');
        }

        const data = await apiRequest('/api/game/quit', 'POST', {
          gameSessionId: currentState.gameSessionId,
        });

        if (data.success) {
          store.update((state) => ({
            ...state,
            gameStatus: 'quit',
            moneyWon: data.moneyWon || state.securedMoney,
          }));
        }
        return data;
      } catch (error) {
        store.update((state) => ({ ...state, gameStatus: 'error' }));
        throw error;
      }
    },

    startGame: async (gameId = null) => {
      try {
        store.update((_state) => ({ ...initialState, gameStatus: 'loading' }));

        const data = await apiRequest('/api/game/start', 'POST', { gameId });

        if (data.success) {
          store.update((state) => ({
            ...state,
            gameStatus: 'active',
            gameSessionId: data.gameSessionId,
            gameId: data.gameInfo?.id || gameId,
            currentQuestion: {
              question: data.question?.text || data.question?.question || '',
              options: data.question?.options || [],
            },
            currentLevel: data.question?.level || 1,
            moneyAtStake: data.question?.moneyAtStake || 100,
            securedMoney: 0,
          }));
        }
        return data;
      } catch (error) {
        store.update((state) => ({ ...state, gameStatus: 'error' }));
        throw error;
      }
    },

    resetLifelineEffects: () => {
      store.update((state) => ({
        ...state,
        lifelines: {
          fiftyFiftyOptions: null,
          friendAdvice: null,
          audienceResults: null,
        },
      }));
    },

    updateLifelineResults: (lifeline, result) => {
      return store.update((state) => {
        const usedLifelines = {
          ...state.usedLifelines,
          [lifeline]: true,
        };

        let lifelines = { ...state.lifelines };

        if (lifeline === 'fiftyFifty' && result?.fiftyFiftyOptions) {
          lifelines.fiftyFiftyOptions = result.fiftyFiftyOptions;

          if (state.currentQuestion) {
            const updatedOptions = state.currentQuestion.options.map((option, i) => ({
              ...option,
              hidden: !result.fiftyFiftyOptions.includes(['A', 'B', 'C', 'D'][i]),
            }));

            state.currentQuestion = {
              ...state.currentQuestion,
              options: updatedOptions,
            };
          }
        } else if (lifeline === 'askAudience' && result?.audienceResults) {
          lifelines.audienceResults = result.audienceResults;
        } else if (lifeline === 'phoneAFriend' && result) {
          lifelines.friendAdvice = result;
        }

        return {
          ...state,
          usedLifelines,
          lifelines,
        };
      });
    },
  };
}

export const gameStore = createGameStore();
