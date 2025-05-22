"use client"

import { create } from 'zustand';

export interface Player {
  id: string;
  name: string;
  score: number;
  isActive: boolean;
  isCurrentPlayer?: boolean;
}

interface GameState {
  currentGame: string;
  players: Player[];
  currentRound: number;
  maxRounds: number;
  currentPlayerIndex: number;
  gameOver: boolean;
  
  // Game-specific state
  targetNumber?: number;
  playerGuesses: Record<string, number>;
  boxNumbers?: number[];
  revealedBoxes?: number[];
  codeDigits?: number[];
  guessedDigits?: number[];
  beatTempo?: number;
  
  // Actions
  setCurrentGame: (gameId: string) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayerScore: (playerId: string, score: number) => void;
  setPlayerActive: (playerId: string, isActive: boolean) => void;
  setCurrentPlayer: (playerIndex: number) => void;
  nextPlayer: () => void;
  startNewRound: () => void;
  resetGame: () => void;
  setGameOver: (isOver: boolean) => void;
  
  // Game-specific actions
  setTargetNumber: (target: number) => void;
  submitPlayerGuess: (playerId: string, guess: number) => void;
  clearPlayerGuesses: () => void;
  initializeBoxNumbers: () => void;
  revealBox: (boxIndex: number) => void;
  initializeCodeDigits: () => void;
  guessDigit: (position: number, digit: number) => void;
  setBeatTempo: (tempo: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentGame: 'zeroed-out',
  players: [],
  currentRound: 1,
  maxRounds: 5,
  currentPlayerIndex: 0,
  gameOver: false,
  
  playerGuesses: {},
  boxNumbers: [],
  revealedBoxes: [],
  codeDigits: [],
  guessedDigits: [],
  beatTempo: 1000, // ms between beats
  
  setCurrentGame: (gameId) => set({ currentGame: gameId }),
  
  addPlayer: (player) => set((state) => ({ 
    players: [...state.players, player] 
  })),
  
  removePlayer: (playerId) => set((state) => ({ 
    players: state.players.filter(p => p.id !== playerId) 
  })),
  
  updatePlayerScore: (playerId, score) => set((state) => ({
    players: state.players.map(p => 
      p.id === playerId ? { ...p, score } : p
    )
  })),
  
  setPlayerActive: (playerId, isActive) => set((state) => ({
    players: state.players.map(p => 
      p.id === playerId ? { ...p, isActive } : p
    )
  })),
  
  setCurrentPlayer: (playerIndex) => set((state) => ({
    currentPlayerIndex: playerIndex,
    players: state.players.map((p, idx) => ({
      ...p,
      isCurrentPlayer: idx === playerIndex
    }))
  })),
  
  nextPlayer: () => set((state) => {
    // Find next active player
    let nextIdx = state.currentPlayerIndex;
    let activePlayers = state.players.filter(p => p.isActive);
    
    if (activePlayers.length === 0) return state;
    
    do {
      nextIdx = (nextIdx + 1) % state.players.length;
    } while (!state.players[nextIdx].isActive);
    
    return {
      currentPlayerIndex: nextIdx,
      players: state.players.map((p, idx) => ({
        ...p,
        isCurrentPlayer: idx === nextIdx
      }))
    };
  }),
  
  startNewRound: () => set((state) => ({ 
    currentRound: state.currentRound + 1,
    playerGuesses: {} 
  })),
  
  resetGame: () => set({
    players: [],
    currentRound: 1,
    currentPlayerIndex: 0,
    gameOver: false,
    playerGuesses: {},
    boxNumbers: [],
    revealedBoxes: [],
    codeDigits: [],
    guessedDigits: [],
    beatTempo: 1000,
  }),
  
  setGameOver: (isOver) => set({ gameOver: isOver }),
  
  setTargetNumber: (target) => set({ targetNumber: target }),
  
  submitPlayerGuess: (playerId, guess) => set((state) => ({
    playerGuesses: { ...state.playerGuesses, [playerId]: guess }
  })),
  
  clearPlayerGuesses: () => set({ playerGuesses: {} }),
  
  initializeBoxNumbers: () => set({
    boxNumbers: Array.from({ length: 4 }, () => Math.floor(Math.random() * 100) + 1),
    revealedBoxes: [],
  }),
  
  revealBox: (boxIndex) => set((state) => ({
    revealedBoxes: [...(state.revealedBoxes || []), boxIndex]
  })),
  
  initializeCodeDigits: () => set({
    codeDigits: Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)),
    guessedDigits: [-1, -1, -1], // -1 represents unguessed
  }),
  
  guessDigit: (position, digit) => set((state) => ({
    guessedDigits: state.guessedDigits?.map((d, i) => 
      i === position ? digit : d
    )
  })),
  
  setBeatTempo: (tempo) => set({ beatTempo: tempo }),
}));