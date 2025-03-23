import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    {
      label:
        "How do trends in police recorded crimes differ between all EU countries? Whats the most happening crime in the EU?",
      href: "/question1",
    },
    {
      label:
        "How has the trend of police-recorded crimes evolved in various cities across the EU?",
      href: "/question2",
    },
    {
      label:
        "How do legal status and gender influence involvement in bribery and corruption across European countries?",
      href: "/question3",
    },
    {
      label:
        "To what extent is there a correlation between population size, economic growth, and the development of crime rates in European countries?",
      href: "/question4",
    },
    {
      label:
        "What is the relationship between income levels and crime rates? (urbanisation)",
      href: "/question5",
    },
    {
      label:
        "How does crime distribution vary by gender across European countries?",
      href: "/question6",
    },
    {
      label:
        "How does crime distribution vary across different age group in European countries?",
      href: "/question7",
    },
    //{ label: "Bla", href: "#" },
    //{ label: "Bla", href: "#" },
  ];

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 shadow-md relative">
      <div className="container mx-auto flex justify-between items-center">
        <span className="text-xl font-semibold">MyApp</span>
        <button
          className="focus:outline-none"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 8h16M4 16h16"
              />
            )}
          </svg>
        </button>
      </div>

      <aside
        className={`fixed top-0 left-0 h-full bg-blue-700 p-6 transform transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"} 
                    w-full md:w-80 lg:w-96 z-[100] overflow-y-auto`}
      >
        <button
          className="absolute top-4 right-4 focus:outline-none"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <nav className="mt-10 flex flex-col space-y-3">
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-base leading-relaxed hover:bg-blue-600 rounded px-4 py-2 break-words"
              onClick={() => setIsOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[50]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </nav>
  );
}
