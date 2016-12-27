import assert from 'assert';
import $ from 'jquery';
import { median, abs } from 'mathjs';
import _ from 'underscore';

export const fetchJSON = (path, params) => $
  .getJSON(path, params)
  .then((resonse) => {
    assert(resonse.code === 0);
    return resonse.result;
  });

export const MAD = (data) => {
  const medianOfData = median(data);
  return median(data.map(i => abs((i - medianOfData))));
};

export const getMadSerie = (item) => {
  const firstItem = _.first(item);
  const length = firstItem.data.length;
  const madSerie = {
    name: 'madSerie',
    data: [],
    visible: false
  };
  const madSerieData = madSerie.data;
  for (let j = 0; j < length; j++) {
    const valuesAtJ = [];
    let timestime = null;
    for (let i = 0; i < item.length; i++) {
      if (item[i].data) {
        timestime = item[i].data[j][0];
        valuesAtJ.push(item[i].data[j][1]);
      }
    }
    madSerieData.push(
      [timestime, MAD(valuesAtJ)]
    );
  }
  return madSerie;
};

export const flat = items => _.map(items, (v, k) => [k * 1000, v]);
