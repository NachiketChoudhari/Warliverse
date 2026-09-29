export const COMPETITION_ROUTE = '/competition';

export const COMPETITION_STAGES = [
  { id: 'understand', number: '01', title: 'Understand' },
  { id: 'preserve', number: '02', title: 'Preserve' },
  { id: 'create', number: '03', title: 'Create' },
  { id: 'deconstruct', number: '04', title: 'Deconstruct' },
  { id: 'experience', number: '05', title: 'Experience' },
  { id: 'apply', number: '06', title: 'Apply' },
  { id: 'conclusion', number: '07', title: 'Conclusion' },
] as const;

export type CompetitionStage = (typeof COMPETITION_STAGES)[number];
export type CompetitionState = { started: boolean; stageIndex: number };

export function createInitialCompetitionState(): CompetitionState {
  return { started: false, stageIndex: 0 };
}

export function getCompetitionStage(index: number): CompetitionStage | null {
  return Number.isInteger(index) && index >= 0 && index < COMPETITION_STAGES.length
    ? COMPETITION_STAGES[index]
    : null;
}

export function startCompetition(): CompetitionState {
  return { started: true, stageIndex: 0 };
}

export function moveCompetitionStage(state: CompetitionState, direction: -1 | 1): CompetitionState {
  if (!state.started || !getCompetitionStage(state.stageIndex)) return createInitialCompetitionState();
  return {
    started: true,
    stageIndex: Math.max(0, Math.min(COMPETITION_STAGES.length - 1, state.stageIndex + direction)),
  };
}

export function handleCompetitionKey(state: CompetitionState, key: string): CompetitionState {
  if (!state.started) return state;
  if (key === 'Escape') return createInitialCompetitionState();
  if (key === 'ArrowLeft') return moveCompetitionStage(state, -1);
  if (key === 'ArrowRight') return moveCompetitionStage(state, 1);
  return state;
}

