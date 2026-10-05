import { describe, expect, it } from "vitest";
import { addDays, addMonths, daysInMonth, isValidDate, todayISO } from "./dates";
import { normalizePhone } from "./phone";

describe("dates", () => {
  it("uses Dhaka time to decide what today is", () => {
    // 7:00 PM UTC on 4 Oct is 1:00 AM on 5 Oct in Dhaka (UTC+6).
    expect(todayISO(new Date("2026-10-04T19:00:00Z"), "Asia/Dhaka")).toBe("2026-10-05");
    expect(todayISO(new Date("2026-10-04T17:59:00Z"), "Asia/Dhaka")).toBe("2026-10-04");
  });

  it("moves across month and year ends", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addMonths("2026-12", 1)).toBe("2027-01");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
    expect(daysInMonth("2028-02")).toHaveLength(29);
  });

  it("rejects impossible dates", () => {
    expect(isValidDate("2026-02-30")).toBe(false);
    expect(isValidDate("2026-10-05")).toBe(true);
  });
});

describe("normalizePhone", () => {
  it("stores Bangladeshi numbers in one format", () => {
    expect(normalizePhone("+880 1712-345678")).toBe("01712345678");
    expect(normalizePhone("01712345678")).toBe("01712345678");
  });
});
