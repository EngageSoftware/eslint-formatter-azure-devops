/*eslint-env node*/

const ERROR_SEVERITY = 2;

function logIssue(issue) {
    const attributes = Object.entries(issue)
        .filter((pair) => pair[0] !== "message" && pair[1] !== undefined)
        .map((pair) => `${pair[0]}=${pair[1]};`);

    return `##vso[task.logissue ${attributes.join("")}]${issue.message}`;
}

module.exports = (results, resultsMeta) => {
    const resultsAsString = results
        .filter((result) => result.messages.length > 0)
        .map((result) =>
            result.messages.map((message) =>
                logIssue({
                    type:
                        message.fatal || message.severity === ERROR_SEVERITY
                            ? "error"
                            : "warning",
                    sourcepath: result.filePath,
                    linenumber: message.line,
                    columnnumber: message.column,
                    code: message.ruleId,
                    message: message.message,
                })
            )
        )
        .reduce((previousValue, currentValue) => {
            if (currentValue != null && currentValue.length > 0) {
                return previousValue.concat(currentValue);
            }
            return previousValue;
        }, [])
        .join("\n");

    return resultsMeta?.maxWarningsExceeded != null &&
        resultsMeta.maxWarningsExceeded.maxWarnings <
            resultsMeta.maxWarningsExceeded.foundWarnings
        ? `${resultsAsString}\n${logIssue({
              type: "error",
              message: `ESLint found too many warnings (maximum: ${resultsMeta.maxWarningsExceeded.maxWarnings}, found: ${resultsMeta.maxWarningsExceeded.foundWarnings}).`,
          })}\n`
        : resultsAsString;
};
