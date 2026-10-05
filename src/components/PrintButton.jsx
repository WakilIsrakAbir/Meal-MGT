"use client";

import { Icon, buttonClass } from "./ui";

export default function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={`${buttonClass.secondary} print:hidden`}>
      <Icon name="printer" className="h-4 w-4" />
      Print
    </button>
  );
}
