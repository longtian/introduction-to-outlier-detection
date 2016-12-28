import React from 'react';
import Chart from './Chart';

class App extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      pct: 25,
      tolerance: 2,
      begin: 86400000,
      method: 'dbscan'
    };
  }

  onValueChange = field => ({ target: { value } }) => {
    this.setState({
      [field]: field === 'method' ? value : parseFloat(value, 10)
    });
  }

  render() {
    const {
      pct,
      tolerance,
      begin,
      method
    } = this.state;

    return (
      <div>
        <Chart
          limit={10}
          query={'avg:airquality.beijing.pm25;avg:airquality.shanghai.pm25;avg:airquality.hangzhou.pm25;avg:airquality.guangzhou.pm25;avg:airquality.shengzhen.pm25'}
          key={begin}
          pct={pct}
          tolerance={tolerance}
          begin={begin}
          method={method}
        />
        <form>
          <p>
            <label>
              <input
                checked={begin === 3600000}
                type="radio"
                name="range"
                onChange={this.onValueChange('begin')}
                value={3600000}
              />
              1小时
            </label>
            <label>
              <input
                checked={begin === 86400000}
                type="radio"
                name="range"
                onChange={this.onValueChange('begin')}
                value={86400000}
              />
              1天
            </label>
            <label>
              <input
                checked={begin === 604800000}
                type="radio"
                name="range"
                onChange={this.onValueChange('begin')}
                value={604800000}
              />
              1周
            </label>
          </p>
          <hr />
          <p>
            <label>
              <input
                checked={method === 'mad'}
                type="radio"
                name="method"
                onChange={this.onValueChange('method')}
                value={'mad'}
              />
              MAD
            </label>
            <label>
              <input
                checked={method === 'dbscan'}
                type="radio"
                name="method"
                onChange={this.onValueChange('method')}
                value={'dbscan'}
              />
              DBSCAN
            </label>
          </p>
          <p>
            <label>
              tolerance:
              <input
                style={{ width: '80%' }}
                type="range"
                min="0.1"
                max="5"
                step="0.01"
                value={tolerance}
                onChange={this.onValueChange('tolerance')}
              />
              {tolerance}
            </label>
          </p>
          <p>
            <label>
              pct:
              <input
                style={{ width: '80%' }}
                type="range"
                min="0"
                max="100"
                value={pct}
                onChange={this.onValueChange('pct')}
              />
              {pct}%
            </label>
          </p>
        </form>
      </div>
    );
  }
}

export default App;
