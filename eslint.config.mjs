import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintPluginAva from 'eslint-plugin-ava';
import globals from 'globals';

export default defineConfig([
	{
		files: ['**/*.{js,mjs,cjs}'],
		plugins: { js },
		extends: ['js/recommended'],
		languageOptions: { globals: globals.node },
	},
	{ files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
	...eslintPluginAva.configs.recommended,
]);
