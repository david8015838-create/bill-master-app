import { Expense, Participant, SettlementAction, SettlementResult, Balance } from '../types';

export const calculateSettlement = (
  expenses: Expense[],
  participants: Participant[]
): SettlementResult => {
  const balanceMap: { [key: string]: number } = {};

  // Initialize balances
  participants.forEach((p) => {
    balanceMap[p.id] = 0;
  });

  // Calculate net balances
  expenses.forEach((expense) => {
    const payerId = expense.payerId;
    const amount = expense.amount;
    const involvedCount = expense.involvedIds.length;

    if (involvedCount === 0) return;

    // Payer gets positive credit (they paid, so they are owed this amount initially)
    // But logically in net balance: Payer paid +X.
    // The split amount is X / N.
    // Payer's net change: +X (paid out) - (X/N) (their share) = +X * (1 - 1/N) if they are involved.
    // However, a simpler way is:
    // Payer is CREDITED the full amount (+).
    // Everyone involved is DEBITED their share (-).
    
    // 1. Credit the payer
    balanceMap[payerId] = (balanceMap[payerId] || 0) + amount;

    // 2. Debit the involved
    const splitAmount = amount / involvedCount;
    expense.involvedIds.forEach((id) => {
      balanceMap[id] = (balanceMap[id] || 0) - splitAmount;
    });
  });

  // Convert map to array and fix floating point precision
  const balances: Balance[] = Object.keys(balanceMap).map((id) => ({
    participantId: id,
    amount: Math.round(balanceMap[id] * 100) / 100,
  }));

  // Separate debtors and creditors
  let debtors = balances.filter((b) => b.amount < -0.01).sort((a, b) => a.amount - b.amount); // Ascending (most negative first)
  let creditors = balances.filter((b) => b.amount > 0.01).sort((a, b) => b.amount - a.amount); // Descending (most positive first)

  const actions: SettlementAction[] = [];

  // Greedy algorithm to minimize transactions
  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    // The amount to settle is the minimum of what the debtor owes and what the creditor is owed
    const amountToSettle = Math.min(Math.abs(debtor.amount), creditor.amount);

    // Record action
    if (amountToSettle > 0.01) {
      actions.push({
        fromId: debtor.participantId,
        toId: creditor.participantId,
        amount: Math.round(amountToSettle * 100) / 100,
      });
    }

    // Adjust remaining balances
    debtor.amount += amountToSettle;
    creditor.amount -= amountToSettle;

    // Move indices if settled
    if (Math.abs(debtor.amount) < 0.01) {
      i++;
    }
    if (Math.abs(creditor.amount) < 0.01) {
      j++;
    }
  }

  return {
    balances: balances.sort((a, b) => b.amount - a.amount), // Sort for display
    actions,
  };
};