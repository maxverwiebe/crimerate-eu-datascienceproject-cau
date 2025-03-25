import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";
import ChartHeader from "../chartHeader";
import ExplanationSection from "../explanationSection";
import ErrorAlert from "../errorAlert";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const formatEchartsRadar = (pivotData, hiddenCrimes) => {
  const crimes = Object.keys(pivotData).filter(
    (c) => !hiddenCrimes.includes(c)
  );
  const countries = [
    ...new Set(Object.values(pivotData).flatMap((cd) => Object.keys(cd))),
  ];

  const indicators = crimes.map((crime) => {
    const max = Math.max(
      ...countries.map((country) => pivotData[crime][country] || 0)
    );
    return { name: crime, max: Math.ceil(max * 1.1) || 1 };
  });

  const series = countries.map((country) => ({
    name: country,
    value: crimes.map((crime) => pivotData[crime][country] || 0),
  }));

  return { indicators, series };
};

const CrimeGroupPopup = ({
  allCrimes,
  hiddenCrimes,
  toggleCrime,
  clearAll,
  onClose,
}) => {
  const ref = useRef();
  useEffect(() => {
    const handle = (e) =>
      ref.current && !ref.current.contains(e.target) && onClose();
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed md:absolute inset-0 md:inset-auto md:top-full md:left-0 md:mt-2 w-full md:w-96 bg-white border shadow-xl p-6 z-50 rounded-none md:rounded-lg"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Hide Crime Groups</h2>
        <button
          className="text-gray-500 hover:text-black text-xl"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      <button
        onClick={clearAll}
        className="text-xs text-blue-500 hover:underline mb-4"
      >
        Clear All
      </button>
      <div className="max-h-60 overflow-y-auto">
        {allCrimes.map((crime) => (
          <label key={crime} className="flex items-center text-sm mb-2">
            <input
              type="checkbox"
              checked={!hiddenCrimes.includes(crime)}
              onChange={() => toggleCrime(crime)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2">{crime}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

const Question1Chart2 = () => {
  const [pivotData, setPivotData] = useState({});
  const [interactiveData, setInteractiveData] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState({});
  const [hiddenCrimes, setHiddenCrimes] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams();
      filterCriteria.time?.forEach((v) => params.append("time", v));
      filterCriteria.geo?.forEach((v) => params.append("geo", v));
      const url = `${process.env.NEXT_PUBLIC_BACKEND_API}/api/question1/chart1?${params}`;
      const json = await fetch(url).then((r) => r.json());
      setPivotData(json.chart_data.pivot_data || {});
      setInteractiveData(json.interactive_data);

      if (json.error) {
        setError(json.error);
      }
    };
    fetchData().catch(console.error);
  }, [filterCriteria]);

  const handleFilterChange = (nf) => setFilterCriteria(nf);
  const toggleCrime = (crime) =>
    setHiddenCrimes((prev) =>
      prev.includes(crime) ? prev.filter((c) => c !== crime) : [...prev, crime]
    );

  const allCrimes = Object.keys(pivotData);
  const { indicators, series } = formatEchartsRadar(pivotData, hiddenCrimes);

  const option = {
    tooltip: { appendToBody: true },
    legend: {
      top: 10,
      type: "scroll",
      textStyle: {
        fontSize: 12,
      },
      itemWidth: 10,
      itemHeight: 10,
    },
    radar: { indicator: indicators, radius: "70%" },
    series: [{ type: "radar", data: series }],
  };

  return (
    <div className="p-4 relative">
      <ChartHeader title="Trends in Police‑Recorded Crimes" />
      <ExplanationSection title="How to Read This Chart">
        <p className="mb-2">
          This radar chart visualizes the distribution of different crime types across EU countries. Instead of showing numerical values in a table, it allows for an easy comparison of crime prevalence by category.
        </p>
        <ul className="list-disc list-inside space-y-1 mb-2">
          <li>
            <strong>Axes (Crime Categories):</strong> Each axis represents a specific crime type.
          </li>
          <li>
            <strong>Distance from Center:</strong> The further a point is from the center, the higher the number of reported crimes for that category.
          </li>
          <li>
            <strong>Country Profiles:</strong> Each country is represented by a distinct polygon, illustrating the relative crime distribution per category.
          </li>
        </ul>
        <p>
          This visualization helps identify crime trends and compare crime prevalence between different countries. For example, a country with a larger polygon suggests a higher overall crime rate, while specific spikes in certain directions indicate dominant crime categories.
        </p>
        <p>
          You can interact with the chart by filtering out specific crime categories using the "Hide Crime Groups" button.
        </p>
      </ExplanationSection>

      <div>
        {interactiveData && (
          <InteractiveFilter
            interactiveData={interactiveData}
            onFilterChange={handleFilterChange}
          />
        )}
        <div className="relative mb-4">
          <button
            onClick={() => setShowPopup((v) => !v)}
            className="flex mt-3 items-center gap-2 text-sm font-medium bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 shadow-sm transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            Hide Crime Groups
          </button>
          {showPopup && (
            <CrimeGroupPopup
              allCrimes={allCrimes}
              hiddenCrimes={hiddenCrimes}
              toggleCrime={toggleCrime}
              clearAll={() => setHiddenCrimes([])}
              onClose={() => setShowPopup(false)}
            />
          )}
        </div>
      </div>
      {error && (
        <div className="text-red-500 mt-4">
          <ErrorAlert message={error}></ErrorAlert>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <ReactECharts option={option} style={{ width: "100%", height: 600 }} />
      </div>
    </div>
  );
};

export default Question1Chart2;
