import path from "path";
import url from "url";

function getCallerInfo() {
  const stack = new Error().stack.split("\n");

  // Find first stack entry that is NOT from logger.js
  const line = stack.find(l =>
    l.includes(".js:") &&
    !l.includes("logger.js") &&
    !l.includes("console.log")
  );

  if (!line) return { file: "unknown", line: 0 };

  const patterns = [
    /\((.*):(\d+):(\d+)\)/,
    /at (.*):(\d+):(\d+)/,
    /(file:\/\/\/.*):(\d+):(\d+)/
  ];

  let match;
  for (const p of patterns) {
    match = line.match(p);
    if (match) break;
  }

  if (!match) return { file: "unknown", line: 0 };

  let absolutePath = match[1];

  if (absolutePath.startsWith("file://")) {
    absolutePath = url.fileURLToPath(absolutePath);
  }

  const relativePath = path
    .relative(process.cwd(), absolutePath)
    .replace(/\\/g, "/");

  return {
    file: relativePath,
    line: match[2],
  };
}


const originalLog = console.log;

console.log = (...args) => {
  const { file, line } = getCallerInfo();

  const gray = "\x1b[2m";
  const reset = "\x1b[0m";

  // Put logger info at END of log, in gray
  originalLog(...args, `${gray} (${file}:${line})${reset}`);
};
