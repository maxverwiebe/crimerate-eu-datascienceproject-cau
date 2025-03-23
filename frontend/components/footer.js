export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-600 text-center py-4 mt-12 border-t">
      <p className="text-sm">
        &copy; {new Date().getFullYear()} MyApp. All rights reserved.
      </p>
    </footer>
  );
}
