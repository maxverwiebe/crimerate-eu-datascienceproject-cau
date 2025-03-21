import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const Question4Chart2 = () => {
  const [chartData, setChartData] = useState([]);
  const [interactiveData, setInteractiveData] = useState(null);
  const [filters, setFilters] = useState({ geo: "DE" });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.geo) params.append("geo", filters.geo);

    fetch(`http://127.0.0.1:5000/api/question4/chart2?${params.toString()}`)
      .then((res) => res.json())
      .then(({ chart_data, interactive_data }) => {
        setChartData(chart_data);
        setInteractiveData(interactive_data);
      })
      .catch(console.error);
  }, [filters]);

  if (chartData.length === 0) {
    return <div>Loading data...</div>;
  }

  const option = {
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["Crime Rate (Median)", "Population", "GDP Growth"],
    },
    xAxis: {
      type: "category",
      name: "Year",
      data: chartData.map((d) => d.year),
    },
    yAxis: [
      { type: "value", name: "Crime per 100k & GDP (%)" },
      { type: "value", name: "Population", position: "right" },
    ],
    series: [
      {
        name: "Crime Rate (Median)",
        type: "line",
        data: chartData.map((d) => d.median_crime_rate),
        smooth: true,
      },
      {
        name: "Population",
        type: "line",
        data: chartData.map((d) => d.population),
        smooth: true,
        yAxisIndex: 1,
      },
      {
        name: "GDP Growth",
        type: "line",
        data: chartData.map((d) => d.gdp_growth),
        smooth: true,
      },
    ],
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Crime Rate, Population and GDP Over Time
      </h2>

      <section className="bg-neutral-800 text-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-2">How to Read This Chart</h3>
        <p className="mb-2">
          This line chart compares three key indicators for a selected country
          across time:
        </p>
        <ul className="list-disc list-inside space-y-1 mb-2">
          <li>
            <strong>Crime Rate (Median):</strong> Median number of recorded
            criminal offenses per 100,000 people.
          </li>
          <li>
            <strong>Population:</strong> Total population size.
          </li>
          <li>
            <strong>GDP Growth:</strong> Annual percentage growth of gross
            domestic product.
          </li>
        </ul>
        <p>
          Use the filter above to switch between countries and observe how crime
          trends relate to demographic and economic changes.
        </p>
      </section>

      {interactiveData && (
        <InteractiveFilter
          interactiveData={interactiveData}
          onFilterChange={handleFilterChange}
        />
      )}

      <ReactECharts option={option} style={{ width: "100%", height: 500 }} />
    </div>
  );
};

export default Question4Chart2;
