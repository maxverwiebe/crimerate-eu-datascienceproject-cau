import React, { PureComponent } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import InteractiveFilter from "@/components/interactiveFilter";

export default class Question7Chart2 extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      histogramData: [],
      interactiveData: null,
      filterCriteria: {},
      usePercentage: true,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.filterCriteria !== this.state.filterCriteria ||
      prevState.usePercentage !== this.state.usePercentage
    ) {
      this.fetchData();
    }
  }

  fetchData() {
    const { filterCriteria, usePercentage } = this.state;
    let url = `${process.env.NEXT_PUBLIC_BACKEND_API}/api/question7/chart2`;
    const params = new URLSearchParams();

    // Für jeden Filter die Parametervorgabe
    Object.keys(filterCriteria).forEach((key) => {
      filterCriteria[key].forEach((value) => {
        params.append(key, value);
      });
    });
    // Füge zusätzlich den Parameter "display" hinzu, der die Anzeige steuert
    params.append("display", usePercentage ? "percentage" : "whole");

    if ([...params].length > 0) {
      url += "?" + params.toString();
    }

    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        if (json.chart_data) {
          const rawData = json.chart_data;
          const histogramData = Object.keys(rawData).map((age) => ({
            age,
            percentage: rawData[age], // wird auch für "whole" verwendet, wenn der API-Endpunkt dies liefert
          }));
          this.setState({
            histogramData,
            interactiveData: json.interactive_data,
          });
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }

  handleFilterChange = (filterObj) => {
    console.log("Neue Filterkriterien:", filterObj);
    this.setState({ filterCriteria: filterObj });
  };

  handleDisplayToggle = (e) => {
    this.setState({ usePercentage: e.target.checked });
  };

  render() {
    const { histogramData, interactiveData, usePercentage } = this.state;

    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">
          Crime rate distribution by age groups
        </h2>
        <p className="mb-4">
          Histogram: x-axis = age groups, y-axis ={" "}
          {usePercentage ? "percentage" : "total crimes"}
        </p>
        <div className="mb-4">
          <label>
            <input
              type="checkbox"
              checked={usePercentage}
              onChange={this.handleDisplayToggle}
            />{" "}
            Use Percentage
          </label>
        </div>
        {interactiveData && (
          <div className="mb-6">
            <InteractiveFilter
              interactiveData={interactiveData}
              onFilterChange={this.handleFilterChange}
            />
          </div>
        )}
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={histogramData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="age" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="percentage"
              fill="#8884d8"
              name={usePercentage ? "Percentage" : "Total Crimes"}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
}
