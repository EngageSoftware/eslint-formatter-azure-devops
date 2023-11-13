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

function shouldLogTaskComplete() {
	return Boolean(process.env.ESLINT_AZDO_LOG_TASK_COMPLETE);
}

function formatResults(results, resultsMeta) {
	let hasError = false;
	let hasWarning = false;
	const formattedResults = results
		.filter((result) => result.messages.length > 0)
		.map((result) =>
			result.messages.map((message) => {
				const type =
					message.fatal || message.severity === ERROR_SEVERITY
						? 'error'
						: 'warning';
				if (type === 'error') {
					hasError = true;
				} else {
					hasWarning = true;
				}

				return logIssue({
					type,
					sourcepath: result.filePath,
					linenumber: message.line,
					columnnumber: message.column,
					code: message.ruleId,
					message: message.message,
				});
			})
		)
		.reduce((allMessages, messages) => {
			if (messages != null && messages.length > 0) {
				return allMessages.concat(messages);
			}
			return allMessages;
		}, []);

	if (resultsMeta?.maxWarningsExceeded) {
		const { maxWarnings, foundWarnings } = resultsMeta.maxWarningsExceeded;
		if (maxWarnings < foundWarnings) {
			hasError = true;
			formattedResults.push(
				logIssue({
					type: 'error',
					message: `ESLint found too many warnings (maximum: ${maxWarnings}, found: ${foundWarnings}).`,
				})
			);
		}
	}

	if (formatResults.shouldLogTaskComplete() && (hasError || hasWarning)) {
		const result = hasError ? 'Failed' : 'SucceededWithIssues';
		formattedResults.push(`##vso[task.complete result=${result};]`);
	}

	return formattedResults.join('\n');
}

formatResults.shouldLogTaskComplete = shouldLogTaskComplete;

module.exports = formatResults;
