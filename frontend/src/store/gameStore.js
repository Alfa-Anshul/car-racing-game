import { create } from 'zustand';

export const useGameStore = create((set) => ({
  phase: 'menu', // menu | countdown | racing | finished
  lap: 1,
  totalLaps: 3,
  lapTime: 0,
  bestLap: Infinity,
  totalTime: 0,
  position: 1,
  score: 0,
  selectedCar: 'red',
  selectedTrack: 'circuit_1',
  raceResults: null,

  setPhase: (phase) => set({ phase }),
  setLap: (lap) => set({ lap }),
  setLapTime: (lapTime) => set({ lapTime }),
  setBestLap: (t) => set((s) => ({ bestLap: t < s.bestLap ? t : s.bestLap })),
  setTotalTime: (totalTime) => set({ totalTime }),
  setPosition: (position) => set({ position }),
  setScore: (score) => set({ score }),
  setSelectedCar: (car) => set({ selectedCar: car }),
  setSelectedTrack: (t) => set({ selectedTrack: t }),
  setRaceResults: (r) => set({ raceResults: r }),
  resetRace: () => set({ phase: 'menu', lap: 1, lapTime: 0, bestLap: Infinity, totalTime: 0, position: 1, score: 0, raceResults: null }),
}));
