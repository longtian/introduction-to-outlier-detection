import React from 'react';
import Highcharts from 'highcharts';
import { abs } from 'mathjs';
import { throttle, isNull } from 'underscore';
import { DBSCAN } from 'density-clustering';

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
        text: ''
      }
    });
    this.fetch();
    this.markOutlierDelayed = throttle((...args) => {
      this.markOutlier(...args);
    }, 100);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.pct !== this.props.pct
      || newProps.tolerance !== this.props.tolerance
      || newProps.method !== this.props.method
    ) {
      this.markOutlierDelayed(newProps);
    }
  }

  componentWillUnmount() {
    this.isUnmounted = true;
  }

  fetch() {
    const {
      begin
    } = this.props;
    fetchJSON('/v1/query.json', {
      q: 'avg:airquality.beijing.pm25;avg:airquality.shanghai.pm25;avg:airquality.hangzhou.pm25;avg:airquality.guangzhou.pm25;avg:airquality.shengzhen.pm25',
      interval: begin / 60 / 1000,
      begin,
      end: Date.now()
    }).then(
      (res) => {
        if (this.isUnmounted) {
          return;
        }
        const toSeries = (item, i) => (
          {
            name: `${i}-${item.metric}`,
            data: flat(item.pointlist)
          }
        );
        const trimData = res.slice(0, 10).map(toSeries);
        const madSerie = getMadSerie(trimData);
        trimData.forEach((serie) => {
          this.chart.addSeries(serie, false);
        });
        this.hMadSerie = this.chart.addSeries(madSerie, false);
        this.hRangeSerie = this.chart.addSeries({
          data: [],
          type: 'arearange',
          zIndex: -1,
          color: '#eeeeee',
          showInLegend: false
        }, false);
        this.markOutlier();
      }
    ).catch((e) => {
      console.error(e); // eslint-disable-line no-console
    });
  }

  markOutlier({
    tolerance,
    pct,
    method
  } = this.props) {
    this.chart.update({
      title: {
        text: method.toUpperCase()
      }
    });
    const mad = this.hMadSerie.userOptions.mad;
    const newRan = this.hMadSerie.userOptions.data.map(([timestamp, m]) => ([
      timestamp, m - (mad * tolerance), m + (mad * tolerance)
    ]));
    this.hRangeSerie.update({
      data: newRan
    });
    if (method === 'mad') {
      this.markWithMAD(tolerance, pct);
    } else {
      this.markWithDBSCAN(tolerance, pct);
    }
  }

  markWithDBSCAN(tolerance, pct) {
    const chart = this.chart;
    const mad = this.hMadSerie.userOptions.mad;
    const epsilon = mad * tolerance;
    const outlierCount = {};
    const series = this.chart.series
      .filter(s => s !== this.hRangeSerie)
      .filter(s => s !== this.hMadSerie);
    this.hMadSerie.yData.forEach((median, index) => {
      const dbscan = new DBSCAN();
      const dataSet = series
        .map(s => [0, s.yData[index]]);
      dbscan.run(dataSet, epsilon, 2);
      dbscan.noise.forEach((i) => {
        if (!isNull(series[i].yData[index])) {
          outlierCount[i] = outlierCount[i] ? outlierCount[i] + 1 : 1;
        }
      });
    });
    series.forEach((s, i) => {
      const availableValue = s.yData.filter(value => !isNull(value)).length;
      const sOutlierCount = outlierCount[i] || 0;
      const itemOutlierPercentage = 100 * (sOutlierCount / availableValue);
      if (itemOutlierPercentage < pct) {
        if (s.options.dashStyle !== 'Dot') {
          s.update({
            dashStyle: 'Dot',
            color: '#cccccc'
          }, false);
        }
      } else if (s.options.dashStyle !== 'Solid') {
        s.update({
          dashStyle: 'Solid',
          color: 'orange'
        }, false);
      }
    });
    chart.render();
  }


  markWithMAD(tolerance, pct) {
    const mad = this.hMadSerie.userOptions.mad;
    const madSerieData = this.hMadSerie.yData;
    this.chart.series.forEach((serie) => {
      if (serie === this.hMadSerie) {
        return;
      }
      let count = 0;
      let serieRealLength = 0;
      serie.yData.forEach((d, i) => {
        if (!isNull(d)) {
          serieRealLength++;
          if (abs(madSerieData[i] - d) > mad * tolerance) {
            count++;
          }
        }
      });
      const itemOutlierPercentage = 100 * (count / serieRealLength);
      if (itemOutlierPercentage < pct) {
        if (serie.options.dashStyle !== 'Dot') {
          serie.update({
            dashStyle: 'Dot',
            color: '#cccccc'
          }, false);
        }
      } else if (serie.options.dashStyle !== 'Solid') {
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
  begin: React.PropTypes.number,
  pct: React.PropTypes.number,
  tolerance: React.PropTypes.number,
  method: React.PropTypes.oneOf(['mad', 'dbscan'])
};

export default Chart;
