import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import InteractiveFilter from "../interactiveFilter"; // Verwende den vorhandenen Filter

// Custom Tick-Komponente für die Y-Achse, die lange Texte abschneidet
const CustomizedYAxisTick = ({ x, y, payload, maxLength = 15 }) => {
  let text = payload.value;
  if (text.length > maxLength) {
    text = text.substring(0, maxLength) + "...";
  }
  return (
    <text
      x={x - 5}
      y={y}
      dy={4}
      textAnchor="end"
      fill="#666"
      style={{ fontSize: 12 }}
    >
      {text}
    </text>
  );
};

const Question1Chart3 = () => {
  const [chartData, setChartData] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({});
  const [interactiveData, setInteractiveData] = useState(null);

  // Formatiere die API-Daten in ein Array von Objekten und sortiere absteigend (höchster Wert oben)
  const formatBarData = (data) => {
    const { categories, values } = data;
    const result = categories.map((cat, index) => ({
      category: cat,
      value: values[index],
    }));
    // Sortiere absteigend: Das erste Element hat den höchsten Wert.
    return result.sort((a, b) => b.value - a.value);
  };

  // API-Call: Hole Chart-Daten basierend auf den Filterkriterien
  useEffect(() => {
    let url = "http://127.0.0.1:5000/api/question1/chart3";
    const params = new URLSearchParams();

    if (filterCriteria.geo) {
      filterCriteria.geo.forEach((val) => params.append("geo", val));
    }
    if ([...params].length > 0) {
      url += "?" + params.toString();
    }

    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        if (json.chart_data) {
          const formattedData = formatBarData(json.chart_data);
          setChartData(formattedData);
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

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Question 1 Chart 3</h2>
      <p className="mb-4">
        Dieses Balkendiagramm zeigt, wie die aggregierten Polizeiverbrechen nach
        Kategorien in einem ausgewählten Land verteilt sind.
      </p>
      {interactiveData && interactiveData.geo && (
        <div className="mb-6">
          <InteractiveFilter
            interactiveData={interactiveData}
            onFilterChange={handleFilterChange}
          />
        </div>
      )}
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            dataKey="category"
            type="category"
            tick={<CustomizedYAxisTick maxLength={20} />}
            interval={0}
          />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Question1Chart3;
