export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white px-6 py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <span className="text-xl font-semibold">MyApp</span>
        <ul className="flex space-x-4">
          <li>
            <a href="#" className="hover:underline">
              Home
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              Charts
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              About
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
