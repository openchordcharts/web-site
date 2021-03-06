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


import {Link} from "react-router";
import Immutable from "immutable";
import React from "react";
import t from "transducers.js";

import ChartGrid from "../chart-grid";
import KeySelect from "../key-select";
import model from "../../model";
import propTypes from "../../prop-types";
import webservices from "../../webservices";


var ChartPage = React.createClass({
  propTypes: {
    // TODO Remove nest level of chart.
    chart: propTypes.chart.isRequired,
    loggedInUsername: React.PropTypes.string,
  },
  componentDidMount() {
    window.onresize = this.handleWidthChange;
    this.handleWidthChange();
  },
  componentWillUnmount() {
    window.onresize = null;
  },
  getInitialState() {
    return {
      chart: this.props.chart,
      chartGridWidth: null, // TODO Use flexbox instead of computing column widths manually.
      edited: false,
      key: this.props.chart.key,
      selectedBar: null,
    };
  },
  handleBarAdd(partName) {
    var newChord = {
      alterations: null,
      degree: 0,
      duration: 1,
    };
    var newChart = Immutable.fromJS(this.state.chart)
      .updateIn(["parts", partName], (chords) => chords.push(newChord))
      .toJS();
    this.setState({chart: newChart});
  },
  handleBarSelect(partName, partIndex) {
    this.setState({selectedBar: {partIndex, partName}});
  },
  handleChartKeyChange(newChartKey) {
    this.setState({key: newChartKey});
  },
  handleChordChange(chordKey, barChordIdx) {
    console.log("handleChordChange", chordKey, barChordIdx);
    // var newChart = this.state.chart; // TODO immutable
    // newChart.parts[partName][idx] = newChord;
    // this.setState({chart: newChart});
  },
  handleCloneClick(event) {
    console.log(event);
  },
  handleDeleteClick() {
    var {slug, title} = this.state.chart;
    if (confirm(`Delete this chart (${title})?`)) {
      webservices.deleteChart(slug);
    }
  },
  handleEditClick() {
    this.setState({edited: true});
  },
  handleSaveClick() {
    // TODO Really save chart.
    this.setState({edited: false});
  },
  handleWidthChange() {
    var componentWidth = this.getDOMNode().offsetWidth;
    this.setState({chartGridWidth: componentWidth});
  },
  render() {
    var {chart} = this.state;
    var barsByPartName = t.map(
      chart.parts,
      kv => [kv[0], model.chordsToBars(kv[1], this.state.key)]
    );
    return (
      <div>
        <h1>{chart.title}</h1>
        {chart.genre && <p>Genre: {chart.genre}</p>}
        <KeySelect onChange={this.handleChartKeyChange} value={this.state.key} />
        {
          this.state.chartGridWidth && (
            <div style={{
              display: "table",
              marginBottom: 60,
              marginLeft: "auto",
              marginRight: "auto",
              marginTop: 30,
            }}>
              <ChartGrid
                barsByPartName={barsByPartName}
                edited={this.state.edited}
                onBarAdd={this.state.edited ? this.handleBarAdd : null}
                onBarSelect={this.state.edited ? this.handleBarSelect : null}
                onChordChange={this.handleChordChange}
                selectedBar={this.state.selectedBar}
                structure={chart.structure}
                width={this.state.chartGridWidth}
              />
            </div>
          )
        }
        {
          chart.composers && chart.compositionYear ? (
            <p>Composed by {chart.composers.join(", ")} in {chart.compositionYear}</p>
          ) : (
            chart.composers ? (
              <p>Composed by {chart.composers.join(", ")}</p>
            ) : chart.compositionYear ? (
              <p>Composed in {chart.compositionYear}</p>
            ) : null
          )
        }
        <p>
          Owner: <Link query={{owner: chart.owner.slug}} to="charts">{chart.owner.username}</Link>
        </p>
        {
          chart.interpretations && (
            <p>
              Interpretations:
              {" "}
              {
                chart.interpretations > 1 ? (
                  <ul>
                    {
                      chart.interpretations.map((interpretation, idx) => (
                        <li key={idx}>{this.renderInterpretation(interpretation)}</li>
                      ))
                    }
                  </ul>
                ) : (
                  <span>{this.renderInterpretation(chart.interpretations[0])}</span>
                )
              }
            </p>
          )
        }
        {this.renderActionsToolbar()}
      </div>
    );
  },
  renderActionsToolbar() {
    var loggedInUsername = this.props.loggedInUsername;
    var isOwner = loggedInUsername === this.state.chart.owner.username;
    var buttons = [];
    if (isOwner) {
      if (this.state.edited) {
        buttons.push(
          <button key="save" onClick={this.handleSaveClick}>Save</button>
        );
      } else {
        buttons = buttons.concat([
          <button className="mr1" key="edit" onClick={this.handleEditClick}>Edit</button>,
          <button key="delete" onClick={this.handleDeleteClick}>Delete</button>,
        ]);
      }
    }
    if (loggedInUsername !== null && !isOwner) {
      var cloneButton = (
        <button key="clone" onClick={this.handleCloneClick}>Clone</button>
      );
      buttons.push(cloneButton);
    }
    return buttons;
  },
  renderInterpretation(interpretation) {
    var label = interpretation.interpreterName;
    if (interpretation.year) {
      label += ` (${interpretation.year})`;
    }
    return (
      <span>
        {
          interpretation.externalLinks ? (
            <a href={interpretation.externalLinks[0]} rel="external" target="_blank">{label}</a>
          ) : (
            <span>label</span>
          )
        }
        {
          interpretation.externalLinks && interpretation.externalLinks.length > 1 && (
            <span>
              {" "}
              {
                interpretation.externalLinks.slice(1).map((externalLink, idx) => (
                  <a href={externalLink} key={idx} rel="external" target="_blank">{`#${idx}`}</a>
                ))
              }
            </span>
          )
        }
      </span>
    );
  },
});


module.exports = ChartPage;
