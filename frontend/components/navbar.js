import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useRouter();

  const links = [
    {
      label:
        "1. How do trends in police recorded crimes differ between all EU countries? Whats the most happening crime in the EU?",
      href: "/question1",
    },
    {
      label:
        "2. How has the trend of police-recorded crimes evolved in various cities across the EU?",
      href: "/question2",
    },
    {
      label:
        "3. How do legal status and gender influence involvement in bribery and corruption across European countries?",
      href: "/question3",
    },
    {
      label:
        "4. To what extent is there a correlation between population size, economic growth, and the development of crime rates in European countries?",
      href: "/question4",
    },
    {
      label:
        "5. How does an increased police presence impact crime rates across different countries in Europe?",
      href: "/question5",
    },
    {
      label:
        "6. How does crime distribution vary by gender across European countries?",
      href: "/question6",
    },
    {
      label:
        "7. How does crime distribution vary across different age group in European countries?",
      href: "/question7",
    },
  ];

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 shadow-md relative">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex-col">
          <span className="text-xl font-semibold mr-2">Crime in Europe</span>
          <span className="text-s">Data Science Project @ CAU</span>
        </div>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle menu"
          className="focus:outline-none"
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
        className={`fixed top-0 left-0 h-full bg-blue-700 p-6 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          } w-full md:w-80 lg:w-96 z-[100] overflow-y-auto`}
      >
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
          className="absolute top-4 right-4 focus:outline-none"
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
              onClick={() => setIsOpen(false)}
              className={`
                  text-base leading-relaxed rounded px-4 py-2 break-words hover:bg-blue-600
                  ${pathname === href ? "bg-blue-500 font-semibold" : ""}
                `}
              key={href}
              href={href}
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
