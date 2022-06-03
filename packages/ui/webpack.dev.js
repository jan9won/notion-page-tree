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
		port: 9002,
		host: '0.0.0.0',
		allowedHosts: 'all',
		compress: true, // gzip everything served
		historyApiFallback: true, // paths other than root (/) will also be served with index file. This is required for SPAs.
		open: false, // open default browser on devserver setup
		// hot-module-reload is configured by default from webpack v4+
		proxy: {
			'/recordmap': {
				target: 'http://localhost:9001',
				secure: false,
				changeOrigin: true
			}
		},
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
			'Access-Control-Allow-Headers':
				'X-Requested-With, content-type, Authorization'
		}
	},

	plugins: [
		// new BundleAnalyzerPlugin(),
	],

	optimization: {
		runtimeChunk: 'single'
		// Required with code-splitting. Devserver can't resolve module federation.
	}
});
