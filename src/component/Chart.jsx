import React from 'react';
import Highcharts from 'highcharts';
import { abs, mean } from 'mathjs';
import { fetchJSON, getMadSerie, flat } from '../lib';

class Chart extends React.Component {
  componentDidMount() {
    window.c = this.chart = new Highcharts.Chart({
      chart: {
        renderTo: this.container
      },
      xAxis: {
        type: 'datetime'
      }
    });
    this.fetch();
  }

  componentWillReceiveProps(newProps) {
    this.markOutlier(newProps);
  }

  componentWillUnmount() {
    this.isUnmounted = true;
  }

  fetch() {
    const {
      interval,
    } = this.props;
    fetchJSON('/v1/query.json', {
      q: 'avg:system.load.1{*}by{host}',
      interval
    }).then(
      (res) => {
        if (this.isUnmounted) {
          return;
        }
        const toSeries = item => (
          {
            name: item.tags.host,
            data: flat(item.pointlist),
            color: '#cccccc'
          }
        );
        const trimData = res.slice(3, 10).map(toSeries);
        const madSerie = getMadSerie(trimData);
        trimData.forEach((serie) => {
          this.chart.addSeries(serie, false);
        });
        this.hMadSerie = this.chart.addSeries(madSerie, false);
        this.markOutlier();
      }
    ).catch((e) => {
      console.error(e);
    });
  }

  markOutlier({
    tolerance,
    pct
  } = this.props) {
    const madSerieData = this.hMadSerie.yData;

    const madSerieDataLength = madSerieData.length;
    this.chart.series.forEach((serie) => {
      if (serie === this.hMadSerie) {
        return;
      }

      let count = 0;
      serie.yData.forEach((d, i) => {
        if (abs(mean(madSerieData[i]) - d) > tolerance) {
          count++;
        }
      });

      const itemOutlierPercentage = 100 * (count / madSerieDataLength);
      if (itemOutlierPercentage < pct) {
        serie.update({
          dashStyle: 'Dot'
        }, false);
      } else {
        serie.update({
          dashStyle: 'Solid'
        }, false);
      }
    });
    this.chart.render();
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
