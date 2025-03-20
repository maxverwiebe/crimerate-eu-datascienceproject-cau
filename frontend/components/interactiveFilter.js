import React, { useState, useEffect, useRef, useCallback } from "react";

const InteractiveFilterOption = React.memo(
  ({ groupKey, option, multiple, isChecked, onChange }) => (
    <div className="mb-2">
      <label className="inline-flex items-center text-white">
        <input
          type={multiple ? "checkbox" : "radio"}
          name={groupKey}
          value={option.value}
          checked={isChecked}
          onChange={() => onChange(option.value)}
          className="form-checkbox h-4 w-4 text-blue-600"
        />
        <span className="ml-2">{option.label}</span>
      </label>
    </div>
  )
);

const InteractiveFilter = ({ interactiveData, onFilterChange }) => {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [searchTerms, setSearchTerms] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);
  const initializedRef = useRef(false);

  // Initialisiere ausgewählte Optionen nur einmal, wenn interactiveData verfügbar ist
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

  // Erstelle Optionsliste pro Gruppe – Memoized
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

  // Gefilterte Optionen pro Gruppe
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

  // Zusammenfassung der Auswahl
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
    <div className="relative inline-block">
      <button
        onClick={handleButtonClick}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none"
      >
        Filter ({renderSummary()})
      </button>
      {isOpen && (
        <div
          ref={popupRef}
          className="absolute top-full left-0 mt-2 w-96 bg-neutral-800 border border-gray-300 shadow-lg p-6 z-50 rounded"
        >
          {interactiveData &&
            Object.keys(interactiveData).map((groupKey, idx) => {
              const optionsList = opts[groupKey] || [];
              const multiple = interactiveData[groupKey].multiple;
              return (
                <div key={idx} className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {groupKey.charAt(0).toUpperCase() + groupKey.slice(1)}{" "}
                      Selection
                    </h3>
                    <button
                      onClick={() => clearGroup(groupKey)}
                      className="text-sm text-gray-300 hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerms[groupKey] || ""}
                    onChange={(e) =>
                      handleSearchChange(groupKey, e.target.value)
                    }
                    className="mb-2 w-full p-1 rounded border border-gray-400"
                  />
                  <div className="max-h-60 overflow-y-auto">
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
                        onChange={(value) =>
                          handleOptionChange(groupKey, value)
                        }
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
