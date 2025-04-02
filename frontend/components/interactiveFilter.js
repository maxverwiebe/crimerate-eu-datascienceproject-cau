/*
 * interactiveFilter.js
 * This component is used to create an interactive filter for a set of options for a chart.
 * It allows users to select multiple options and filter the data displayed in the chart.
 * And it includes a search functionality to filter options based on user input.
 */

// There might be some AI help in this code, but it is not clear D:

import React, { useState, useEffect, useRef, useCallback } from "react";

/**
 * InteractiveFilterOption
 * This component is used to render a single filter option with a checkbox or radio button.
 * It is memoized to prevent unnecessary re-renders.
 * @param {Object} props - The props for the component.
 * @param {string} props.groupKey - The key of the group this option belongs to.
 * @param {Object} props.option - The option object containing value and label.
 * @param {boolean} props.multiple - Indicates if multiple selections are allowed.
 * @param {boolean} props.isChecked - Indicates if this option is checked.
 * @param {function} props.onChange - The function to call when the option is changed.
 * */
const InteractiveFilterOption = React.memo(
  ({ groupKey, option, multiple, isChecked, onChange }) => (
    <div className="mb-2">
      <label className="inline-flex items-center text-sm text-gray-800">
        <input
          type={multiple ? "checkbox" : "radio"}
          name={groupKey}
          value={option.value}
          checked={isChecked}
          onChange={() => onChange(option.value)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <span className="ml-2">{option.label}</span>
      </label>
    </div>
  )
);

/**
 * InteractiveFilter
 * This component is used to create an interactive filter for a chart.
 * It allows users to select multiple options and filter the data displayed in the chart.
 * It includes a search functionality to filter options based on user input.
 * @component
 * @param {Object} props - The props for the component.
 * @param {Object} props.interactiveData - The data for the interactive filter.
 * @param {function} props.onFilterChange - The function to call when the filter changes.
 * */
const InteractiveFilter = ({ interactiveData, onFilterChange }) => {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [searchTerms, setSearchTerms] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (
      interactiveData &&
      typeof interactiveData === "object" &&
      !initializedRef.current
    ) {
      const initOptions = {};
      const initSearch = {};
      Object.keys(interactiveData).forEach((groupKey) => {
        const def = interactiveData[groupKey].default;
        initOptions[groupKey] = def !== null && def !== undefined ? [def] : [];
        initSearch[groupKey] = "";
      });
      setSelectedOptions(initOptions);
      setSearchTerms(initSearch);
      initializedRef.current = true;
    }
  }, [interactiveData]);

  // handle option change
  const handleOptionChange = useCallback(
    (groupKey, optionValue) => {
      setSelectedOptions((prev) => {
        const current = prev[groupKey] || [];
        let updatedGroup;
        if (!interactiveData[groupKey].multiple) {
          updatedGroup = [optionValue];
        } else {
          updatedGroup = current.includes(optionValue)
            ? current.filter((item) => item !== optionValue)
            : [...current, optionValue];
        }
        const updated = { ...prev, [groupKey]: updatedGroup };
        onFilterChange && onFilterChange(updated);
        return updated;
      });
    },
    [interactiveData, onFilterChange]
  );

  // handle search input change
  const handleSearchChange = useCallback((groupKey, value) => {
    setSearchTerms((prev) => ({ ...prev, [groupKey]: value }));
  }, []);

  const clearGroup = useCallback(
    (groupKey) => {
      setSelectedOptions((prev) => {
        const updated = { ...prev, [groupKey]: [] };
        onFilterChange && onFilterChange(updated);
        return updated;
      });
    },
    [onFilterChange]
  );

  const handleButtonClick = () => {
    setIsOpen((prev) => !prev);
  };

  // close the popup when clicking outside
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

  const getOptionsList = useCallback(
    (groupKey) => {
      if (!interactiveData || !interactiveData[groupKey]) return [];
      const values = interactiveData[groupKey].values || [];
      const labels = interactiveData[groupKey].labels;
      if (labels && labels.length === values.length) {
        return values.map((val, i) => ({ value: val, label: labels[i] }));
      }
      return values.map((val) => ({ value: val, label: val }));
    },
    [interactiveData]
  );

  const filteredOptions = useCallback(() => {
    const result = {};
    if (!interactiveData) return result;
    Object.keys(interactiveData).forEach((groupKey) => {
      const list = getOptionsList(groupKey);
      const search = searchTerms[groupKey] || "";
      result[groupKey] = list.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase())
      );
    });
    return result;
  }, [interactiveData, searchTerms, getOptionsList]);

  // render the summary of selected options (text next to the button)
  const renderSummary = () => {
    if (!interactiveData) return "";
    return Object.keys(interactiveData)
      .map((groupKey) => {
        const selected = selectedOptions[groupKey] || [];
        const summary =
          selected.length > 0
            ? selected
                .map((val) => {
                  const options = getOptionsList(groupKey);
                  const opt = options.find((o) => o.value === val);
                  return opt ? opt.label : val;
                })
                .join(", ")
            : "*";
        return `${groupKey}: ${summary}`;
      })
      .join(" | ");
  };

  const opts = filteredOptions();

  return (
    <div className="relative inline-block w-full max-w-full">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
        <button
          onClick={handleButtonClick}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-5 rounded-md hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md transition-all duration-200 text-sm md:text-base font-medium"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filter
        </button>

        <div className="text-sm text-gray-600 font-medium">
          {renderSummary()}
        </div>
      </div>

      {isOpen && (
        <div
          ref={popupRef}
          className="fixed md:absolute inset-0 md:inset-auto md:top-full md:left-0 md:mt-2 w-full md:w-96 h-full md:h-auto overflow-y-auto bg-white border md:border-gray-200 shadow-xl p-6 z-50 rounded-none md:rounded-lg"
        >
          <div className="flex justify-between items-center mb-4 md:hidden">
            <h2 className="text-lg font-semibold">Filter Options</h2>
            <button
              className="text-gray-500 hover:text-black text-m"
              onClick={() => setIsOpen(false)}
            >
              ✕ Close
            </button>
          </div>

          {Object.keys(interactiveData).map((groupKey, idx) => {
            const optionsList = opts[groupKey] || [];
            const multiple = interactiveData[groupKey].multiple;
            return (
              <div
                key={idx}
                className={`mb-6 ${
                  Object.keys(interactiveData).length <= 1 &&
                  typeof window !== "undefined" &&
                  window.innerWidth < 768
                    ? "flex-grow"
                    : ""
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-gray-800">
                    {groupKey.charAt(0).toUpperCase() + groupKey.slice(1)}
                  </h3>
                  <button
                    onClick={() => clearGroup(groupKey)}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    Clear
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerms[groupKey] || ""}
                  onChange={(e) => handleSearchChange(groupKey, e.target.value)}
                  className="mb-3 w-full p-2 rounded border border-gray-300 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div
                  className={`overflow-y-auto pr-1 ${
                    Object.keys(interactiveData).length <= 1 &&
                    typeof window !== "undefined" &&
                    window.innerWidth < 768
                      ? "flex-grow max-h-[calc(100vh-200px)]"
                      : "max-h-60"
                  }`}
                >
                  {optionsList.map((option, index) => (
                    <InteractiveFilterOption
                      key={index}
                      groupKey={groupKey}
                      option={option}
                      multiple={multiple}
                      isChecked={
                        multiple
                          ? selectedOptions[groupKey]?.includes(option.value)
                          : selectedOptions[groupKey][0] === option.value
                      }
                      onChange={(value) => handleOptionChange(groupKey, value)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InteractiveFilter;
