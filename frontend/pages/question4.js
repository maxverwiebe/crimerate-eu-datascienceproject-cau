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

const Question4 = () => {
  const [chartData, setChartData] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("all");

  useEffect(() => {
    let url = "http://127.0.0.1:5000/api/question4/chart1";
    if (selectedYear !== "all") {
      url += `?time=${selectedYear}`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        if (json.interactive_data && json.interactive_data.time) {
          setYears(["all", ...json.interactive_data.time]);
        }

        const formattedData = Object.keys(json.chart_data).map((key) => {
          const value = json.chart_data[key];
          return {
            name: key,
            value:
              typeof value === "object" && value.time !== undefined
                ? value.time
                : value,
          };
        });
        setChartData(formattedData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [selectedYear]);

  return (
    <div>
      <h1>Question 4</h1>
      <p>This is the page for Question 4.</p>
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
      <BarChart
        width={600}
        height={300}
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </div>
  );
};

export default Question4;
