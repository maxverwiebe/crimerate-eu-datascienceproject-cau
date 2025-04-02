/*
 * fancyDivider.js
 * This component is used to display a fancy divider with dots.
 */

export default function FancyDivider() {
  return (
    <div className="my-10 relative text-center">
      <hr className="border-t border-dotted border-gray-400" />
      <span className="absolute left-1/2 transform -translate-x-1/2 -top-3 bg-white px-3 text-gray-500 text-sm uppercase tracking-wide">
        • • •
      </span>
    </div>
  );
}
