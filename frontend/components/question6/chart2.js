import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const Question6Chart2 = () => {
    const [chartData, setChartData] = useState({});
    const [years, setYears] = useState([]);
    const [countriesList, setCountriesList] = useState([]);
    const [selectedYear, setSelectedYear] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState("Number");
    const [selectedCountries, setSelectedCountries] = useState(["Albania"]);

    useEffect(() => {
        fetch("http://127.0.0.1:5000/api/question6/chart2")
            .then((response) => response.json())
            .then((json) => {
                console.log("Received:", json);
                setChartData(json.chart_data);

                // Filter only years that exist in the data for the selected country
                const countryData = json.chart_data["Albania"]; // Adjust for selected country dynamically
                const availableYears = countryData ? Object.keys(countryData) : [];
                setYears(availableYears);

                const countries = Object.keys(json.chart_data);
                setCountriesList(countries);
                setSelectedCountries([countries[0]]); // Default to first country
            })
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    const formatData = () => {
        const country = selectedCountries[0]; // Only one country
        if (!chartData[country]) return {}; // If no data for selected country, return empty

        const yearsData = selectedYear.length > 0 ? selectedYear : Object.keys(chartData[country]);

        const processedData = {};

        yearsData.forEach((year) => {
            const yearData = chartData[country] && chartData[country][year];
            if (yearData) {
                const statData = yearData["Convicted person"]; // Assuming you want to show "Convicted person"

                const maleVal = statData && statData["Males"] ? statData["Males"][selectedUnit] : 0;
                const femaleVal = statData && statData["Females"] ? statData["Females"][selectedUnit] : 0;

                if (!processedData[year]) {
                    processedData[year] = { male: 0, female: 0 };
                }

                processedData[year].male += maleVal;
                processedData[year].female += femaleVal;
            }
        });

        return processedData;
    };

    const processedData = formatData();

    // ECharts Option
    const option = {
        title: {
            text: `Verurteilte Personen - ${selectedYear.join(", ")}`,
            left: "center",
        },
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "shadow",
            },
            formatter: (params) => {
                let tooltipContent = `${params[0].name}<br/>`;
                params.forEach((param) => {
                    const value = param.value === 0 ? "Data not available" : param.value;
                    tooltipContent += `${param.seriesName}: ${value}<br/>`;
                });
                return tooltipContent;
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
            type: "category",
            data: selectedYear.length > 0 ? selectedYear.sort((a, b) => a - b) : Object.keys(processedData).sort((a, b) => a - b),
            name: "Year",
        },
        yAxis: {
            type: "value",
            name: selectedUnit,
        },
        series: [
            {
                name: "Males",
                type: "bar",
                stack: "gender",
                data: selectedYear.length > 0 ? selectedYear.sort((a, b) => a - b).map((year) => processedData[year] ? processedData[year].male : 0) : [],
                itemStyle: { color: "#5470C6" }, // Blue for males
                barWidth: "40%",
            },
            {
                name: "Females",
                type: "bar",
                stack: "gender",
                data: selectedYear.length > 0 ? selectedYear.sort((a, b) => a - b).map((year) => processedData[year] ? processedData[year].female : 0) : [],
                itemStyle: { color: "#EE6666" }, // Red for females
                barWidth: "40%",
            },
        ],
    };

    const handleFilterChange = (updatedFilters) => {
        setSelectedYear(updatedFilters.year || selectedYear);
        setSelectedUnit(updatedFilters.unit || selectedUnit);
        setSelectedCountries(updatedFilters.countries || selectedCountries);
    };

    const interactiveData = {
        year: {
            default: selectedYear,
            values: years,
            labels: years,
            multiple: true, // Multiple years selectable
        },
        unit: {
            default: selectedUnit,
            values: ["Number", "Per100k"],
            labels: ["Number", "Per100k"],
            multiple: false, // Only one unit selectable
        },
        countries: {
            default: selectedCountries,
            values: countriesList,
            labels: countriesList,
            multiple: false, // Only one country selectable
        },
    };

    return (
        <div>
            <h2>Verurteilte Personen (Gestapelt nach Geschlecht)</h2>

            <InteractiveFilter
                interactiveData={interactiveData}
                onFilterChange={handleFilterChange}
            />

            <ReactECharts option={option} style={{ width: "100%", height: 600 }} />
        </div>
    );
};

export default Question6Chart2;
