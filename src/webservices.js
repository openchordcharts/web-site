/*
Open Chord Charts -- Database of free chord charts
By: Christophe Benz <contact@openchordcharts.org>

Copyright (C) 2012, 2013, 2014, 2015 Christophe Benz
https://github.com/openchordcharts/

This file is part of Open Chord Charts.

Open Chord Charts is free software; you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

Open Chord Charts is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

@flow weak
*/


import qs from "querystringify";

import config from "./config";


// Fetch polyfill

function loadFetch() {
  if (process.env.BROWSER) {
    if (window.fetch) {
      return window.fetch;
    } else {
      require("whatwg-fetch");
      return window.fetch;
    }
  } else {
    return require("node-fetch");
  }
}
var fetch = loadFetch();


// Generic fetch functions

var dataByUrl = new Map();

function fetchCachedJSON(url, options) {
  if (dataByUrl.has(url)) {
    return Promise.resolve(dataByUrl.get(url));
  } else {
    return fetchJSON(url, options)
      .then(data => {
        dataByUrl.set(url, data);
        return data;
      });
  }
}

function fetchJSON(url, options) {
  return fetch(url, options).then(status).then(json);
}


function json(response) {
  return response.json();
}


function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  throw new Error(response.statusText);
}


// Data manipulation

const chartUrl = `${config.apiBaseUrl}/charts`;


function deleteChart(slug) {
  var url = `${chartUrl}/${slug}/delete`;
  return fetch(url, {credentials: "include"});
}


function fetchAccount(slug) {
  return fetchCharts().then(charts => charts.filter(chart => chart.owner.slug === slug));
}


function fetchChart(slug) {
  return fetchCharts()
    .then(charts => {
      var foundChart = charts.find(chart => chart.slug === slug);
      if (!foundChart) {
        var error = new Error(`Chart not found: ${slug}`);
        error.status = 404;
        throw error;
      }
      return foundChart;
    });
}


function fetchCharts(query = {}) {
  var url = chartUrl;
  if (Object.keys(query).length) {
    query = {ownerSlug: query.owner}; // Rename route params to endpoint GET params.
    // TODO Check there is no side-effect (url modification does not modify chartUrl).
    url += qs.stringify(query, true);
  }
  return fetchCachedJSON(url).then(data => data.charts);
}


// Authentication

function login() {
  var url = `${config.apiBaseUrl}/login`;
  return fetchJSON(url, {credentials: "include"});
}


function logout() {
  var url = `${config.apiBaseUrl}/logout`;
  return fetchJSON(url, {credentials: "include"});
}


function register(username, password, email) {
  var url = `${config.apiBaseUrl}/register`;
  var formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);
  formData.append("email", email);
  return fetchJSON(url, {body: formData, method: "post"});
}


module.exports = {deleteChart, fetchAccount, fetchChart, fetchCharts, login, logout, register};
