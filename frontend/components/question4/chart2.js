import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";
import ExplanationSection from "../explanationSection";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const Question4Chart2 = () => {
  const [chartData, setChartData] = useState([]);
  const [interactiveData, setInteractiveData] = useState(null);
  const [filters, setFilters] = useState({ geo: "DE" });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.geo) params.append("geo", filters.geo);

    fetch(
      `${
        process.env.NEXT_PUBLIC_BACKEND_API
      }/api/question4/chart2?${params.toString()}`
    )
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
      data: ["Crime Rate per 100k", "GDP Growth", "Total Crime", "Population"],
    },
    xAxis: {
      type: "category",
      name: "Year",
      data: chartData.map((d) => d.year),
    },
    legend: {
      data: [
        "Crime Rate Change (%)",
        "Total Crime Change (%)",
        "Population Change (%)",
        "GDP Growth Change (%)",
      ],
    },
    yAxis: {
      type: "value",
      name: "Year-over-Year Change (%)",
    },
    series: [
      {
        name: "Total Crime Change (%)",
        type: "line",
        data: chartData.map((d) => d.total_crime_change_pct),
        smooth: true,
      },
      {
        name: "Population Change (%)",
        type: "line",
        data: chartData.map((d) => d.population_change_pct),
        smooth: true,
      },
      {
        name: "GDP Growth Change (%)",
        type: "line",
        data: chartData.map((d) => d.gdp_growth_change_pct),
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

      <ExplanationSection title="Show Chart Explanation">
        <h3 className="text-xl font-semibold mb-2">How to Read This Chart</h3>
        <p className="mb-2">
          This chart shows the{" "}
          <strong>year-over-year percentage changes</strong> of key indicators
          for the selected country. Instead of showing absolute numbers, it
          highlights how these metrics evolved over time in relative terms.
        </p>
        <ul className="list-disc list-inside space-y-1 mb-2">
          <li>
            <strong>Crime Rate Change (%):</strong> The percentage change in the
            number of criminal offenses per 100,000 people compared to the
            previous year.
          </li>
          <li>
            <strong>Total Crime Change (%):</strong> The overall percentage
            change in the absolute number of recorded crimes.
          </li>
          <li>
            <strong>Population Change (%):</strong> The year-over-year
            percentage change in total population size.
          </li>
          <li>
            <strong>GDP Growth Change (%):</strong> The relative annual change
            in GDP growth (i.e., acceleration or deceleration).
          </li>
        </ul>
        <p>
          This allows for better comparison between trends, regardless of
          differences in unit scales. For instance, if crime increases by 10%
          while GDP growth slows by 3%, this may suggest a potential
          relationship.
        </p>
      </ExplanationSection>

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
