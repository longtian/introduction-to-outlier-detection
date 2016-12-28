import React from 'react';
import Highcharts from 'highcharts';
import { abs } from 'mathjs';
import { throttle, isNull } from 'underscore';
import { DBSCAN } from 'density-clustering';

import { fetchJSON, getMadSerie, toSeries, toggleSeriesStyle } from '../lib';

class Chart extends React.Component {

  componentDidMount() {
    this.chart = new Highcharts.Chart({
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
    // 全局 c 变量便于调试
    window.c = this.chart;
    // 防止调用太频繁
    this.markOutlierDelayed = throttle((...args) => {
      this.markOutlier(...args);
    }, 100);
    // 发起请求
    this.fetch();
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
      begin,
      query,
      limit
    } = this.props;
    fetchJSON('/v1/query.json', {
      q: query,
      interval: begin / 60 / 1000,
      begin,
      end: Date.now()
    }).then(
      (res) => {
        if (this.isUnmounted) {
          return;
        }
        // 限制结果数量
        const trimmedData = res
          .slice(0, limit).map(toSeries);
        const madSerie = getMadSerie(trimmedData);
        trimmedData.forEach((serie) => {
          this.chart.addSeries(serie, false);
        });
        // 添加中间值序列
        this.hMadSerie = this.chart.addSeries(madSerie, false);
        // 跟着中间值上向浮动
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
      this.chart.showLoading(e.message);
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

    // 更新 Range
    const mad = this.hMadSerie.userOptions.mad;
    const newRan = this.hMadSerie.userOptions.data.map(([timestamp, m]) => ([
      timestamp, m - (mad * tolerance), m + (mad * tolerance)
    ]));
    this.hRangeSerie.update({
      data: newRan
    });

    // 调用对应的算法
    if (method === 'mad') {
      this.markWithMAD(tolerance, pct);
    } else {
      this.markWithDBSCAN(tolerance, pct);
    }
    this.chart.render();
  }

  markWithDBSCAN(tolerance, pct) {
    const series = this.chart.series
      .filter(s => s !== this.hRangeSerie)
      .filter(s => s !== this.hMadSerie);

    const mad = this.hMadSerie.userOptions.mad;
    const epsilon = mad * tolerance;
    const outlierCount = {};
    this.hMadSerie.yData.forEach((median, index) => {
      const dbscan = new DBSCAN();
      const dataSet = series
        .map(s => [0, s.yData[index]]);
      dbscan.run(dataSet, epsilon, 2);
      dbscan.noise.forEach((i) => {
        // 忽略 null
        if (!isNull(series[i].yData[index])) {
          outlierCount[i] = outlierCount[i] ? outlierCount[i] + 1 : 1;
        }
      });
    });
    toggleSeriesStyle(outlierCount, pct, series);
  }

  markWithMAD(tolerance, pct) {
    const series = this.chart.series
      .filter(s => s !== this.hRangeSerie)
      .filter(s => s !== this.hMadSerie);

    const mad = this.hMadSerie.userOptions.mad;
    const median = this.hMadSerie.userOptions.median;
    const distance = mad * tolerance;
    const outlierCount = {};
    series.forEach((serie, i) => {
      serie.yData.forEach((d, j) => {
        // 忽略 null
        if (!isNull(d) && (abs(median - d) > distance)) {
          outlierCount[i] = outlierCount[i] ? outlierCount[i] + 1 : 1;
        }
      });
    });
    toggleSeriesStyle(outlierCount, pct, series);
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
  method: React.PropTypes.oneOf(['mad', 'dbscan']),
  query: React.PropTypes.string,
  limit: React.PropTypes.number
};

export default Chart;
