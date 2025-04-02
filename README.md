# 📊 Crime Rate in Europe – Data Science Project @ CAU

<div align="center"> <img src="https://github.com/user-attachments/assets/b2a675ed-777e-4912-a682-e0b5dcf18daf" alt="Crime in Europe Dashboard" width="80%"> </div>

Kiel University Data Science Project

Attendees: Ali Ahmed, Newar Akrawi, Ahad Iqbal, Maximilian Verwiebe

Check the deployed web-app: [crime-europe-cau-dsproj.vercel.app](crime-europe-cau-dsproj.vercel.app)

# Overview

## Summary

This project is a Data Science Project that analyzes European crime trends using Eurostat data. It aims to explore several research questions such as comparing police-recorded crime trends between EU countries, understanding the impact of legal status and gender on crime involvement and investigating correlations between population size, economic growth, and crime rates through a series of interactive charts and visualizations. The project uses a range of visualization techniques / charts including heatmaps, bubble charts, radar diagrams and more, while integrating both backend and frontend development to deliver a comprehensive analytical cool looking website.

## Screenshots

<details>
<summary>Screenshot #1: Bubble chart question5</summary>
<img width="1470" alt="image" src="https://github.com/user-attachments/assets/5b3e6928-9537-4375-86cf-525a93b0e67a" />
</details>

<details>
<summary>Screenshot #2: Interactive filter</summary>
<img width="1326" alt="image" src="https://github.com/user-attachments/assets/32c566c6-ff70-4a5e-86bf-1e8afa93ba05" />
</details>

<details>
<summary>Screenshot #3: Navbar</summary>
<img width="1470" alt="image" src="https://github.com/user-attachments/assets/7b314114-0376-4e7a-b98b-4fc3f0b4136a" />
</details>

## Research Questions

1. How do trends in police recorded crimes differ between all European countries?
2. How has the trend of police-recorded crimes evolved in various cities across Europe?
3. How do legal status and gender influence involvement in bribery and corruption across European countries?
4. To what extent is there a correlation between population size, economic growth, and the development of crime rates in European countries?
5. How does an increased police presence impact crime rates across different countries in Europe?
6. How does crime distribution vary by gender across European countries?
7. How does crime distribution vary across different age group in European countries?

## Data Sources

The project is using data from Eurostat.
Eurostat is the statistical office of the European Union, responsible for publishing high-quality Europe-wide statistics and indicators. (eurostat)

Datasets used by the project:

