import assert from 'assert';
import $ from 'jquery';
import { median, mad } from 'mathjs';
import _ from 'underscore';

/**
 * 请求后台
 * @param path
 * @param params
 */
export const fetchJSON = (path, params) => $
  .getJSON(path, params)
  .then((resonse) => {
    assert(resonse.code === 0);
    return resonse.result;
  });

/**
 * 返回一个 Highcharts 可用的 Serie
 * @param series
 * @returns {{name: string, data: Array, visible: boolean}}
 */
export const getMadSerie = (series) => {
  // 当前时间段内的所有非 Null 值
  const everyPointValues = _
    .union(...series.map(i => i.data.map(j => j[1])))
    .filter(i => !_.isNull(i));

  // 求 MAD
  const m = median(everyPointValues);

  const firstItem = _.first(series);
  const madSerie = {
    name: '中间值',
    data: firstItem.data.map(([timestamp]) => ([timestamp, m])),
    median: m,
    mad: mad(everyPointValues),
    visible: false,
    color: 'black'
  };
  return madSerie;
};

/**
 * 把 pointlist 转成一个 2 维度数组
 * @param items
 */
const flat = items => _.map(items, (value, timestamp) => [timestamp * 1000, value]);

export const toSeries = (item, i) => (
  {
    name: `${i}-${item.metric}`,
    data: flat(item.pointlist)
  }
);

/**
 * 根据 outlierCount 和 pct 更新 series 的样式
 *
 * @param outlierCount
 * @param pct
 * @param series
 */
export const toggleSeriesStyle = (outlierCount, pct, series) => {
  series.forEach((serie, i) => {
    const availableValue = serie.yData.filter(value => !_.isNull(value)).length;
    const sOutlierCount = outlierCount[i] || 0;
    const itemOutlierPercentage = 100 * (sOutlierCount / availableValue);
    const isOutlier = itemOutlierPercentage >= pct;

    if (isOutlier) {
      if (serie.options.dashStyle !== 'Solid') {
        serie.update({
          dashStyle: 'Solid',
          color: 'orange'
        }, false);
      }
    } else if (serie.options.dashStyle !== 'Dot') {
      serie.update({
        dashStyle: 'Dot',
        color: '#cccccc'
      }, false);
    }
  });
};
