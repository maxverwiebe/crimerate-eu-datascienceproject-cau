/*
 * chart3.js
 * This component is used to display the 3rd chart for question 1.
 * There might be AI generated code in this file.
 */

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";
import ChartHeader from "../chartHeader";
import ExplanationSection from "../explanationSection";
import ErrorAlert from "../errorAlert";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// truncateLabel function to limit the length of the label for btter readability
const truncateLabel = (value, maxLength = 20) => {
  if (value.length > maxLength) {
    return value.substring(0, maxLength) + "...";
  }
  return value;
};

const Question1Chart3 = () => {
  const [chartData, setChartData] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({});
  const [interactiveData, setInteractiveData] = useState(null);
  const [error, setError] = useState(null);

  // function to format the data for the bar chart
  const formatBarData = (data) => {
    const { categories, values } = data;
    const result = categories.map((cat, index) => ({
      category: cat,
      value: values[index],
    }));
    return result.sort((a, b) => b.value - a.value);
  };

  // fetch data from the backend API
  useEffect(() => {
    let url = `${process.env.NEXT_PUBLIC_BACKEND_API}/api/question1/chart3`;
    const params = new URLSearchParams();
    if (filterCriteria.geo) {
      filterCriteria.geo.forEach((val) => params.append("geo", val));
    }
    if (filterCriteria.time) {
      filterCriteria.time.forEach((val) => params.append("time", val));
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

        if (json.error) {
          setError(json.error);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [filterCriteria]);

  const handleFilterChange = (newFilters) => {
    setFilterCriteria(newFilters);
  };

  const yAxisData = chartData.map((item) => item.category);
  const seriesData = chartData.map((item) => item.value);

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: "150px",
      right: "30px",
      bottom: "20px",
      top: "20px",
      containLabel: true,
    },
    xAxis: {
      type: "value",
    },
    yAxis: {
      type: "category",
      data: yAxisData,
      inverse: true,
      axisLabel: {
        formatter: (value) => truncateLabel(value, 20),
      },
    },
    series: [
      {
        name: "Value",
        type: "bar",
        data: seriesData,
        itemStyle: {
          color: "#8884d8",
        },
      },
    ],
  };

  return (
    <div className="p-4">
      <ChartHeader title="Frequency of crimes in one or more countries in a certain year" />
      <ExplanationSection title="How to Read This Chart">
        <h3 className="text-xl font-semibold mb-2">
          How to Read the Crime Frequency Bar Chart
        </h3>
        <p className="mb-2">
          This bar chart displays the frequency of reported crimes in one or
          more selected countries for a specific year. The categories are ranked
          by frequency to highlight the most prevalent crime types.
        </p>
        <ul className="list-disc list-inside space-y-1 mb-2">
          <li>
            <strong>Y-Axis (Crime Categories):</strong> Each bar represents a
            specific crime type.
          </li>
          <li>
            <strong>X-Axis (Crime Count):</strong> The length of each bar
            indicates the number of reported crimes.
          </li>
          <li>
            <strong>Sorting:</strong> The crimes are sorted in descending order,
            with the most frequently reported crimes appearing at the top.
          </li>
        </ul>
        <p>
          This visualization helps in identifying the most common crimes in a
          given country and time period. You can interact with the chart by
          filtering data based on geographic regions and time frames.
        </p>
      </ExplanationSection>

      {interactiveData && interactiveData.geo && (
        <InteractiveFilter
          interactiveData={interactiveData}
          onFilterChange={handleFilterChange}
        />
      )}
      {error && (
        <div className="text-red-500 mt-4">
          <ErrorAlert message={error}></ErrorAlert>
        </div>
      )}
      <div style={{ overflowX: "auto" }}>
        <ReactECharts option={option} style={{ width: "100%", height: 500 }} />
      </div>
      <p className="text-sm text-gray-500 m-2">
        Source:{" "}
        <a
          href="https://ec.europa.eu/eurostat/databrowser/product/page/CRIM_OFF_CAT"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Eurostat crim_off_cat
        </a>
      </p>
    </div>
  );
};

export default Question1Chart3;
