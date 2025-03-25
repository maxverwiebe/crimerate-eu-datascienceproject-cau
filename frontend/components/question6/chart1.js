import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";
import ErrorAlert from "../errorAlert";
import ChartHeader from "../chartHeader";
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const Question6Chart1 = () => {
  const [chartData, setChartData] = useState({});
  const [years, setYears] = useState([]);
  const [countriesList, setCountriesList] = useState([]);
  const [selectedYear, setSelectedYear] = useState("2008");
  const [selectedLegStat, setSelectedLegStat] = useState("Convicted person");
  const [selectedUnit, setSelectedUnit] = useState("Number");
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/question6/chart1`)
      .then((response) => response.json())
      .then((json) => {
        setChartData(json.chart_data);
        const availableYears = Object.keys(json.chart_data["Albania"]);
        setYears(availableYears);

        const countries = Object.keys(json.chart_data);
        setCountriesList(countries);
        setSelectedCountries(countries);

        setError(json.error);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const formatData = () => {
    const countries =
      selectedCountries.length > 0 ? selectedCountries : Object.keys(chartData);
    const males = [];
    const females = [];
    countries.forEach((country) => {
      const yearData = chartData[country] && chartData[country][selectedYear];
      if (yearData && yearData[selectedLegStat]) {
        const stat = yearData[selectedLegStat];
        const maleVal = stat["Males"] ? stat["Males"][selectedUnit] : 0;
        const femaleVal = stat["Females"] ? stat["Females"][selectedUnit] : 0;
        males.push(-1 * (maleVal || 0));
        females.push(femaleVal || 0);
      } else {
        males.push(0);
        females.push(0);
      }
    });
    return { countries, males, females };
  };

  const { countries, males, females } = formatData();

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: (params) => {
        const male = params.find((p) => p.seriesName === "Males");
        const female = params.find((p) => p.seriesName === "Females");

        const maleValue =
          male.value === 0 ? "No data available" : Math.abs(male.value);
        const femaleValue =
          female.value === 0 ? "No data available" : female.value;

        return `${params[0].name}<br/>
                Males: ${maleValue}<br/>
                Females: ${femaleValue}`;
      },
    },
    legend: {
      top: 30,
      data: ["Males", "Females"],
    },
    grid: {
      left: "5%",
      right: "5%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      axisLabel: {
        formatter: (value) => Math.abs(value),
      },
    },
    yAxis: {
      type: "category",
      data: countries,
      inverse: true,
    },
    series: [
      {
        name: "Males",
        type: "bar",
        data: males,
        itemStyle: { color: "#5470C6" },
      },
      {
        name: "Females",
        type: "bar",
        data: females,
        itemStyle: { color: "#EE6666" },
      },
    ],
  };

  const handleFilterChange = (updatedFilters) => {
    setSelectedYear(updatedFilters.year || selectedYear);
    setSelectedLegStat(updatedFilters.legStat || selectedLegStat);
    setSelectedUnit(updatedFilters.unit || selectedUnit);
    setSelectedCountries(updatedFilters.countries || selectedCountries);
  };

  const interactiveData = {
    year: {
      default: selectedYear,
      values: years,
      labels: years,
      multiple: false,
    },
    legStat: {
      default: selectedLegStat,
      values: ["Convicted person", "Prosecuted person", "Suspected person"],
      labels: ["Convicted person", "Prosecuted person", "Suspected person"],
      multiple: false,
    },
    unit: {
      default: selectedUnit,
      values: ["Number", "Per100k"],
      labels: ["Number", "Per100k"],
      multiple: false,
    },
    countries: {
      default: selectedCountries,
      values: countriesList,
      labels: countriesList,
      multiple: true,
    },
  };

  return (
    <div>
      <ChartHeader title="Gender distribution" />

      <InteractiveFilter
        interactiveData={interactiveData}
        onFilterChange={handleFilterChange}
      />
      {error && (
        <div className="text-red-500 mt-4">
          <ErrorAlert message={error}></ErrorAlert>
        </div>
      )}
      <ReactECharts option={option} style={{ width: "100%", height: 600 }} />
    </div>
  );
};

export default Question6Chart1;
