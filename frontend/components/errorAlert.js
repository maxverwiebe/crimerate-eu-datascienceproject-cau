export default function ErrorAlert({ message, onClose }) {
  return (
    <div className="mx-auto p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-lg shadow-md mb-5 flex items-start justify-between">
      <div>
        <strong className="font-semibold">Error:</strong> {message}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close error alert"
          className="ml-4 text-red-700 hover:text-red-900 font-bold"
        >
          ×
        </button>
      )}
    </div>
  );
}
