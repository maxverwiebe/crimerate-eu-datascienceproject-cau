import React, { useState, useEffect, useRef } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import InteractiveFilter from "../interactiveFilter";

const Question2Chart1 = () => {
  const [chartData, setChartData] = useState([]);
  const [interactiveData, setInteractiveData] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const animationRef = useRef(null);

  // Formatiere die API-Daten in ein Array von Objekten
  const formatScatterData = (data) => {
    const { cities, geo_codes, values } = data;
    return cities.map((city, index) => ({
      city,
      geo_code: geo_codes[index],
      value: values[index],
    }));
  };

  // Holt die Daten von der API basierend auf filterCriteria
  useEffect(() => {
    let url = "http://127.0.0.1:5000/api/question2/chart1";
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
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [filterCriteria]);

  // Stop animation when component unmounts
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  const handleFilterChange = (newFilters) => {
    console.log("Neue Filterkriterien:", newFilters);
    setFilterCriteria(newFilters);
    // Reset animation when filters change manually
    if (isAnimating) {
      stopAnimation();
    }
  };

  const startAnimation = () => {
    if (
      !interactiveData ||
      !interactiveData.time ||
      interactiveData.time.length === 0
    ) {
      return;
    }

    setIsAnimating(true);
    animateNextTimeStep();
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
  };

  const animateNextTimeStep = () => {
    if (!interactiveData || !interactiveData.time) return;

    const timeOptions = interactiveData.time;

    // Set filter to only show current time step
    const newFilterCriteria = {
      ...filterCriteria,
      time: [timeOptions[currentTimeIndex]],
    };

    setFilterCriteria(newFilterCriteria);

    // Advance to next time step or loop back to beginning
    const nextIndex = (currentTimeIndex + 1) % timeOptions.length;
    setCurrentTimeIndex(nextIndex);

    // Schedule next animation frame
    animationRef.current = setTimeout(() => {
      if (isAnimating) {
        animateNextTimeStep();
      }
    }, 3000); // 1 second between frames
  };

  const toggleAnimation = () => {
    if (isAnimating) {
      stopAnimation();
    } else {
      startAnimation();
    }
  };

  const getCurrentYear = () => {
    if (interactiveData?.time && filterCriteria.time?.length === 1) {
      return filterCriteria.time[0];
    }
    return "All Years";
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Question 2 Scatter Chart</h2>
      <p className="mb-4">
        Diese Grafik zeigt die aggregierten Werte pro Stadt (geo) anhand der
        Polizeiverbrechen. Die Städte werden auf der x-Achse (als Kategorien)
        und die aggregierten Werte auf der y-Achse dargestellt.
      </p>
      {interactiveData && (
        <div className="mb-6">
          <InteractiveFilter
            interactiveData={interactiveData}
            onFilterChange={handleFilterChange}
          />

          <div className="mt-4 flex items-center">
            <button
              onClick={toggleAnimation}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {isAnimating ? "Stop Animation" : "Start Animation"}
            </button>

            {isAnimating && (
              <span className="ml-4 font-bold text-lg animate-pulse">
                Aktuelles Jahr: {getCurrentYear()}
              </span>
            )}
          </div>
        </div>
      )}
      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="city"
            type="category"
            angle={-45}
            textAnchor="end"
            interval={0}
          />
          <YAxis dataKey="value" />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Legend />
          <Scatter name="Crime" data={chartData} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Question2Chart1;
