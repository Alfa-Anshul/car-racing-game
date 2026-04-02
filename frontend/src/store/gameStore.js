import { create } from 'zustand';

export const useGameStore = create((set) => ({
  phase: 'countdown',
  lap: 0,
  totalLaps: 3,
  lapTime: 0,
  bestLap: null,
  totalTime: 0,
  position: 1,
  lapTimes: [],
  setPhase: (phase) => set({ phase }),
  setLap: (lap) => set({ lap }),
  setPosition: (position) => set({ position }),
  recordLap: (time) => set((s) => ({
    lapTimes: [...s.lapTimes, time],
    bestLap: s.bestLap === null ? time : Math.min(s.bestLap, time),
    lapTime: 0,
  })),
  tick: (dt) => set((s) => s.phase === 'racing' ? { lapTime: s.lapTime + dt, totalTime: s.totalTime + dt } : {}),
  reset: () => set({ phase:'countdown', lap:0, lapTime:0, bestLap:null, totalTime:0, position:1, lapTimes:[] }),
}));