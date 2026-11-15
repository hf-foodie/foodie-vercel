// Diagnostic code frames may include an absolute checkout path. Keep the
// diagnostic and position, but compare repository-relative locations in CI.
function normalizeLintKey(key) {
  const [file, rule, message, source] = JSON.parse(key)
  const relative = file.replaceAll('\\', '/')
  const portableMessage = message.replace(
    /^(?:[A-Za-z]:[\\/]|\/)[^\r\n]*:(\d+):(\d+)\r?$/gm,
    (_location, line, column) => `<repo>/${relative}:${line}:${column}`,
  )
  return JSON.stringify([relative, rule, portableMessage, source])
}
module.exports = { normalizeLintKey }
