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

const Question1Chart4 = () => {
  const [data, setData] = useState([]);
  const [interactiveData, setInteractiveData] = useState(null);
  const [filters, setFilters] = useState({});
  const [error, setError] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const params = new URLSearchParams();
    filters.time?.forEach((g) => params.append("time", g));

    fetch(
      `${
        process.env.NEXT_PUBLIC_BACKEND_API
      }/api/question1/chart4?${params.toString()}`
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

  const mapData = data.reduce((acc, { geo, crime_rate_per_100k }) => {
    const code = getCountryCode(geo) || geo;
    acc[code] = crime_rate_per_100k;
    return acc;
  }, {});

  return (
    <div>
      <ChartHeader title="Crime Rate per 100 000 Inhabitants Across Europe" />

      <ExplanationSection title="How to Read this Chart">
        <p className="mb-2">
          This choropleth map shows the latest crime rate per 100 000
          inhabitants for each country in Europe. Darker shading indicates a
          higher crime rate.
        </p>
        <ul className="list-disc list-inside space-y-1 mb-2">
          <li>
            <strong>Country:</strong> Each state in Europe.
          </li>
          <li>
            <strong>Value:</strong> Crime incidents per 100 000 people in the
            most recent year.
          </li>
        </ul>
        <p>Use the country filter above to focus on specific member states.</p>
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

      <div className="mt-4 w-full" style={{ position: "relative" }}>
        <div className="">
          <EUMap
            width={dimensions.width}
            height={dimensions.height}
            title=""
            valueName="Crime Rate per 100k"
            data={mapData}
          />
        </div>
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

export default Question1Chart4;
