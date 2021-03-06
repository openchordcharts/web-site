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


import React from "react";

import ChartPage from "../pages/chart-page";
import NotFoundPage from "../pages/not-found-page";
import propTypes from "../../prop-types";
import webservices from "../../webservices";


var ChartHandler = React.createClass({
  contextTypes: {
    router: React.PropTypes.func,
  },
  propTypes: {
    appState: propTypes.appState.isRequired,
    chart: propTypes.chart,
    errorByRouteName: React.PropTypes.object,
  },
  statics: {
    fetchData(params) {
      return webservices.fetchChart(params.slug);
    },
  },
  render() {
    var content;
    var error = this.props.errorByRouteName && this.props.errorByRouteName.chart;
    if (this.props.chart) {
      content = (
        <ChartPage
          chart={this.props.chart}
          loggedInUsername={this.props.appState.loggedInUsername}
        />
      );
    } else if (this.props.appState.loading) {
      content = this.props.appState.loading === "slow" ? <h1>Loading…</h1> : null;
    } else if (error) {
      content = (
        <p>Unable to fetch data from API.</p>
      );
    } else {
      content = (
        <NotFoundPage />
      );
    }
    return content;
  },
});


module.exports = ChartHandler;
