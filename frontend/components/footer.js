/*
 * footer.js
 * This component is used to display the footer of the application.
 */

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-600 mt-12 border-t">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
        <div className="text-center text-xs">
          Data source:&nbsp;
          <a
            href="https://ec.europa.eu/eurostat"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-800"
          >
            Eurostat
          </a>
        </div>

        <div className="text-center md:text-right text-xs space-x-4">
          <span>
            By Ali Ahmed, Newar Akrawi, Ahad Iqbal, Maximilian Verwiebe
          </span>
        </div>

        <div className="text-center text-xs">
          <span>
            Christian-Albrechts-Universität zu Kiel Christian-Albrechts-Platz 4
            24118 Kiel, Germany
          </span>
        </div>
      </div>
    </footer>
  );
}
