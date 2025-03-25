import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";
import ErrorAlert from "../errorAlert";
import ChartHeader from "../chartHeader";
import ChartLoading from "../chartLoading";
import ExplanationSection from "../explanationSection";
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

  if (!chartData) {
    return <ChartLoading />;
  }

  return (
    <div>
      <ChartHeader title="Gender distribution" />
      <ExplanationSection title="How to Read This Chart">
        <p className="mb-2">
          This population pyramid chart visualizes the distribution of individuals involved in
          crime cases, broken down by gender, for a selected legal status
          (Suspected, Prosecuted, or Convicted) across different years and countries.
          The data can be viewed either as the total number of individuals or
          as the count per 100,000 inhabitants.
        </p>
        <ul className="list-disc list-inside space-y-1 mb-2">
          <li>
            <strong>X‑Axis (Number of Persons):</strong> Displays either the total number of individuals
            or the count per 100,000 inhabitants, depending on the selected unit.
          </li>
          <li>
            <strong>Y‑Axis (Country):</strong> Each row represents a selected country in Europe
          </li>
          <li>
            <strong>Mirrored Bars:</strong> The chart is split into two sections:
            Males on the left and Females on the right showing each gender’s
            contribution to the total count.
          </li>
        </ul>
      </ExplanationSection>



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
