import React, { useState, useEffect, useRef } from "react";

const InteractiveFilter = ({ interactiveData, onFilterChange }) => {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    if (interactiveData && typeof interactiveData === "object") {
      setSelectedOptions((prevSelections) => {
        const updatedSelections = { ...prevSelections };
        Object.keys(interactiveData).forEach((key) => {
          if (!(key in updatedSelections)) {
            updatedSelections[key] = [];
          }
        });
        return updatedSelections;
      });
    }
  }, [interactiveData]);

  const handleCheckboxChange = (groupKey, option) => {
    setSelectedOptions((prevSelections) => {
      const currentSelections = prevSelections[groupKey] || [];
      const updatedGroupSelections = currentSelections.includes(option)
        ? currentSelections.filter((item) => item !== option)
        : [...currentSelections, option];
      const updatedSelections = {
        ...prevSelections,
        [groupKey]: updatedGroupSelections,
      };
      if (onFilterChange) {
        onFilterChange(updatedSelections);
      }
      return updatedSelections;
    });
  };

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      <button
        onClick={handleButtonClick}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none"
      >
        Filter öffnen
      </button>
      {isOpen && (
        <div
          ref={popupRef}
          className="absolute top-full left-0 mt-2 w-96 bg-neutral-800 border border-gray-300 shadow-lg p-6 z-50"
        >
          {interactiveData &&
            Object.keys(interactiveData).map((groupKey, idx) => (
              <div key={idx} className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-white">
                  {groupKey.charAt(0).toUpperCase() + groupKey.slice(1)}{" "}
                  Selection
                </h3>
                <div className="max-h-60 overflow-y-auto">
                  {interactiveData[groupKey].map((option, index) => (
                    <div key={index} className="mb-2">
                      <label className="inline-flex items-center text-white">
                        <input
                          type="checkbox"
                          value={option}
                          checked={
                            selectedOptions[groupKey] &&
                            selectedOptions[groupKey].includes(option)
                          }
                          onChange={() =>
                            handleCheckboxChange(groupKey, option)
                          }
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">{option}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default InteractiveFilter;
