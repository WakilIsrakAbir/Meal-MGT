import { round2 } from "@/lib/money";

// Pure calculation of a month's settlement. No database access, so it is easy to test.
//
// members:  [{ id, name, active }]
// meals:    [{ member, lunch, dinner }]
// expenses: [{ type: "bazar" | "shared", amount, member, paidFromFund }]
// deposits: [{ member, type: "deposit" | "refund" | "carry_forward", amount }]
export function calculateMonthReport({ members = [], meals = [], expenses = [], deposits = [] }) {
  const names = new Map(members.map((m) => [m.id, m.name]));
  const rows = new Map();

  // Everyone active takes part, plus anyone who has records this month.
  const rowFor = (memberId) => {
    if (!rows.has(memberId)) {
      rows.set(memberId, {
        memberId,
        name: names.get(memberId) ?? "Unknown member",
        meals: 0,
        deposits: 0,
        refunds: 0,
        carried: 0,
        ownPocket: 0,
      });
    }
    return rows.get(memberId);
  };

  for (const m of members) if (m.active) rowFor(m.id);

  for (const entry of meals) {
    rowFor(entry.member).meals += (entry.lunch || 0) + (entry.dinner || 0);
  }

  let bazarCost = 0;
  let sharedCost = 0;
  let fundSpent = 0;
  for (const expense of expenses) {
    if (expense.type === "bazar") bazarCost += expense.amount;
    else sharedCost += expense.amount;

    if (expense.paidFromFund) fundSpent += expense.amount;
    else rowFor(expense.member).ownPocket += expense.amount;
  }

  let received = 0;
  for (const deposit of deposits) {
    const row = rowFor(deposit.member);
    if (deposit.type === "refund") {
      row.refunds += deposit.amount;
      received -= deposit.amount;
    } else if (deposit.type === "carry_forward") {
      row.carried += deposit.amount;
      received += deposit.amount;
    } else {
      row.deposits += deposit.amount;
      received += deposit.amount;
    }
  }

  const list = [...rows.values()];
  const totalMeals = list.reduce((sum, r) => sum + r.meals, 0);
  const mealRate = totalMeals > 0 ? bazarCost / totalMeals : 0;
  const sharedPerMember = list.length > 0 ? sharedCost / list.length : 0;

  const reportRows = list.map((r) => {
    const mealCost = r.meals * mealRate;
    const credit = r.deposits - r.refunds + r.carried + r.ownPocket;
    const cost = mealCost + sharedPerMember;
    return {
      ...r,
      deposits: round2(r.deposits),
      refunds: round2(r.refunds),
      carried: round2(r.carried),
      ownPocket: round2(r.ownPocket),
      mealCost: round2(mealCost),
      sharedCost: round2(sharedPerMember),
      cost: round2(cost),
      credit: round2(credit),
      balance: round2(credit - cost),
    };
  });

  const warnings = [];
  if (totalMeals === 0 && bazarCost > 0) {
    warnings.push("There is bazar cost but no meals yet, so the meal rate is 0 and bazar is not shared out.");
  }

  return {
    totalMeals,
    bazarCost: round2(bazarCost),
    sharedCost: round2(sharedCost),
    mealRate,
    sharedPerMember: round2(sharedPerMember),
    fundSpent: round2(fundSpent),
    cashInHand: round2(received - fundSpent),
    rows: reportRows,
    warnings,
  };
}
