/** @jsx React.DOM */
'use strict';


var {Link} = require('react-router'),
  React = require('react/addons'),
  t = require('transducers.js');

var ChordEditToolbar = require('./chord-edit-toolbar'),
  ChartGrid = require('./chart-grid'),
  KeySelect = require('./key-select'),
  model = require('../model'),
  propTypes = require('../prop-types'),
  webservices = require('../webservices');

var cx = React.addons.classSet;


var Chart = React.createClass({
  propTypes: {
    chart: propTypes.chart.isRequired,
    loggedInUsername: React.PropTypes.string,
  },
  componentDidMount: function() {
    window.onresize = this.handleWidthChange;
    this.handleWidthChange();
  },
  componentWillUnmount: function() {
    window.onresize = null;
  },
  getInitialState: function() {
    return {
      chart: this.props.chart,
      chartGridWidth: null,
      edited: false,
      key: this.props.chart.key,
      selectedBar: null,
    };
  },
  handleBarSelect: function(partName, partIndex) {
    this.setState({selectedBar: {partIndex, partName}});
  },
  handleChartKeyChange: function(newChartKey) {
    this.setState({key: newChartKey});
  },
  handleChordKeyChange: function(newChordKey) {
    console.log('handleChordChange', newChordKey);
    // var newChart = this.state.chart; // TODO immutable
    // newChart.parts[partName][idx] = newChord;
    // this.setState({chart: newChart});
  },
  handleDeleteClick: function() {
    if (confirm(`Delete this chart (${this.state.chart.title})?`)) {
      webservices.deleteChart(this.state.chart.slug);
    }
  },
  handleEditClick: function() {
    this.setState({edited: true});
  },
  handleSaveClick: function() {
    // TODO save data
    this.setState({edited: false});
  },
  handleWidthChange: function() {
    var componentWidth = this.getDOMNode().offsetWidth;
    this.setState({chartGridWidth: componentWidth});
  },
  render: function() {
    var chart = this.state.chart;
    var barsByPartName = t.map(
      chart.parts,
      (kv) => [kv[0], model.chordsToBars(kv[1], this.state.key)]
    );
    return (
      <div>
        <div className='page-header'>
          <h1>{chart.title}</h1>
        </div>
        {
          chart.composers && chart.compositionYear ? (
            <p>Composed by {chart.composers.join(', ')} in {chart.compositionYear}</p>
          ) : (
            chart.composers ? (
              <p>Composed by {chart.composers.join(', ')}</p>
            ) : chart.compositionYear ? (
              <p>Composed in {chart.compositionYear}</p>
            ) : null
          )
        }
        {chart.genre && <p>Genre: {chart.genre}</p>}
        {
          chart.interpretations && (
            <p>
              Interpretations:
              {' '}
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
        <div className='form-inline' style={{marginBottom: 10}}>
          <KeySelect onChange={this.handleChartKeyChange} value={this.state.key} />
          {
            this.state.edited && this.state.selectedBar &&
            barsByPartName[this.state.selectedBar.partName][this.state.selectedBar.partIndex].map((barChord, idx) => (
              <ChordEditToolbar
                chordKey={barChord.rendered}
                key={idx}
                onChordChange={this.handleChordKeyChange}
              />
            ))
          }
        </div>
        {
          this.state.chartGridWidth && (
            <ChartGrid
              barsByPartName={barsByPartName}
              edited={this.state.edited}
              onBarSelect={this.state.edited ? this.handleBarSelect : null}
              selectedBar={this.state.selectedBar}
              structure={chart.structure}
              width={this.state.chartGridWidth}
            />
          )
        }
        <hr />
        <div className='row'>
          <div className='col-xs-10'>
            {this.renderActionsToolbar()}
          </div>
          <div className='col-xs-2'>
            <p className='text-right'>
              <Link to='charts' query={{owner: chart.owner.slug}}>{chart.owner.username}</Link>
            </p>
          </div>
        </div>
      </div>
    );
  },
  renderActionsToolbar: function() {
    var loggedInUsername = this.props.loggedInUsername;
    var isOwner = loggedInUsername === this.state.chart.owner.username;
    var buttons = [];
    if (isOwner) {
      if (this.state.edited) {
        var saveButton = (
          <button className='btn btn-primary' key='save' onClick={this.handleSaveClick}>Save</button>
        );
        buttons.push(saveButton);
      } else {
        var editButton = (
          <button
            className={cx({
              active: this.state.edited,
              btn: true,
              'btn-default': true,
            })}
            key='edit'
            onClick={this.handleEditClick}
          >
            Edit
          </button>
        );
        var deleteButton = (
          <button
            className='btn btn-danger'
            key='delete'
            onClick={this.handleDeleteClick}
            style={{marginLeft: 10}}
          >
            Delete
          </button>
        );
        buttons.push(editButton);
        buttons.push(deleteButton);
      }
    }
    if (loggedInUsername !== null && ! isOwner) {
      var cloneButton = (
        <button className='btn btn-danger' key='clone' onClick={this.handleCloneClick}>Clone</button>
      );
      buttons.push(cloneButton);
    }
    return buttons;
  },
  renderInterpretation: function(interpretation) {
    var label = interpretation.interpreterName;
    if (interpretation.year) {
      label += ` (${interpretation.year})`;
    }
    return (
      <span>
        {
          interpretation.externalLinks ? (
            <a href={interpretation.externalLinks[0]} rel='external' target='_blank'>{label}</a>
          ) : (
            <span>label</span>
          )
        }
        {
          interpretation.externalLinks && interpretation.externalLinks.length > 1 && (
            <span>
              {' '}
              {
                interpretation.externalLinks.slice(1).map((externalLink, idx) => (
                  <a href={externalLink} key={idx} rel='external' target='_blank'>{`#${idx}`}</a>
                ))
              }
            </span>
          )
        }
      </span>
    );
  },
});


module.exports = Chart;
