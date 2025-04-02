/*
 * chart1.js
 * This component is used to display the first chart for question 1.
 */

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";
import ChartHeader from "../chartHeader";
import ExplanationSection from "../explanationSection";
import ErrorAlert from "../errorAlert";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const Question1Chart1 = () => {
  const [chartData, setChartData] = useState([]);
  const [crimeTypes, setCrimeTypes] = useState([]);
  const [years, setYears] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({});
  const [interactiveData, setInteractiveData] = useState(null);
  const [error, setError] = useState(null);

  // format the data for the stacked bar chart by pivoting the data
  const formatStackedData = (pivotData) => {
    const countries = {};
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

  // fetch data from the backend API
  useEffect(() => {
    let url = `${process.env.NEXT_PUBLIC_BACKEND_API}/api/question1/chart1`;
    const params = new URLSearchParams();

    if (filterCriteria.time) {
      filterCriteria.time.forEach((val) => params.append("time", val));
    }
    if (filterCriteria.geo) {
      filterCriteria.geo.forEach((val) => params.append("geo", val));
    }
    if ([...params].length > 0) {
      url += "?" + params.toString();
    }

    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        if (json.interactive_data && json.interactive_data.time) {
          setYears(["all", ...json.interactive_data.time.values]);
        }
        if (json.chart_data && json.chart_data.pivot_data) {
          const formattedData = formatStackedData(json.chart_data.pivot_data);
          setChartData(formattedData);
          setCrimeTypes(Object.keys(json.chart_data.pivot_data));
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

  const crimeColorMapping = {
    "Acts against computer systems": "#FF6384",
    "Attempted intentional homicide": "#36A2EB",
    Bribery: "#FFCE56",
    Burglary: "#4BC0C0",
    "Burglary of private residential premises": "#9966FF",
    "Child pornography": "#FF9F40",
    Corruption: "#2ECC71",
    Fraud: "#E74C3C",
    "Intentional homicide": "#3498DB",
    Kidnapping: "#F39C12",
    "Money laundering": "#8E44AD",
    "Participation in an organized criminal group": "#1ABC9C",
    Rape: "#D35400",
    Robbery: "#27AE60",
    "Serious assault": "#2980B9",
    "Sexual crimes": "#C0392B",
    Theft: "#16A085",
    "Theft of a motorized vehicle or parts thereof": "#9B59B6",
    "Unlawful acts involving controlled drugs or precursors": "#34495E",
  };

  const option = {
    tooltip: {
      trigger: "axis",
      appendToBody: true,
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: crimeTypes,
      top: 10,
      type: "scroll",
      textStyle: {
        fontSize: 12,
      },
      itemWidth: 10,
      itemHeight: 10,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: chartData.map((d) => d.country),
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: "value",
    },
    series: crimeTypes.map((crime) => ({
      name: crime,
      type: "bar",
      stack: "a",
      data: chartData.map((d) => d[crime] || 0),
      itemStyle: {
        color: crimeColorMapping[crime] || "#AAAAAA",
      },
    })),
  };

  return (
    <div>
      <ChartHeader
        title={"Crime categories reported by different countries in Europe"}
      />
      <ExplanationSection title="How to Read This Chart">
        <p className="mb-2">
          This chart displays the number of crimes reported by different
          countries in Europe, categorized by crime type. Instead of showing raw
          values in a table, it uses a stacked bar chart where:
        </p>
        <ul className="list-disc list-inside space-y-1 mb-2">
          <li>
            <strong>X‑Axis (Country):</strong> Represents different countries in
            the dataset.
          </li>
          <li>
            <strong>Y‑Axis (Number of Crimes):</strong> The total number of
            reported crimes for each country.
          </li>
          <li>
            <strong>Stacked Bars:</strong> Each color represents a specific
            crime category. The height of a stack indicates the total number of
            reported crimes for that country.
          </li>
        </ul>
        <p>
          This visualization allows you to compare crime levels between
          countries and identify which crime categories are more prevalent in
          each nation. For instance, a country with a particularly high total
          bar suggests a high crime rate across multiple categories.
        </p>
        <p>
          Use the interactive filter to adjust the dataset and explore specific
          time frames or geographic regions.
        </p>
      </ExplanationSection>

      {interactiveData && (
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
        <ReactECharts option={option} style={{ width: "100%", height: 600 }} />
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

export default Question1Chart1;
