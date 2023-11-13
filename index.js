/*eslint-env node*/

const ERROR_SEVERITY = 2;

function logIssue(issue) {
	const attributes = Object.entries(issue)
		.map((pair) => {
			const [key, value] = pair;
			if (key === 'message' || value === undefined) {
				return null;
			}

			return `${key}=${value};`;
		})
		.filter((attribute) => Boolean(attribute));

	return `##vso[task.logissue ${attributes.join('')}]${issue.message}`;
}

module.exports = (results, resultsMeta) => {
	let hasWarnings = false;
	let hasErrors = false;

	const formattedResults = results
		.filter((result) => result.messages.length > 0)
		.map((result) => {
			hasWarnings ||= !!result.warningCount;
			hasErrors ||= !!result.errorCount;

			return result.messages.map((message) =>
				logIssue({
					type:
						message.fatal || message.severity === ERROR_SEVERITY
							? 'error'
							: 'warning',
					sourcepath: result.filePath,
					linenumber: message.line,
					columnnumber: message.column,
					code: message.ruleId,
					message: message.message,
				})
			);
		})
		.reduce((allMessages, messages) => {
			if (messages != null && messages.length > 0) {
				return allMessages.concat(messages);
			}
			return allMessages;
		}, []);

	if (resultsMeta?.maxWarningsExceeded) {
		const { maxWarnings, foundWarnings } = resultsMeta.maxWarningsExceeded;
		if (maxWarnings < foundWarnings) {
			formattedResults.push(
				logIssue({
					type: 'error',
					message: `ESLint found too many warnings (maximum: ${maxWarnings}, found: ${foundWarnings}).`,
				})
			);
		}
	}

	if (hasWarnings && !hasErrors && !resultsMeta?.maxWarningsExceeded) {
		formattedResults.push('##vso[task.complete result=SucceededWithIssues;]');
	}

	return formattedResults.join('\n');
};
