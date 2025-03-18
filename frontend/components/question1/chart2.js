import React, { useState, useEffect } from "react";
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

const Question1Chart2 = () => {
  const [chartData, setChartData] = useState([]);
  const [radarCountries, setRadarCountries] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({});
  const [interactiveData, setInteractiveData] = useState(null);
  const [hiddenCrimes, setHiddenCrimes] = useState([]);

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
    <div>
      <h2>Question 1 Radar Chart</h2>
      <p>
        Dieses Radar Chart zeigt Trends in police recorded crimes. Die Achsen
        repräsentieren die Verbrechenskategorien, und es wird pro Land ein Radar
        gezeichnet.
      </p>
      {interactiveData && (
        <InteractiveFilter
          interactiveData={interactiveData}
          onFilterChange={handleFilterChange}
        />
      )}
      <div style={{ margin: "1rem 0" }}>
        <h4>Hide Crime Groups:</h4>
        {allCrimes.map((crime) => (
          <label key={crime} style={{ display: "block" }}>
            <input
              type="checkbox"
              checked={hiddenCrimes.includes(crime)}
              onChange={() => toggleCrime(crime)}
            />{" "}
            {crime}
          </label>
        ))}
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
