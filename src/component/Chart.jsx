import React from 'react';
import Highcharts from 'highcharts';
import { abs } from 'mathjs';
import { fetchJSON, getMadSerie, flat } from '../lib';

class Chart extends React.Component {
  componentDidMount() {
    window.c = this.chart = new Highcharts.Chart({
      chart: {
        renderTo: this.container
      },
      xAxis: {
        type: 'datetime'
      },
      title: {
        text: 'MAD'
      }
    });
    setTimeout(() => {
      if (!this.isUnmounted) {
        this.fetch();
      }
    }, 100);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.pct !== this.props.pct || newProps.tolerance !== this.props.tolerance) {
      this.markOutlier(newProps);
    }
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
            data: flat(item.pointlist)
          }
        );
        const trimData = res.map(toSeries);
        const madSerie = getMadSerie(trimData);
        trimData.forEach((serie) => {
          this.chart.addSeries(serie, false);
        });
        this.hMadSerie = this.chart.addSeries(madSerie, false);
        this.hRangeSerie = this.chart.addSeries({
          data: [],
          type: 'arearange',
          zIndex: -1,
          color: '#eeeeee'
        }, false);
        this.markOutlier();
      }
    ).catch((e) => {
      console.error(e); // eslint-disable-line no-console
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
      if (serie === this.hRangeSerie) {
        const newRan = this.hMadSerie.userOptions.data.map(([timestamp, mad]) => ([
          timestamp, mad - tolerance, mad + tolerance
        ]));
        this.hRangeSerie.update({
          data: newRan
        });
        return;
      }
      let count = 0;
      serie.yData.forEach((d, i) => {
        if (abs(madSerieData[i] - d) > tolerance) {
          count++;
        }
      });
      const itemOutlierPercentage = 100 * (count / madSerieDataLength);
      if (itemOutlierPercentage < pct) {
        serie.update({
          dashStyle: 'Dot',
          color: '#cccccc'
        }, false);
      } else {
        serie.update({
          dashStyle: 'Solid',
          color: 'orange'
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
