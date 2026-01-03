export interface Participant {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  payerId: string;
  involvedIds: string[];
  date: string;
}

export interface Balance {
  participantId: string;
  amount: number; // Positive = owns money (receives), Negative = owes money (pays)
}

export interface SettlementAction {
  fromId: string;
  toId: string;
  amount: number;
}

export interface SettlementResult {
  balances: Balance[];
  actions: SettlementAction[];
}

export enum AppStep {
  PARTICIPANTS = 'PARTICIPANTS',
  EXPENSES = 'EXPENSES',
  SETTLEMENT = 'SETTLEMENT'
}