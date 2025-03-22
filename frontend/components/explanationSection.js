import { useState } from "react";

export default function ExplanationSection({ title = "Erklärung", children }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="mx-auto p-6 bg-neutral-100 rounded-lg shadow-md mb-5">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`hover:underline font-semibold ${expanded ? "mb-4" : ""}`}
      >
        {expanded ? `↓ Show less` : `→ ${title}`}
      </button>

      {expanded && children}
    </section>
  );
}
