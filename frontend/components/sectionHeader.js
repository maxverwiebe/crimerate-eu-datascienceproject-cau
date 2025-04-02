/*
 * sectionHeader.js
 * This component is used to display the header for a section / question.
 */

export default function SectionHeader({ number, title }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl text-gray-500 uppercase tracking-wide mb-1">
        Question {number}
      </h2>
      <h3 className="text-3xl font-bold mb-1">{title}</h3>
      <div className="h-1 w-16 bg-blue-500 rounded"></div>
    </div>
  );
}
