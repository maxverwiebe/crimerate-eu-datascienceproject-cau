# 📊 Crime Rate in Europe – Data Science Project @ CAU

<div align="center"> <img src="https://github.com/user-attachments/assets/b2a675ed-777e-4912-a682-e0b5dcf18daf" alt="Crime in Europe Dashboard" width="80%"> </div>

Kiel University Data Science Project

Attendees: Ali Ahmed, Newar Akrawi, Ahad Iqbal, Maximilian Verwiebe

# Overview

## Summary

This project is a Data Science Project that analyzes European crime trends using Eurostat data. It aims to explore several research questions such as comparing police-recorded crime trends between EU countries, understanding the impact of legal status and gender on crime involvement and investigating correlations between population size, economic growth, and crime rates through a series of interactive charts and visualizations. The project uses a range of visualization techniques / charts including heatmaps, bubble charts, radar diagrams and more, while integrating both backend and frontend development to deliver a comprehensive analytical cool looking website.

## Screenshots

TODO

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

## Backend

#### Data Pipeline
