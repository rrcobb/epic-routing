module.exports = {
  entry: "./app.js",
  devtool: "eval-source-maps",
  output: {
    path: __dirname,
    filename: "bundle.js",
  },
  module: {
    loaders: [{ test: /\.js$/, loader: "babel-loader" }],
  },
};
