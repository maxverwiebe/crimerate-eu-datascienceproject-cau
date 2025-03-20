import React, { useState, useEffect, useRef } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import InteractiveFilter from "../interactiveFilter";

// Hilfsfunktion, die Pivot-Daten in ein Array von Objekten transformiert
const formatRadarData = (pivotData) => {
  const countriesSet = new Set();
  Object.values(pivotData).forEach((countryData) => {
    Object.keys(countryData).forEach((country) => countriesSet.add(country));
  });
  const countries = Array.from(countriesSet);
  const radarData = Object.entries(pivotData).map(([crime, countryData]) => {
    let entry = { crime };
    countries.forEach((country) => {
      entry[country] = countryData[country] || 0;
    });
    return entry;
  });
  return { radarData, countries };
};

// Popup-Komponente für die Crime-Gruppen-Auswahl
const CrimeGroupPopup = ({ allCrimes, hiddenCrimes, toggleCrime, onClose }) => {
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={popupRef}
      className="absolute z-50 bg-neutral-800 border border-gray-300 shadow-lg p-4 rounded"
      style={{ right: 0, top: "100%" }}
    >
      <h4 className="text-white font-semibold mb-2">Hide Crime Groups</h4>
      {allCrimes.map((crime) => (
        <label key={crime} className="block text-white text-sm mb-1">
          <input
            type="checkbox"
            checked={hiddenCrimes.includes(crime)}
            onChange={() => toggleCrime(crime)}
            className="mr-2"
          />
          {crime}
        </label>
      ))}
    </div>
  );
};

const Question1Chart2 = () => {
  const [chartData, setChartData] = useState([]);
  const [radarCountries, setRadarCountries] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({});
  const [interactiveData, setInteractiveData] = useState(null);
  const [hiddenCrimes, setHiddenCrimes] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#0088FE",
    "#00C49F",
    "#FF8042",
  ];

  useEffect(() => {
    let url = "http://127.0.0.1:5000/api/question1/chart1";
    const params = new URLSearchParams();

    if (filterCriteria.time) {
      filterCriteria.time.forEach((val) => params.append("time", val));
    }
    if (filterCriteria.geo) {
      filterCriteria.geo.forEach((val) => params.append("geo", val));
    }
    if ([...params].length > 0) {
      url += "?" + params.toString();
    }

    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        if (json.chart_data && json.chart_data.pivot_data) {
          const { radarData, countries } = formatRadarData(
            json.chart_data.pivot_data
          );
          setChartData(radarData);
          setRadarCountries(countries);
        }
        if (json.interactive_data) {
          setInteractiveData(json.interactive_data);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [filterCriteria]);

  const handleFilterChange = (newFilters) => {
    console.log("Neue Filterkriterien:", newFilters);
    setFilterCriteria(newFilters);
  };

  const toggleCrime = (crime) => {
    setHiddenCrimes((prev) =>
      prev.includes(crime) ? prev.filter((c) => c !== crime) : [...prev, crime]
    );
  };

  const allCrimes = chartData.map((row) => row.crime);
  const displayedData = chartData.filter(
    (row) => !hiddenCrimes.includes(row.crime)
  );

  return (
    <div className="relative p-4">
      <h2 className="text-2xl font-bold mb-4">Question 1 Radar Chart</h2>
      <p className="mb-4">
        This radar chart shows trends in police recorded crimes. The axes
        represent the crime categories and one radar is drawn per country.
      </p>
      {interactiveData && (
        <InteractiveFilter
          interactiveData={interactiveData}
          onFilterChange={handleFilterChange}
        />
      )}
      <div className="relative mb-4">
        <button
          onClick={() => setShowPopup(!showPopup)}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none"
        >
          {showPopup ? "Close Crime Groups" : "Hide Crime Groups"}
        </button>
        {showPopup && (
          <CrimeGroupPopup
            allCrimes={allCrimes}
            hiddenCrimes={hiddenCrimes}
            toggleCrime={toggleCrime}
            onClose={() => setShowPopup(false)}
          />
        )}
      </div>
      <div style={{ overflowX: "auto" }}>
        <ResponsiveContainer width="100%" height={600}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={displayedData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="crime" />
            <PolarRadiusAxis />
            <Tooltip />
            <Legend />
            {radarCountries.map((country, index) => (
              <Radar
                key={country}
                name={country}
                dataKey={country}
                stroke={COLORS[index % COLORS.length]}
                fill={COLORS[index % COLORS.length]}
                fillOpacity={0.6}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Question1Chart2;
