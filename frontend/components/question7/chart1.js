import React, { PureComponent } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import InteractiveFilter from "@/components/interactiveFilter";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#0088FE",
  "#00C49F",
  "#FF8042",
];

export default class Question7Chart1 extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      nestedData: {},
      flatData: [],
      seriesKeys: [],
      interactiveData: null,
      filterCriteria: {},
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.filterCriteria !== this.state.filterCriteria) {
      this.fetchData();
    }
  }

  fetchData() {
    const { filterCriteria } = this.state;
    let url = "http://127.0.0.1:5000/api/question7/chart1";
    const params = new URLSearchParams();
    Object.keys(filterCriteria).forEach((key) => {
      filterCriteria[key].forEach((value) => {
        params.append(key, value);
      });
    });
    if ([...params].length > 0) {
      url += "?" + params.toString();
    }

    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        if (json.chart_data) {
          const nestedData = json.chart_data;
          const { flatData, seriesKeys } = this.transformData(nestedData);
          this.setState({
            nestedData,
            flatData,
            seriesKeys,
            interactiveData: json.interactive_data,
          });
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }

  transformData(nestedData) {
    const seriesKeysSet = new Set();
    const timeMap = {};
    Object.keys(nestedData).forEach((country) => {
      const ageGroups = nestedData[country];
      Object.keys(ageGroups).forEach((age) => {
        const seriesKey = `${country} - ${age}`;
        seriesKeysSet.add(seriesKey);
        ageGroups[age].forEach((entry) => {
          const { time, value } = entry;
          if (!timeMap[time]) {
            timeMap[time] = { time };
          }
          timeMap[time][seriesKey] = value;
        });
      });
    });
    const flatData = Object.values(timeMap).sort((a, b) =>
      a.time.localeCompare(b.time)
    );
    const seriesKeys = Array.from(seriesKeysSet);
    return { flatData, seriesKeys };
  }

  handleFilterChange = (filterObj) => {
    console.log("Neue Filterkriterien:", filterObj);
    this.setState({ filterCriteria: filterObj });
  };

  render() {
    const { flatData, seriesKeys, interactiveData } = this.state;

    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Question 7 Chart 1</h2>
        <p className="mb-4">Crime trends by age group over time</p>
        {interactiveData && (
          <div className="mb-6">
            <InteractiveFilter
              interactiveData={interactiveData}
              onFilterChange={this.handleFilterChange}
            />
          </div>
        )}
        <ResponsiveContainer width="100%" height={500}>
          <AreaChart
            data={flatData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            {seriesKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[index % COLORS.length]}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }
}
