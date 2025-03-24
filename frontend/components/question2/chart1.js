import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";
import ChartHeader from "../chartHeader";
import ExplanationSection from "../explanationSection";
import ErrorAlert from "../errorAlert";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const Question2Chart1 = () => {
  const [chartData, setChartData] = useState([]);
  const [interactiveData, setInteractiveData] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState({});
  const [topCount, setTopCount] = useState(10);
  const [error, setError] = useState(null);

  const formatScatterData = (data) => {
    const { cities, geo_codes, values } = data;
    return cities.map((city, index) => ({
      city,
      geo_code: geo_codes[index],
      value: values[index],
    }));
  };

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
        if (json.error) {
          setError(json.error);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [filterCriteria]);

  const handleFilterChange = (newFilters) => {
    console.log("Neue Filterkriterien:", newFilters);
    setFilterCriteria(newFilters);
  };

  const sortedData = [...chartData].sort((a, b) => b.value - a.value);
  const displayedData = sortedData.slice(0, topCount);

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
      <ChartHeader title={"Crime Rate by Region"} />
      <ExplanationSection
        explanation={
          "This chart shows the crime rate in different regions. The crime rate is calculated as the number of crimes per 100,000 inhabitants."
        }
      />

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
      {error && (
        <div className="text-red-500 mt-4">
          <ErrorAlert message={error}></ErrorAlert>
        </div>
      )}
      <div style={{ overflowX: "auto" }}>
        <ReactECharts option={option} style={{ width: "100%", height: 500 }} />
      </div>
    </div>
  );
};

export default Question2Chart1;
