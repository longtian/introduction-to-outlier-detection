import $ from 'jquery';
import Highcharts from 'highcharts';
import _ from 'underscore';
import { fetchJSON, getMadSerie } from './lib';

$('#cloudinsight-intial-loading').hide();
Highcharts.setOptions({
  global: {
    useUTC: false
  }
});

const $container = $('<div>');
$container.appendTo('body');

const chart = new Highcharts.Chart({
  chart: {
    renderTo: $container[0]
  },
  xAxis: {
    type: 'datetime'
  },
  plotOptions: {
    series: {
      marker: {
        enabled: false
      },
      animation: false
    }
  }
});

const interval = 60;

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

fetchJSON('/v1/query.json', {
  q: 'avg:system.load.1{*}by{host}',
  interval
}).then(
  (res) => {
    const data = res
      .slice(0, 5)
      .map(toSeries);

    markOutlier(data)
      .forEach((serie) => {
        chart.addSeries(serie, false);
      });
    chart.render();
  }
);
