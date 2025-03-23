import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const Question1Chart1 = () => {
  const [chartData, setChartData] = useState([]);
  const [crimeTypes, setCrimeTypes] = useState([]);
  const [years, setYears] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({});
  const [interactiveData, setInteractiveData] = useState(null);

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

  useEffect(() => {
    let url = "http://127.0.0.1:5000/api/question1/chart1";
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
          // Setze years basierend auf der Struktur: hier nutzen wir die "values"
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
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [filterCriteria]);

  const handleFilterChange = (newFilters) => {
    console.log("Neue Filterkriterien:", newFilters);
    setFilterCriteria(newFilters);
  };

  // Mapping der Farben für die einzelnen Straftatarten
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

  // Erzeuge die ECharts Option für ein gestapeltes Balkendiagramm
  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: crimeTypes,
      top: 10,
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
      <h2>Question 1 Chart</h2>
      <p>
        This chart shows how trends in police recorded crimes differ between EU
        countries.
      </p>
      {interactiveData && (
        <InteractiveFilter
          interactiveData={interactiveData}
          onFilterChange={handleFilterChange}
        />
      )}
      <div style={{ overflowX: "auto" }}>
        <ReactECharts option={option} style={{ width: "100%", height: 600 }} />
      </div>
    </div>
  );
};

export default Question1Chart1;
