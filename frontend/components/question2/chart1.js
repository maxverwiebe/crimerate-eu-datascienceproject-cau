import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";
import ChartHeader from "../chartHeader";
import ExplanationSection from "../explanationSection";
import ErrorAlert from "../errorAlert";
import ChartLoading from "../chartLoading";

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

  if (chartData.length === 0) {
    return <ChartLoading />;
  }

  return (
    <div>
      <ChartHeader title={"Highest‑Crime Regions of a Country"} />
      <ExplanationSection title="Show Chart Explanation">
        <p className="mb-2">
          This chart displays the total number of recorded crimes for each
          region (city or district) within the selected country and time period.
          Instead of showing crime rates per capita, it shows the absolute crime
          count, allowing you to see which regions have the highest overall
          crime volume.
        </p>
        <ul className="list-disc list-inside space-y-1 mb-2">
          <li>
            <strong>X‑Axis (City):</strong> Regions sorted in descending order
            by total crime count.
          </li>
          <li>
            <strong>Y‑Axis (Value):</strong> Absolute number of recorded crimes
            in each region.
          </li>
          <li>
            <strong>Show Top Regions Selector:</strong> Adjust how many top
            regions (e.g., Top 5, Top 10) are displayed.
          </li>
        </ul>
        <p className="mb-2">
          Use the interactive filters above to select a different country (geo
          code) or narrow down the time period. This helps you compare crime
          volumes across regions and identify hotspots of high criminal
          activity.
        </p>
        <p>
          A higher point indicates a greater total crime burden in that areA.
          Comparing these values side by side reveals which areas experience the
          most crime overall.
        </p>
      </ExplanationSection>

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
          className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
