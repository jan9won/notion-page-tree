// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const path = require('path');
const { merge } = require('webpack-merge');
const config = require('./webpack.config');

module.exports = merge(config, {
	// loading and extending wepack.config.js
	mode: 'development',

	devServer: {
		static: {
			directory: path.join(__dirname, 'dist')
		},
		port: 9000,
		compress: true, // gzip everything served
		historyApiFallback: true, // paths other than root (/) will also be served with index file. This is required for SPAs.
		open: true // open default browser on devserver setup
		// hot-module-reload is configured by default from webpack v4+
	},

	plugins: [
		// new BundleAnalyzerPlugin(),
	]
});
