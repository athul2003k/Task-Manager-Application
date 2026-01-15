const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

// project root logs directory
const logsDir = path.join(process.cwd(), "logs");

// ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// create write streams FIRST
const infoStream = fs.createWriteStream(
  path.join(logsDir, "info.txt"),
  { flags: "a" }
);

const errorStream = fs.createWriteStream(
  path.join(logsDir, "error.txt"),
  { flags: "a" }
);

// log format
const format = '[:date[iso]] :method :url :status :response-time ms';

// info logs (< 400)
const infoLogger = morgan(format, {
  stream: infoStream,
  skip: (req, res) => res.statusCode >= 400,
});

// error logs (>= 400)
const errorLogger = morgan(format, {
  stream: errorStream,
  skip: (req, res) => res.statusCode < 400,
});

module.exports = {
  infoLogger,
  errorLogger,
};
