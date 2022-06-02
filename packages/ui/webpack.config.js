const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	mode: 'none',
	// webpack will use different built-in optimizations for each dev/prod situation.

	// I.O. CONFIGURATION
	entry: {
		index: './index.tsx'
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		clean: true,
		filename: '[name].[contenthash].bundle.js',
		chunkFilename: pathData => {
			return pathData.chunk.name === 'index'
				? '[name].[contenthash].bundle.js'
				: '[name]/[name].[contenthash].bundle.js';
		},
		publicPath: '/'
	},

	// MODULES TO RESOLVE
	resolve: {
		modules: [path.resolve('./src'), 'node_modules'],
		extensions: ['.js', '.jsx', '.ts', '.tsx']
		// Tell webpack will attempt to look for all the extensions above.
		// When there are same file names with different extensions, webpack will resolve the extension listed first in this array.
		// i.e. `import "foo"` will resolve foo.js rather than foo.json
	},

	// LOADERS
	module: {
		rules: [
			{
				test: /\.m?(j|t)sx?$/,
				// match modules with regex
				// exclude: /node_modules/,
				include: {
					// and: [/react-notion-x/],
					not: [/node_modules/]
				},
				// exclude node_modules, transpiling packages will cause problems
				loader: 'babel-loader'
				// loader to process this module
			},
			{
				test: /\.css/,
				use: ['style-loader', 'css-loader']
				// use multiple loaders, will be processed from backwards (LIFO)
			},
			{
				test: /\.(jpe?g|png|webp|gif|svg)/,
				type: 'asset',
				generator: {
					filename: 'images/[hash][ext][query]'
				},
				parser: {
					dataUrlCondition: {
						maxSize: 4 * 1024 // 8kb
					}
				}
				// use: [{ loader:"url-loader", options: {limit: 8 * 1024} }],
				// url-loader is a deprecated from Webpack v5, see "Asset Modules" in webpac doc.
			}
		]
	},

	// PLUGINS
	plugins: [
		new HtmlWebpackPlugin({
			template: './index.html'
		})
		// insert bundles and extracted chunks into html template
	],

	optimization: {
		usedExports: true
		// tree-shaking enabled
	},

	performance: {
		hints: false
		// disable bundle size warning
	},

	stats: {
		orphanModules: false
		// disable orphanModules warning
	}
};
