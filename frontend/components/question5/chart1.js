import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const Question5Chart1 = () => {
    const [chartData, setChartData] = useState({});
    const [years, setYears] = useState([]);
    const [countriesList, setCountriesList] = useState([]);
    const [selectedYear, setSelectedYear] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState("Albania");
    const [selectedUrbanTypes, setSelectedUrbanTypes] = useState(["Cities", "Rural areas", "Towns and suburbs"]);
    const [totalSelected, setTotalSelected] = useState(true);

    useEffect(() => {
        fetch("http://127.0.0.1:5000/api/question5/chart1")
            .then((response) => response.json())
            .then((json) => {
                console.log("Received:", json);
                setChartData(json.chart_data);
                setYears(Object.keys(json.chart_data[selectedCountry] || {}));
                setCountriesList(Object.keys(json.chart_data));
            })
            .catch((error) => console.error("Error fetching data:", error));
    }, [selectedCountry]);

    const formatData = () => {
        const series = [];
        const dataByUrban = {};

        years.forEach((year) => {
            selectedUrbanTypes.forEach((urbanType) => {
                if (!dataByUrban[urbanType]) {
                    dataByUrban[urbanType] = {
                        "Total": [],
                        "Above 60%": [],
                        "Below 60%": []
                    };
                }

                const yearData = chartData[selectedCountry]?.[year]?.[urbanType];
                if (yearData) {
                    dataByUrban[urbanType]["Total"].push(yearData["Total"] || 0);
                    dataByUrban[urbanType]["Above 60%"].push(yearData["Above 60% of median equivalised income"] || 0);
                    dataByUrban[urbanType]["Below 60%"].push(yearData["Below 60% of median equivalised income"] || 0);
                } else {
                    dataByUrban[urbanType]["Total"].push(0);
                    dataByUrban[urbanType]["Above 60%"].push(0);
                    dataByUrban[urbanType]["Below 60%"].push(0);
                }
            });
        });

        Object.keys(dataByUrban).forEach((urbanType) => {
            if (totalSelected) {
                series.push({
                    name: urbanType,
                    type: "line",
                    stack: "Total",
                    areaStyle: {},
                    data: dataByUrban[urbanType]["Total"]
                });
            } else {
                series.push({
                    name: `${urbanType} - Below 60%`,
                    type: "line",
                    stack: urbanType,
                    areaStyle: {},
                    data: dataByUrban[urbanType]["Below 60%"]
                });
                series.push({
                    name: `${urbanType} - Above 60%`,
                    type: "line",
                    stack: urbanType,
                    areaStyle: {},
                    data: dataByUrban[urbanType]["Above 60%"]
                });
            }
        });

        return series;
    };

    const option = {
        title: {
            text: `Stacked Area Chart - ${selectedCountry}`,
            left: "center",
        },
        tooltip: {
            trigger: "axis",
        },
        legend: {
            top: 30,
        },
        grid: {
            left: "5%",
            right: "5%",
            bottom: "10%",
            containLabel: true,
        },
        xAxis: {
            type: "category",
            data: years,
        },
        yAxis: {
            type: "value",
        },
        series: formatData(),
    };

    const handleFilterChange = (updatedFilters) => {
        setSelectedYear(updatedFilters.year || years);
        setSelectedCountry(updatedFilters.country || selectedCountry);
        setSelectedUrbanTypes(updatedFilters.urbanTypes || selectedUrbanTypes);
        setTotalSelected(updatedFilters.incomeGroup.includes("Total"));
    };

    const interactiveData = {
        year: {
            default: years,
            values: years,
            labels: years,
            multiple: true,
        },
        country: {
            default: selectedCountry,
            values: countriesList,
            labels: countriesList,
            multiple: false,
        },
        urbanTypes: {
            default: selectedUrbanTypes,
            values: ["Cities", "Rural areas", "Towns and suburbs"],
            labels: ["Cities", "Rural areas", "Towns and suburbs"],
            multiple: true,
        },
        incomeGroup: {
            default: totalSelected ? ["Total"] : [],
            values: ["Total"],
            labels: ["Total"],
            multiple: false,
        },
    };

    return (
        <div>
            <h2>Stacked Area Chart</h2>

            <InteractiveFilter
                interactiveData={interactiveData}
                onFilterChange={handleFilterChange}
            />

            <ReactECharts option={option} style={{ width: "100%", height: 600 }} />
        </div>
    );
};

export default Question5Chart1;
