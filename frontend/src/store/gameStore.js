import{create}from'zustand';
export const useGameStore=create(set=>({
  phase:'menu',lap:1,totalLaps:3,bestLap:Infinity,totalTime:0,position:1,score:0,
  selectedCar:'red',selectedTrack:'circuit_1',raceResults:null,
  setPhase:p=>set({phase:p}),setLap:l=>set({lap:l}),
  setBestLap:t=>set(s=>({bestLap:t<s.bestLap?t:s.bestLap})),
  setTotalTime:t=>set({totalTime:t}),setPosition:p=>set({position:p}),
  setScore:s=>set({score:s}),setSelectedCar:c=>set({selectedCar:c}),
  setSelectedTrack:t=>set({selectedTrack:t}),
  setRaceResults:r=>set({raceResults:r}),
  resetRace:()=>set({phase:'menu',lap:1,bestLap:Infinity,totalTime:0,position:1,score:0,raceResults:null})
}));
