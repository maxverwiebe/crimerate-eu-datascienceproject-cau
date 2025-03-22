import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";
import ExplanationSection from "../explanationSection";
import SectionHeader from "../sectionHeader";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// Funktion zur Berechnung der linearen Regression
const calculateRegression = (data) => {
    if (data.length < 2) return { lineData: [], slope: 0, intercept: 0 };

    const n = data.length;
    const sumX = data.reduce((acc, d) => acc + d.value[0], 0);
    const sumY = data.reduce((acc, d) => acc + d.value[1], 0);
    const sumXY = data.reduce((acc, d) => acc + d.value[0] * d.value[1], 0);
    const sumX2 = data.reduce((acc, d) => acc + d.value[0] ** 2, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
    const intercept = (sumY - slope * sumX) / n;

    const xMin = Math.min(...data.map((d) => d.value[0]));
    const xMax = Math.max(...data.map((d) => d.value[0]));

    return {
        lineData: [
            [xMin, slope * xMin + intercept],
            [xMax, slope * xMax + intercept],
        ],
        slope,
        intercept,
    };
};

const Question5Chart2 = () => {
    const [chartData, setChartData] = useState([]);
    const [interactiveData, setInteractiveData] = useState(null);
    const [selectedYear, setSelectedYear] = useState(["2020"]);
    const [selectedIccs, setSelectedIccs] = useState("Intentional homicide");
    const [selectedCountries, setSelectedCountries] = useState([]);

    useEffect(() => {
        fetch(
            `http://127.0.0.1:5000/api/question5/chart2?time=${selectedYear.join(",")}&iccs=${encodeURIComponent(
                selectedIccs
            )}`
        )
            .then((res) => res.json())
            .then(({ chart_data, interactive_data }) => {
                setChartData(chart_data);
                setInteractiveData(interactive_data);
            })
            .catch(console.error);
    }, [selectedYear, selectedIccs]);

    if (chartData.length === 0) {
        return <div>Lade Daten...</div>;
    }

    // Daten nach gewählten Ländern filtern
    const filteredData = chartData.filter(
        (d) => selectedCountries.length === 0 || selectedCountries.includes(d.geo)
    );

    const scatterData = filteredData.map((d) => ({
        name: d.geo,
        value: [d.crime_per_100k, d.police_per_100k],
    }));

    // Regressionslinie berechnen
    const { lineData, slope, intercept } = calculateRegression(scatterData);

    const option = {
        tooltip: {
            formatter: (params) => {
                if (params.seriesType === "line") {
                    return `Regression: y = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}`;
                }
                const [crimeRate, policePer100k] = params.data.value;
                return `
          ${params.name}<br/>
          Crime Rate: ${crimeRate.toFixed(2)} per 100,000<br/>
          Police Officers: ${policePer100k.toFixed(2)} per 100,000
        `;
            },
        },
        xAxis: {
            name: "Crime Rate per 100,000",
            type: "value",
            splitLine: { show: true },
        },
        yAxis: {
            name: "Police Officers per 100,000",
            type: "value",
            splitLine: { show: true },
        },
        dataZoom: [{ type: "inside" }, { type: "slider" }],
        series: [
            {
                type: "scatter",
                symbolSize: 10,
                data: scatterData,
                label: {
                    show: true,
                    formatter: "{b}",
                    position: "top",
                },
                emphasis: {
                    label: {
                        show: true,
                        fontWeight: "bold",
                    },
                },
            },
            {
                type: "line",
                data: lineData,
                smooth: true,
                lineStyle: {
                    color: "red",
                    width: 2,
                    type: "solid",
                },
                tooltip: {
                    show: true,
                },
            },
        ],
    };

    const handleFilterChange = (filters) => {
        if (filters.time) setSelectedYear(filters.time);
        if (filters.iccs) setSelectedIccs(filters.iccs);
        if (filters.geo) setSelectedCountries(filters.geo);
    };

    return (
        <div className="p-4">
            <SectionHeader title="Scatter Chart - Crime Rate vs. Police Officers" />
            <p className="mb-4">
                This scatter chart shows the relationship between crime rate per 100,000
                inhabitants and the number of police officers per 100,000 inhabitants
                for each country.
            </p>

            <ExplanationSection title="How to Read the Chart">
                <ul className="list-disc list-inside space-y-2 mb-4">
                    <li>
                        Countries in the upper-right have both high crime and high police
                        presence.
                    </li>
                    <li>
                        Countries in the lower-left have low crime and low police presence.
                    </li>
                    <li>
                        A downward trend suggests more police presence correlates with lower
                        crime.
                    </li>
                    <li>
                        The red line represents the linear regression trend.
                    </li>
                    <li>
                        Hover over a point to see detailed information about the country.
                    </li>
                </ul>
            </ExplanationSection>

            {interactiveData && (
                <InteractiveFilter
                    interactiveData={interactiveData}
                    onFilterChange={handleFilterChange}
                />
            )}

            <ReactECharts option={option} style={{ width: "100%", height: 500 }} />
        </div>
    );
};

export default Question5Chart2;
