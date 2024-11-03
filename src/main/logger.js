const fs = require("fs");

const rootLogs = "./logs";
const LOCALE = process.env.LOCALE;

function addToLogFile(logFileName, data) {
  const timestamp = new Date().toLocaleString(LOCALE);
  const content = `${timestamp}: ${data}\n`;
  const filePath = `${rootLogs}/${logFileName}.txt`;
  fs.appendFile(filePath, content, (err) => {
    if (err) {
      console.error("Error writing to file:", err);
    }
  });
}

module.exports = addToLogFile;
