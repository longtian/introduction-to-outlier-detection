const autoprefixer = require('autoprefixer');

module.exports = {
  devtool: 'eval',
  entry: {
    main: './src/index.js'
  },
  output: {
    filename: '[name].js',
    path: './dist'
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.es6', '.less'],
    alias: {
      highcharts$: 'highcharts/highcharts.src.js'
    }
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel']
      },
      {
        test: /\.less$/,
        loader: 'style!css!postcss!less'
      },
      {
        test: /\.css$/,
        loader: 'style!css!postcss'
      },
    ]
  },
  devServer: {
    port: 8000,
    host: '0.0.0.0'
  },
  postcss: [
    autoprefixer({
      browsers: ['last 2 versions']
    })
  ]
};
