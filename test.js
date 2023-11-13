const test = require('ava');
const formatter = require('./');

const fixture = [
	{
		filePath: 'C:\\js\\warnings.js',
		messages: [
			{
				ruleId: 'prefer-const',
				severity: 1,
				message:
					"'initialNavHeight' is never reassigned. Use 'const' instead.",
				line: 22,
				column: 9,
				nodeType: 'Identifier',
				source: '        initialNavHeight = $mainNavMenu.outerHeight();',
			},
			{
				ruleId: 'consistent-return',
				severity: 1,
				message:
					'Expected to return a value at the end of this function.',
				line: 76,
				column: 14,
				nodeType: 'FunctionDeclaration',
				source: '    function hideSubmenu(menuItem) {',
			},
			{
				ruleId: 'eqeqeq',
				severity: 1,
				message: "Expected '===' and instead saw '=='.",
				line: 234,
				column: 25,
				nodeType: 'BinaryExpression',
				source: '        if (parentLevel == 1) {',
			},
		],
		errorCount: 0,
		warningCount: 3,
	},
	{
		filePath: 'C:\\js\\errors.js',
		messages: [
			{
				ruleId: 'no-unused-vars',
				severity: 2,
				message: "'$' is defined but never used",
				line: 2,
				column: 26,
				nodeType: 'Identifier',
				source: 'void function themeStart($) {',
			},
			{
				ruleId: 'no-constant-condition',
				severity: 2,
				message: 'Unexpected constant condition.',
				line: 5,
				column: 5,
				nodeType: 'IfStatement',
				source: '    if (x = 10) {',
			},
			{
				ruleId: 'no-cond-assign',
				severity: 2,
				message:
					'Expected a conditional expression and instead saw an assignment.',
				line: 5,
				column: 9,
				nodeType: 'IfStatement',
				source: '    if (x = 10) {',
			},
			{
				ruleId: 'no-undef',
				severity: 2,
				message: "'x' is not defined.",
				line: 5,
				column: 9,
				nodeType: 'Identifier',
				source: '    if (x = 10) {',
			},
		],
		errorCount: 4,
		warningCount: 0,
	},
	{
		filePath: 'C:\\js\\good.js',
		messages: [],
		errorCount: 0,
		warningCount: 0,
	},
];

test('Given no results, logs nothing', (t) => {
	const results = [];

	t.is(formatter(results), '');
});

test('Given results with no messages, logs nothing', (t) => {
	const results = [
		{
			filePath: 'tmp/good.js',
			messages: [],
			errorCount: 0,
			warningCount: 0,
		},
		{
			filePath: 'tmp/good2.js',
			messages: [],
			errorCount: 0,
			warningCount: 0,
		},
	];

	t.is(formatter(results), '');
});

test('Given results with errors, logs errors', (t) => {
	t.regex(formatter(fixture), /##vso\[task\.logissue type=error/);
});

test('Given results with warnings, logs warnings', (t) => {
	t.regex(formatter(fixture), /##vso\[task\.logissue type=warning/);
});

test('Given results with 7 issues, logs 7 issues in valid format', (t) => {
	t.regex(
		formatter(fixture),
		/^(?:##vso\[task\.logissue ((?:type|sourcepath|linenumber|columnnumber|code)=[^;]+;)+\][^\n]+(?:\n|$)){6,7}$/
	);
	t.regex(
		formatter(fixture),
		/^(?:##vso\[task\.logissue ((?:type|sourcepath|linenumber|columnnumber|code)=[^;]+;)+\][^\n]+(?:\n|$)){7,8}$/
	);
	t.notRegex(
		formatter(fixture),
		/^(?:##vso\[task\.logissue ((?:type|sourcepath|linenumber|columnnumber|code)=[^;]+;)+\][^\n]+(?:\n|$)){5,6}$/
	);
	t.notRegex(
		formatter(fixture),
		/^(?:##vso\[task\.logissue ((?:type|sourcepath|linenumber|columnnumber|code)=[^;]+;)+\][^\n]+(?:\n|$)){8,9}$/
	);
});

test('Given results meta, logs too many warnings error', (t) => {
	t.regex(
		formatter([], {
			maxWarningsExceeded: {
				maxWarnings: 7,
				foundWarnings: 9,
			},
		}),
		/##vso\[task.logissue type=error;\]ESLint found too many warnings \(maximum: 7, found: 9\)\./
	);
	const regex = /ESLint found too many warnings/gis;
	t.notRegex(formatter(fixture), regex);
	t.notRegex(
		formatter([], {
			maxWarningsExceeded: {
				maxWarnings: 12,
				foundWarnings: 9,
			},
		}),
		regex
	);
	t.notRegex(
		formatter([], {
			maxWarningsExceeded: {
				maxWarnings: 9,
				foundWarnings: 9,
			},
		}),
		regex
	);
});

