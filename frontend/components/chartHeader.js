/*
 * chartHeader.js
 * This component is used to display the header for a chart.
 */

export default function ChartHeader({ title }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl text-gray-500 uppercase tracking-wide mb-1">
        Chart
      </h2>
      <h3 className="text-2xl font-bold mb-1">{title}</h3>
      <div className="h-1 w-10 bg-blue-500 rounded"></div>
    </div>
  );
}
