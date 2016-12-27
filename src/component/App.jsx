import React from 'react';
import Chart from './Chart';

class App extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      interval: 60,
      pct: 50,
      tolerance: 0.2
    };
  }

  onValueChange = field => ({ target: { value } }) => {
    this.setState({
      [field]: parseFloat(value, 10)
    });
  }

  render() {
    const {
      interval,
      pct,
      tolerance
    } = this.state;

    return (
      <div>
        <Chart
          interval={interval}
          pct={pct}
          tolerance={tolerance}
        />
        <form>
          <p>
            <label>
              interval:
              <input
                type="range"
                min="10"
                max="300"
                step="10"
                value={interval}
                onChange={this.onValueChange('interval')}
              />
              {interval}
            </label>
          </p>
          <p>
            <label>
              tolerance:
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
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
