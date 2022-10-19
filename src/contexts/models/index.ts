export const enum Direction {
  neon = 'neon',
  solana = 'solana'
}

export const enum StepType {
  source = 'source',
  target = 'target',
  confirm = 'confirm',
}

export interface Curriencies {
  [Direction.neon]: number;
  [Direction.solana]: number;
  loading?: boolean;
}
