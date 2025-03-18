import React, { useState, useEffect } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import InteractiveFilter from "../interactiveFilter";

const Question2Chart1 = () => {
  const [chartData, setChartData] = useState([]);
  const [interactiveData, setInteractiveData] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState({});

  // Formatiere die API-Daten in ein Array von Objekten
  const formatScatterData = (data) => {
    const { cities, geo_codes, values } = data;
    return cities.map((city, index) => ({
      city,
      geo_code: geo_codes[index],
      value: values[index],
    }));
  };

  // Holt die Daten von der API basierend auf filterCriteria
  useEffect(() => {
    let url = "http://127.0.0.1:5000/api/question2/chart1";
    const params = new URLSearchParams();
    if (filterCriteria.time) {
      filterCriteria.time.forEach((val) => params.append("time", val));
    }
    if (filterCriteria.geo) {
      filterCriteria.geo.forEach((val) => params.append("geo", val));
    }
    if ([...params].length > 0) {
      url += "?" + params.toString();
    } else {
      url += "?geo=DE";
    }

    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        if (json.chart_data) {
          const formattedData = formatScatterData(json.chart_data);
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
      <h2 className="text-2xl font-bold mb-4">Question 2 Scatter Chart</h2>
      <p className="mb-4">
        Diese Grafik zeigt die aggregierten Werte pro Stadt (geo) anhand der
        Polizeiverbrechen. Die Städte werden auf der x-Achse (als Kategorien)
        und die aggregierten Werte auf der y-Achse dargestellt.
      </p>
      {interactiveData && (
        <div className="mb-6">
          <InteractiveFilter
            interactiveData={interactiveData}
            onFilterChange={handleFilterChange}
          />
        </div>
      )}
      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" />
          {/* x-Achse als Kategorie */}
          <XAxis
            dataKey="city"
            type="category"
            angle={-45}
            textAnchor="end"
            interval={0}
          />
          <YAxis dataKey="value" />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Legend />
          <Scatter name="Crime" data={chartData} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Question2Chart1;
