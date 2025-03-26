import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";
import ErrorAlert from "../errorAlert";
import { getCountryCode } from "@dkkoval/react-eu-stats-map";
import ChartHeader from "../chartHeader";
import ExplanationSection from "../explanationSection";
import ChartLoading from "../chartLoading";
const EUMap = dynamic(
  () => import("@dkkoval/react-eu-stats-map").then((mod) => mod.default),
  { ssr: false }
);

const Question3Chart5 = () => {
  const [data, setData] = useState([]);
  const [interactiveData, setInteractiveData] = useState(null);
  const [filters, setFilters] = useState({});
  const [error, setError] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const params = new URLSearchParams();
    filters.geo?.forEach((g) => params.append("geo", g));
    filters.time?.forEach((t) => params.append("time", t));
    filters.legal_status?.forEach((l) => params.append("legal_status", l));

    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API
      }/api/question3/chart5?${params.toString()}`
    )
      .then((res) => res.json())
      .then(({ chart_data, interactive_data, error }) => {
        setData(chart_data);
        setInteractiveData(interactive_data);
        setError(error);
      })
      .catch((err) => setError(err.message));
  }, [filters]);

  useEffect(() => {
    const updateSize = () => {
      const width = Math.min(window.innerWidth * 0.95, 1000);
      setDimensions({
        width,
        height: Math.round(width * 0.6),
      });
    };

    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  if (!data.length) return <ChartLoading />;

  const aggregated = Object.values(
    data.reduce((acc, { geo, value }) => {
      if (!acc[geo]) acc[geo] = { geo, value: 0, count: 0 };
      acc[geo].value += value;
      acc[geo].count += 1;
      return acc;
    }, {})
  ).map(({ geo, value, count }) => ({ geo, value: value / count }));

  const mapData = aggregated.reduce((acc, { geo, value }) => {
    const code = getCountryCode(geo) || geo;
    acc[code] = value;
    return acc;
  }, {});

  const title =
    interactiveData?.title ||
    "Average number of people involved in bribery and corruption";
  const valueName = interactiveData?.valueName || "Value";

  return (
    <div>
      <ChartHeader title="Bribery & Corruption Across Europe" />

      <ExplanationSection title="How to read this chart">
        <p className="mb-2">
          This choropleth map visualizes the number of recorded bribery and
          corruption incidents per country for the selected year(s). Darker
          countries indicate higher average incident counts.
        </p>
        <ul className="list-disc list-inside space-y-1 mb-2">
          <li>
            <strong>Country:</strong> Each EU member state is shaded according
            to its average incident count.
          </li>
          <li>
            <strong>Color Scale:</strong> Darker shades represent higher average
            numbers of incidents.
          </li>
        </ul>
        <p>
          Use the filters above to adjust the time period or legal status. This
          map helps identify geographic hotspots of bribery and corruption
          across Europe.
        </p>
      </ExplanationSection>

      <InteractiveFilter
        interactiveData={interactiveData}
        onFilterChange={setFilters}
      />
      {error && (
        <div className="text-red-500 mt-4">
          <ErrorAlert message={error} />
        </div>
      )}
      <div className="mt-4">
        <EUMap
          width={dimensions.width}
          height={dimensions.height}
          title={""}
          valueName={valueName}
          data={mapData}
          to
        />
      </div>
    </div>
  );
};

export default Question3Chart5;
