import React, { PureComponent } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

export default class Question7Chart1Mini extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      nestedData: {},
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
    let url = `${process.env.NEXT_PUBLIC_BACKEND_API}/api/question7/chart1`;
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
          this.setState({
            nestedData,
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

  /**
   * Transforms the nested data structure, which is now in the format:
   * { country: { time: { ageGroup: { value, percentage } } } }
   * into a format in which an array of objects is created for each age group,
   * which contains all countries with their percentage values for each point in time.
   *
   * Result:
   * {
   * “From 16 to 24 years”: [
   * { time: “2010”, “Germany”: 13.1, “France”: 12.5, ... },
   * { time: “2011”, “Germany”: 13.2, “France”: 12.7, ... },
   * ...
   * ],
   * “From 25 to 34 years”: [ ... ]
   * }
   */

  getMiniChartData(nestedData) {
    const ageGroupData = {};
    Object.keys(nestedData).forEach((country) => {
      const timeGroups = nestedData[country];
      Object.keys(timeGroups).forEach((time) => {
        const ageGroups = timeGroups[time];
        Object.keys(ageGroups).forEach((ageGroup) => {
          if (!ageGroupData[ageGroup]) {
            ageGroupData[ageGroup] = {};
          }
          if (!ageGroupData[ageGroup][time]) {
            ageGroupData[ageGroup][time] = { time };
          }
          ageGroupData[ageGroup][time][country] =
            ageGroups[ageGroup].percentage;
        });
      });
    });

    const miniChartData = {};
    Object.keys(ageGroupData).forEach((ageGroup) => {
      const dataArray = Object.values(ageGroupData[ageGroup]).sort((a, b) =>
        a.time.localeCompare(b.time)
      );
      miniChartData[ageGroup] = dataArray;
    });
    return miniChartData;
  }

  getCountriesFromData(dataArray) {
    const countries = new Set();
    dataArray.forEach((record) => {
      Object.keys(record).forEach((key) => {
        if (key !== "time") {
          countries.add(key);
        }
      });
    });
    return Array.from(countries);
  }

  getCombinedCountries(miniChartData) {
    const countries = new Set();
    Object.values(miniChartData).forEach((dataArray) => {
      dataArray.forEach((record) => {
        Object.keys(record).forEach((key) => {
          if (key !== "time") {
            countries.add(key);
          }
        });
      });
    });
    return Array.from(countries);
  }

  renderLegend(countries) {
    return (
      <div style={{ marginBottom: "20px", display: "flex", flexWrap: "wrap" }}>
        {countries.map((country, index) => (
          <div
            key={country}
            style={{
              display: "flex",
              alignItems: "center",
              marginRight: "20px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: COLORS[index % COLORS.length],
                marginRight: "8px",
              }}
            ></div>
            <span>{country}</span>
          </div>
        ))}
      </div>
    );
  }

  render() {
    const { nestedData, interactiveData } = this.state;

    if (!nestedData || Object.keys(nestedData).length === 0) {
      return <div>Lade Daten...</div>;
    }

    const miniChartData = this.getMiniChartData(nestedData);
    const ageGroups = Object.keys(miniChartData).sort();
    const combinedCountries = this.getCombinedCountries(miniChartData);

    return (
      <div style={{ padding: "20px" }}>
        <h2 className="text-2xl font-bold mb-4">
          Question 7 Chart 1 (Mini-Charts pro Age Group)
        </h2>
        <p className="mb-4">
          Trends der Anteile je Altersgruppe über die Zeit (pro Altersgruppe ein
          Mini-Chart, mit Linien für jedes Land)
        </p>
        {interactiveData && (
          <div className="mb-6">
            <InteractiveFilter
              interactiveData={interactiveData}
              onFilterChange={this.handleFilterChange}
            />
          </div>
        )}
        {this.renderLegend(combinedCountries)}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "20px",
          }}
        >
          {ageGroups.map((ageGroup) => {
            const dataArray = miniChartData[ageGroup];
            return (
              <div
                key={ageGroup}
                style={{ border: "1px solid #ccc", padding: "10px" }}
              >
                <h3 className="text-xl mb-2">Age Group: {ageGroup}</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart
                    data={dataArray}
                    margin={{ top: 20, right: 20, bottom: 10, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    {/*
                      Legend component removed from the chart, as
                      we display a unique legend above.
                    */}

                    {this.getCountriesFromData(dataArray).map(
                      (country, index) => (
                        <Line
                          key={country}
                          type="monotone"
                          dataKey={country}
                          stroke={COLORS[index % COLORS.length]}
                          strokeWidth={2}
                          dot={{ r: 1 }}
                        />
                      )
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
