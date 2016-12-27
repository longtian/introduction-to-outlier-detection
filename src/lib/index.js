import assert from 'assert';
import $ from 'jquery';
import { median, abs } from 'mathjs';
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
 * Median Absolutes Devation
 * @param data
 * @returns {*}
 * @constructor
 */
export const MAD = (data) => {
  const medianOfData = median(data);
  return median(data.map(i => abs((i - medianOfData))));
};

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
  const mad = MAD(everyPointValues);
  const m = median(everyPointValues);

  const firstItem = _.first(series);
  const madSerie = {
    name: 'madSerie',
    data: firstItem.data.map(([timestamp]) => ([timestamp, m])),
    mad,
    visible: false
  };
  return madSerie;
};

/**
 * 把 pointlist 转成一个 2 维度数组
 * @param items
 */
export const flat = items => _.map(items, (value, timestamp) => [timestamp * 1000, value]);
