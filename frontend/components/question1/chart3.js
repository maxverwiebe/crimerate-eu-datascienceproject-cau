import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";
import ChartHeader from "../chartHeader";
import ExplanationSection from "../explanationSection";
import ErrorAlert from "../errorAlert";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

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

  const formatBarData = (data) => {
    const { categories, values } = data;
    const result = categories.map((cat, index) => ({
      category: cat,
      value: values[index],
    }));
    return result.sort((a, b) => b.value - a.value);
  };

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
    console.log("Neue Filterkriterien:", newFilters);
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
      <ExplanationSection title="Explanation">
        <p>TODO</p>
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
    </div>
  );
};

export default Question1Chart3;
