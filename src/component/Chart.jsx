import React from 'react';
import Highcharts from 'highcharts';
import _ from 'underscore';
import { abs } from 'mathjs';

import { fetchJSON, getMadSerie } from '../lib';

class Chart extends React.Component {

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

  componentWillUnmount() {
    this.isUnmounted = true;
  }

  fetch() {
    const {
      interval,
      pct,
      tolerance
    } = this.props;
    fetchJSON('/v1/query.json', {
      q: 'avg:system.load.1{*}by{host}',
      token: '00dab9eee34944c58fd967fc61fec428',
      interval
    }).then(
      (res) => {

        if (this.isUnmounted) {
          return;
        }

        const toSeries = (item) => {
          const pointStart = _.first(_.keys(item.pointlist)) * 1000;
          return {
            name: item.tags.host,
            data: _.values(item.pointlist),
            pointStart,
            pointInterval: interval * 1000,
          };
        };

        const markOutlier = (items, madSerie) => {
          const madSerieData = madSerie.data;
          const madSerieDataLength = madSerieData.length;

          items.forEach((item) => {
            let count = 0;
            item.data.forEach((d, i) => {
              if (abs(madSerieData[i] - d) > tolerance) {
                count++;
              }
            });
            const itemOutlierPercentage = 100 * (count / madSerieDataLength);
            if (itemOutlierPercentage < pct) {
              item.dashStyle = 'Dot';
            }
          });

          items.push(madSerie);
          return items;
        };

        const data = res
          .slice(0, 10)
          .map(toSeries);

        const madSerie = getMadSerie(data);

        markOutlier(data, madSerie);

        data.forEach((serie) => {
          this.chart.addSeries(serie, false);
        });
        this.chart.render();
      }
    );
  }

  render() {
    return (
      <div
        ref={(elem) => {
          this.container = elem;
        }}
      />
    );
  }
}

Chart.propTypes = {
  interval: React.PropTypes.number,
  pct: React.PropTypes.number,
  tolerance: React.PropTypes.number
};

export default Chart;
