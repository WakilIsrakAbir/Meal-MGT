import { describe, expect, it } from "vitest";
import { calculateMonthReport } from "./report";

const members = ["A", "B", "C", "D", "E", "F"].map((name) => ({ id: name, name: `Member ${name}`, active: true }));

// Spread `total` meals over days as lunch + dinner entries.
function mealsFor(member, total) {
  const entries = [];
  for (let left = total; left > 0; left -= 2) {
    entries.push({ member, lunch: 1, dinner: left >= 2 ? 1 : 0 });
  }
  return entries;
}

function octoberExample() {
  return {
    members,
    meals: [
      ...mealsFor("A", 55),
      ...mealsFor("B", 60),
      ...mealsFor("C", 50),
      ...mealsFor("D", 45),
      ...mealsFor("E", 45),
      ...mealsFor("F", 45),
    ],
    expenses: [
      { type: "bazar", amount: 14500, member: null, paidFromFund: true },
      { type: "bazar", amount: 500, member: "B", paidFromFund: false },
      { type: "shared", amount: 6000, member: null, paidFromFund: true },
    ],
    deposits: [
      { member: "A", type: "deposit", amount: 4000 },
      { member: "B", type: "deposit", amount: 3000 },
      { member: "C", type: "deposit", amount: 3500 },
      { member: "D", type: "deposit", amount: 3000 },
      { member: "E", type: "deposit", amount: 3500 },
      { member: "F", type: "deposit", amount: 3500 },
    ],
  };
}

const row = (report, id) => report.rows.find((r) => r.memberId === id);
const sumBalances = (report) => report.rows.reduce((s, r) => s + r.balance, 0);

describe("calculateMonthReport", () => {
  it("matches the October example from the plan", () => {
    const report = calculateMonthReport(octoberExample());

    expect(report.totalMeals).toBe(300);
    expect(report.bazarCost).toBe(15000);
    expect(report.mealRate).toBe(50);
    expect(report.sharedPerMember).toBe(1000);

    expect(row(report, "A")).toMatchObject({ meals: 55, mealCost: 2750, cost: 3750, credit: 4000, balance: 250 });
    // B paid 500 of bazar from their own pocket, so it counts as credit.
    expect(row(report, "B")).toMatchObject({ meals: 60, cost: 4000, ownPocket: 500, credit: 3500, balance: -500 });
  });

  it("keeps the sum of balances equal to the cash with the manager", () => {
    const report = calculateMonthReport(octoberExample());
    // received 20,500 − spent from fund 20,500
    expect(report.cashInHand).toBe(0);
    expect(sumBalances(report)).toBeCloseTo(report.cashInHand, 2);

    const odd = calculateMonthReport({
      members: members.slice(0, 3),
      meals: [...mealsFor("A", 7), ...mealsFor("B", 11), ...mealsFor("C", 13)],
      expenses: [
        { type: "bazar", amount: 1234.5, member: null, paidFromFund: true },
        { type: "bazar", amount: 99, member: "C", paidFromFund: false },
        { type: "shared", amount: 1000, member: null, paidFromFund: true },
      ],
      deposits: [
        { member: "A", type: "deposit", amount: 1500 },
        { member: "B", type: "carry_forward", amount: -120 },
        { member: "C", type: "refund", amount: 50 },
      ],
    });
    expect(odd.cashInHand).toBeCloseTo(1500 - 120 - 50 - 1234.5 - 1000, 2);
    // Each balance is rounded to paisa, so allow a tiny difference.
    expect(Math.abs(sumBalances(odd) - odd.cashInHand)).toBeLessThan(0.02);
  });

  it("uses a meal rate of 0 and warns when there are no meals", () => {
    const report = calculateMonthReport({
      members,
      expenses: [{ type: "bazar", amount: 800, member: null, paidFromFund: true }],
    });
    expect(report.totalMeals).toBe(0);
    expect(report.mealRate).toBe(0);
    expect(report.rows.every((r) => r.mealCost === 0)).toBe(true);
    expect(report.warnings).toHaveLength(1);
  });

  it("handles refunds and a negative carried balance", () => {
    const report = calculateMonthReport({
      members: members.slice(0, 2),
      meals: [...mealsFor("A", 10), ...mealsFor("B", 10)],
      expenses: [{ type: "bazar", amount: 1000, member: null, paidFromFund: true }],
      deposits: [
        { member: "A", type: "deposit", amount: 1000 },
        { member: "A", type: "refund", amount: 200 },
        { member: "B", type: "carry_forward", amount: -300 },
        { member: "B", type: "deposit", amount: 700 },
      ],
    });
    expect(row(report, "A")).toMatchObject({ credit: 800, cost: 500, balance: 300 });
    expect(row(report, "B")).toMatchObject({ carried: -300, credit: 400, cost: 500, balance: -100 });
    expect(report.cashInHand).toBe(200);
  });

  it("counts a guest meal as an extra meal for the host", () => {
    const report = calculateMonthReport({
      members: members.slice(0, 2),
      meals: [
        { member: "A", lunch: 2, dinner: 1 }, // one guest at lunch
        { member: "B", lunch: 1, dinner: 1 },
      ],
      expenses: [{ type: "bazar", amount: 500, member: null, paidFromFund: true }],
    });
    expect(row(report, "A").meals).toBe(3);
    expect(report.mealRate).toBe(100);
    expect(row(report, "A").mealCost).toBe(300);
    expect(row(report, "B").mealCost).toBe(200);
  });

  it("includes an inactive member only when they have records", () => {
    const withInactive = [...members.slice(0, 2), { id: "X", name: "Left", active: false }, { id: "Y", name: "Gone", active: false }];
    const report = calculateMonthReport({
      members: withInactive,
      meals: [{ member: "X", lunch: 1, dinner: 0 }],
      expenses: [{ type: "shared", amount: 300, member: null, paidFromFund: true }],
    });
    expect(report.rows.map((r) => r.memberId)).toEqual(["A", "B", "X"]);
    expect(report.sharedPerMember).toBe(100);
  });
});
