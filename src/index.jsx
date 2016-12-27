import React from 'react';
import { render } from 'react-dom';
import Highcharts from 'highcharts';
import $ from 'jquery';

import App from './component/App';

const element = document.createElement('div');
document.body.appendChild(element);

$('#cloudinsight-intial-loading').hide();
Highcharts.setOptions({
  global: {
    useUTC: false
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
render(<App />, element);
