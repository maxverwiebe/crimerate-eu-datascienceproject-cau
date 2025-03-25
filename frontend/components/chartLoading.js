export default function ChartLoading() {
  return (
    <div className="mb-6 flex items-center">
      <svg
        className="animate-spin h-6 w-6 mr-3 text-gray-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="20"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <span className="text-gray-500 uppercase tracking-wide">
        Processing data &amp; Loading
      </span>
    </div>
  );
}
