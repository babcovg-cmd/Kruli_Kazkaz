"use client";

// Вкладки страницы тура: Описание / Программа / Условия.
// Контент — HTML из rich-text редактора админки.

import { useState } from "react";

type TourTabsProps = {
  fullDesc: string;
  program: string;
  conditions: string;
  facts: [string, string][];
};

const TABS = ["Описание", "Программа", "Условия"] as const;

export default function TourTabs({ fullDesc, program, conditions, facts }: TourTabsProps) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Описание");

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: "1px solid var(--line)",
          marginBottom: 28,
          flexWrap: "wrap",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              font: "600 15px/1 var(--d-font)",
              textTransform: "uppercase",
              letterSpacing: ".04em",
              padding: "14px 18px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: tab === t ? "var(--gold-2)" : "var(--txt-3)",
              borderBottom: `2px solid ${tab === t ? "var(--gold)" : "transparent"}`,
              marginBottom: -1,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div key={tab} className="tab-panel">
        {tab === "Описание" && (
          <div>
            <div className="rich" dangerouslySetInnerHTML={{ __html: fullDesc || "<p>Описание скоро появится.</p>" }} />
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginTop: 24 }}>
              {facts.map(([k, v]) => (
                <div key={k}>
                  <div
                    className="muted"
                    style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".1em" }}
                  >
                    {k}
                  </div>
                  <div
                    style={{
                      color: "var(--txt)",
                      fontSize: 18,
                      fontFamily: "var(--d-font)",
                      marginTop: 4,
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Программа" && (
          <div className="rich" dangerouslySetInnerHTML={{ __html: program || "<p>Программа уточняется.</p>" }} />
        )}

        {tab === "Условия" && (
          <div className="rich" dangerouslySetInnerHTML={{ __html: conditions || "<p>Условия уточняйте у менеджера.</p>" }} />
        )}
      </div>
    </>
  );
}
