import React from 'react';
import Chart from './Chart';

class App extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      pct: 25,
      tolerance: 3,
      begin: 86400000
    };
  }

  onValueChange = field => ({ target: { value } }) => {
    this.setState({
      [field]: parseFloat(value, 10)
    });
  }

  render() {
    const {
      pct,
      tolerance,
      begin
    } = this.state;

    return (
      <div>
        <Chart
          key={begin}
          pct={pct}
          tolerance={tolerance}
          begin={begin}
        />
        <form>
          <p>
            <label>
              1小时
              <input
                checked={begin === 3600000}
                type="radio"
                name="range"
                onChange={this.onValueChange('begin')}
                value={3600000}
              />
            </label>
            <label>
              1天
              <input
                checked={begin === 86400000}
                type="radio"
                name="range"
                onChange={this.onValueChange('begin')}
                value={86400000}
              />
            </label>
            <label>
              1周
              <input
                checked={begin === 604800000}
                type="radio"
                name="range"
                onChange={this.onValueChange('begin')}
                value={604800000}
              />
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
