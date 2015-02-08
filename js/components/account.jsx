/*
Open Chord Charts -- Database of free chord charts
By: Christophe Benz <contact@openchordcharts.org>

Copyright (C) 2012, 2013, 2014 Christophe Benz
https://gitorious.org/open-chord-charts/

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


'use strict';


var React = require('react');

var webservices = require('../webservices');


var Account = React.createClass({
  statics: {
    fetchData: function(params) {
      return webservices.fetchAccount(params.slug);
    },
  },
  render: function() {
    return (
      <div>
        <div className='page-header'>
          <h1>Account</h1>
        </div>
      </div>
    );
  },
});


module.exports = Account;
