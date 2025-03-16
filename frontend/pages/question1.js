import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const Question1 = () => {
  const [chartData, setChartData] = useState([]);
  const [crimeTypes, setCrimeTypes] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("all");

  const formatStackedData = (pivotData) => {
    const countries = {};
    // pivotData: { crimeType: { country: value, ... }, ... }
    Object.entries(pivotData).forEach(([crime, countryData]) => {
      Object.entries(countryData).forEach(([country, value]) => {
        if (!countries[country]) {
          countries[country] = { country };
        }
        countries[country][crime] = value;
      });
    });
    return Object.values(countries);
  };

  useEffect(() => {
    let url = "http://127.0.0.1:5000/api/question1/chart1";
    if (selectedYear !== "all") {
      url += `?time=${selectedYear}`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        if (json.interactive_data && json.interactive_data.time) {
          setYears(["all", ...json.interactive_data.time]);
        }
        if (json.chart_data && json.chart_data.pivot_data) {
          const formattedData = formatStackedData(json.chart_data.pivot_data);
          setChartData(formattedData);
          setCrimeTypes(Object.keys(json.chart_data.pivot_data));
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [selectedYear]);

  return (
    <div>
      <h1>Question 1</h1>
      <p>This is the page for Question 1.</p>
      <h2 className="mb-5">add stuff here...</h2>
      <hr></hr>
      <h3 className="text-xl">
        Sub question: How do trends in police recorded crimes differ between all
        EU countries? Whats the most happening crime in the EU?
      </h3>
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
      >
        {years.map((year, index) => (
          <option key={index} value={year}>
            {year}
          </option>
        ))}
      </select>
      <div style={{ overflowX: "auto" }}>
        <BarChart
          width={1400}
          height={600}
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="country"
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          {crimeTypes.map((crime, index) => {
            const highContrastColors = [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
              "#2ECC71",
              "#E74C3C",
              "#3498DB",
              "#F39C12",
            ];
            return (
              <Bar
                key={crime}
                dataKey={crime}
                stackId="a"
                fill={highContrastColors[index % highContrastColors.length]}
              />
            );
          })}
        </BarChart>
      </div>
    </div>
  );
};

export default Question1;
