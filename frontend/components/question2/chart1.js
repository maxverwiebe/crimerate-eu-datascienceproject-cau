import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const Question2Chart1 = () => {
  const [chartData, setChartData] = useState([]);
  const [interactiveData, setInteractiveData] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState({});
  const [topCount, setTopCount] = useState(10);

  // Formatiere die API-Daten in ein Array von Objekten
  const formatScatterData = (data) => {
    const { cities, geo_codes, values } = data;
    return cities.map((city, index) => ({
      city,
      geo_code: geo_codes[index],
      value: values[index],
    }));
  };

  // API-Call: Hole die Daten basierend auf filterCriteria
  useEffect(() => {
    let url = `${process.env.NEXT_PUBLIC_BACKEND_API}/api/question2/chart1`;
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

  // Sortiere die Daten absteigend nach value und schneide auf topCount zu.
  const sortedData = [...chartData].sort((a, b) => b.value - a.value);
  const displayedData = sortedData.slice(0, topCount);

  // Erzeuge ECharts-Daten: xAxis = Städte, series-Daten = Werte
  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{b}<br/>Value: {c}",
    },
    xAxis: {
      type: "category",
      data: displayedData.map((d) => d.city),
      axisLabel: {
        rotate: -45,
      },
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Crime",
        type: "scatter",
        data: displayedData.map((d) => d.value),
        symbolSize: 10,
        itemStyle: {
          color: "#8884d8",
        },
      },
    ],
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Question 2 Scatter Chart</h2>
      <p className="mb-4">
        This graph shows the aggregated values per city (geo) based on police
        crimes. The cities are shown as categories on the x-axis, and the y-axis
        shows the aggregated value. You can use the filter and the dropdown
        (combo box) to control the points displayed.
      </p>
      {interactiveData && (
        <div className="mb-6">
          <InteractiveFilter
            interactiveData={interactiveData}
            onFilterChange={handleFilterChange}
          />
        </div>
      )}
      <div className="mb-4">
        <label className="mr-2">Show Top Regions:</label>
        <select
          value={topCount}
          onChange={(e) => setTopCount(parseInt(e.target.value))}
        >
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
          <option value={20}>Top 20</option>
          <option value={50}>Top 50</option>
        </select>
      </div>
      <div style={{ overflowX: "auto" }}>
        <ReactECharts option={option} style={{ width: "100%", height: 500 }} />
      </div>
    </div>
  );
};

export default Question2Chart1;
