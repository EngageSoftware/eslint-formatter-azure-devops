module.exports = {
	printWidth: 80,
	useTabs: true,
	tabWidth: 4,
	trailingComma: 'es5',
	semi: true,
	singleQuote: true,
	bracketSpacing: true,
	bracketSameLine: true,
	arrowParens: 'always',
	endOfLine: 'crlf',
	overrides: [
		{
			files: '*.yml',
			options: { parser: 'json' },
		},
	],
};
