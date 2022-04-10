const { merge } = require('webpack-merge');
const config = require('./webpack.config');

module.exports = merge(config, {
	// loading and extending wepack.config.js

	mode: 'production'
});
