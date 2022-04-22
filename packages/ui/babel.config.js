module.exports = {
	presets: [
		[
			'@babel/preset-env',
			{
				targets: '> 0.25%, not dead',
				useBuiltIns: 'usage',
				modules: 'auto',
				// "auto" will automatically select false if ES6 module syntax is already supported by the caller, or "commonjs" otherwise.
				corejs: {
					version: 3,
					proposals: true
				}
			}
		],
		'@babel/preset-react',
		'@babel/preset-typescript'
	],
	plugins: []
};