- [Eurostat crim_off_cat](https://ec.europa.eu/eurostat/databrowser/product/page/CRIM_OFF_CAT)
- [Eurostat crim_gen_reg](https://ec.europa.eu/eurostat/databrowser/product/page/crim_gen_reg)
- [Eurostat crim_just_bri](https://ec.europa.eu/eurostat/databrowser/product/page/crim_just_bri)
- [Eurostat tps00001](https://ec.europa.eu/eurostat/databrowser/product/page/tps00001)
- [Eurostat tec00115](https://ec.europa.eu/eurostat/databrowser/product/page/tec00115)
- [Eurostat crim_just_job](https://ec.europa.eu/eurostat/databrowser/product/page/crim_just_job)
- [Eurostat crim_just_sex](https://ec.europa.eu/eurostat/databrowser/product/page/crim_just_sex)
- [Eurostat Eurostat hlth_dhc130](https://ec.europa.eu/eurostat/databrowser/product/page/hlth_dhc130)

## Requirements

1. Python3
2. NodeJS & NPM

## Run locally

1. Clone this repo
   `git clone https://github.com/maxverwiebe/crimerate-eu-datascienceproject-cau.git`
2. Change directory to cloned repo
   `cd crimerate-eu-datascienceproject-cau`
3. Start backend
   3.1 Change directory to backend
   `cd backend`
   3.2 Install requirements (or use venv)
   `python3 -m pip install -r requirements.txt`
   3.3 Start local backend server
   `python3 run.py`
4. Start frontend
   4.1 Open seperate window and change directory to frontend
   `cd frontend`
   4.2 Install NodeJS depenencies using NPM
   `npm install`
   4.3 Start local dev server
   `npm run dev`

5. Now visit `localhost:3000`in your browser!

# Technical Documentation

## Structure

The GitHub repository uses two branches.
The _main_ branch is for the code running in an production evironment.
On the other hand the _development_ branch is for development purposes and local test servers.

**Dir overview**

```
.vscode/                        // Some configs for vscode
backend/                        // code for the backend
frontend/                       // code for the frontend
.gitignore                      // files to be ignored by git
README.md                       // this README
```

## Frontend

The frontend is a Next.JS / React website.

**Dir overview**

```
frontend/components/                // the Next.JS components
frontend/components/question[id]/   // the chart components
frontend/pages/                     // Next.JS pages (routes)

frontend/.env.development           // URL for API for dev server
frontend/.env.production            // URL for API for production server
```

### NodeJS dependencies

1. @dkkoval/react-eu-stats-map for showing the geo heatmap
2. echarts & echarts-for-react for showing charts
3. next for NextJS
4. react for ReactJS
5. react-heatmap-grid for showing heatmap chart
6. recharts anther chart library

### Routing

NextJS automatically builds the routing tree according to the directory structure in `/pages`.
The root of the project is `index.js`. It's the file being rendered when opening `localhost:3000` in your browser.
`localhost:3000/question1` renders the page `question1.js` for instance.

### Components

Components are a core concept of React. This project utilizes them for static things like the navigation bar, the footer, error alerts and headers.
They are located in `components/*` ind then imported by the page files of other components.
**Charts** are also represented by components.
For example `components/question1/chart1.js` represents the first chart _Crime categories reported by different countries in Europe_ when visiting `localhost:3000/question1`.

### Connection to API / Backend

The frontend does not really do any complicated data processing. To retrieve the data for the charts it sends HTTP(S) requests to the Backend.

### Deployment

[crime-europe-cau-dsproj.vercel.app](crime-europe-cau-dsproj.vercel.app)
The webseite is deployed to Vercel. Vercel waits for changes on the main branch and automatically builds the new version and updates the deployed website.

## Backend

The backend is a simple Python3 flask webserver.

**Dir overview**

```
backend/run.py                      // Main entry point to start dev server python3 run.py
backend/requirements.txt            // The python pip dependencies
backend/__init__.py                 // Main flask class
backend/routes/question[id].py      // Routes for each research question
```

### Requirements

1. Flask for the basic webserver
2. flask-cors for handling CORS when running frontend & backend locally
3. gunicorn for running the server in an production environment
4. requests for making requests to the Eurostat API
5. pandas for working with dataframes
6. Flask-Caching for caching the API routes

### Protocol

To access the API use the HTTP protocol for dev environment and HTTPS for production environment.

#### Example request

Request being sent by the frontend

```
GET http://127.0.0.1:5000/question1/chart1
```

Response

```
{
  "chart_data": {
    "most_frequent_crime": "Theft",
    "pivot_data": {
      "Acts against computer systems": {
        "Albania": 800.2,
        "Austria": 76847.59,
        "Belgium": 47883.04,
        "Bosnia and Herzegovina": 124.0,
        "Bulgaria": 417.88,
        "Croatia": 11216.15,
        "Cyprus": 727.98,
        "Czechia": 8852.63,
        "Denmark": 0.0,
        "England and Wales": 0.0,
        "Estonia": 1543.31,
        "Finland": 10027.29,
        "France": 88277.99,
        "Germany": 103345.53,
      },
      "Attempted intentional homicide": {
        "Albania": 2479.65,
        "Austria": 1716.59,
        "Belgium": 13713.92,
        "Bosnia and Herzegovina": 824.65,
        "Bulgaria": 747.19,
        "Croatia": 1452.08,
        "Cyprus": 204.49,
        "Czechia": 1075.13,
        "Denmark": 2532.91,
        "England and Wales": 0.0,
        "Estonia": 257.02,
        "Finland": 5124.34,
        "France": 31256.94,
        "Germany": 25083.58,
      },
  },
  "error": null,
  "interactive_data": {
    "geo": {
      "default": null,
      "labels": [
        "Belgium",
        "Bulgaria",
        "Czechia",
        "Denmark",
        "Germany",
      ],
      "multiple": true,
      "values": [
        "BE",
        "BG",
        "CZ",
        "DK",
        "DE",
      ]
    },
    "time": {
      "default": null,
      "multiple": true,
      "values": [
        "2017",
        "2018",
        "2019",
        "2020",
        "2021",
        "2022"
      ]
    }
  }
}
```

The frontend then processes this request and displays the data in a chart.

`interactive_data` is the data being shown when opening the filter on the website/fronend.
Fromn there you can fine tune the query and chart.
For example selecting Germany will trigger another request and update the chart:

```
GET http://127.0.0.1:5000/question1/chart1?geo=DE
```

The response then only contains data regarding to Germany.

`error` is a potential error message returned by the backend. It will be shown on the frontend page.

### Caching

The backend implements simple caching in memory.
You may notice a little delay when requesting:

```
GET http://127.0.0.1:5000/question1/chart1?geo=DE
```

But when requesting the same route again, the delay is gone and the response is there instantly.
This is due to serverside caching done by the backend for every single route and makes the application faster and reduces the amount of computation and network usage.

## Data retrieval from Eurostat

Before processing the data, the backend needs the data.
For this another caching mechanism is implemented.
It at first checks if the dataset with the filters (?geo=DE...) already exists in the cache of the server. If not, it sends a request to the Eurostat HTTPS API, dynamically loading the data with the filters and caching it.

Eurostat API calls follow this scheme: (Maybe deactivate dark mode)
![image](https://github.com/user-attachments/assets/113cb5e5-4c48-4f5e-abef-57ddc375bd86)
Source: [Eurostat Docs](https://wikis.ec.europa.eu/spaces/EUROSTATHELP/pages/95552810/API+-+Getting+started+with+statistics+API)

So for claryfing: There exist two caching mechanisms. One for the API calls of the backend and one for Data retrieval with the Eurostat API.

### Data processing

The data is being cleaned, pre-processed & processed in the file corresponding to the question.
For example when requesting `GET http://127.0.0.1:5000/question1/chart1`

`backend/routes/question1.py` gets triggered and processes the data for chart1 and sends the ChartResponse, containing the chart data, any potential error message and the interactive filter data. Example response above.
