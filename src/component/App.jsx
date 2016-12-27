import React from 'react';
import Highcharts from 'highcharts';
import _ from 'underscore';
import { fetchJSON, getMadSerie } from '../lib';

class App extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      interval: 60,
      pct: 1,
      tolerance: 50
    };
  }

  componentDidMount() {
    this.chart = new Highcharts.Chart({
      chart: {
        renderTo: this.container
      },
      xAxis: {
        type: 'datetime'
      }
    });
    this.fetch();
  }

  fetch() {
    const {
      interval
    } = this.state;
    fetchJSON('/v1/query.json', {
      q: 'avg:system.load.1{*}by{host}',
      token: '00dab9eee34944c58fd967fc61fec428',
      interval
    }).then(
      (res) => {

        const toSeries = (item) => {
          const pointStart = _.first(_.keys(item.pointlist)) * 1000;
          return {
            name: item.tags.host,
            data: _.values(item.pointlist),
            pointStart,
            pointInterval: interval * 1000,
            dashStyle: 'Dot'
          };
        };

        const markOutlier = (items) => {
          const madSerie = getMadSerie(items);
          items.push(madSerie);
          return items;
        };

        const data = res
          .slice(0, 5)
          .map(toSeries);

        markOutlier(data)
          .forEach((serie) => {
            this.chart.addSeries(serie, false);
          });
        this.chart.render();
      }
    );
  }

  onValueChange = (field) => ({ target: { value } }) => {
    this.setState({
      [field]: value
    });
  }

  render() {
    const {
      interval,
      pct,
      tolerance
    } = this.state;

    return (
      <div>
        <div
          ref={(elem) => {
            this.container = elem;
          }}
        />
        <form>
          <p>
            <label>
              interval:
              <input
                type="range"
                min="10"
                max="300"
                value={interval}
                onChange={this.onValueChange('interval')}
              />
              {interval}
            </label>
          </p>
          <p>
            <label>
              tolerance:
              <input
                type="number"
                value={pct}
                onChange={this.onValueChange('pct')}
              />
            </label>
          </p>
          <p>
            <label>
              pct:
              <input
                type="range"
                min="0"
                max="100"
                value={tolerance}
                onChange={this.onValueChange('tolerance')}
              />
              {tolerance}%
            </label>
          </p>
        </form>
      </div>
    );
  }
}

export default App;
