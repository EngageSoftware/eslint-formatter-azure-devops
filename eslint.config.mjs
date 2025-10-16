import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import ava from 'ava/flat/recommended';
import globals from 'globals';

export default defineConfig([
	{
		files: ['**/*.{js,mjs,cjs}'],
		plugins: { js },
		extends: ['js/recommended'],
		languageOptions: { globals: globals.node },
	},
	{ files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
	{ files: ['test.js'], plugins: { ava }, extends: ['ava/recommended'] },
]);
