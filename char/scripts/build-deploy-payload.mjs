import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const root = process.cwd();
const list = execSync(
  `find . -type f ! -path './node_modules/*' ! -path './.next/*' ! -path './.git/*' ! -name '.env.local'`,
  { cwd: root, encoding: "utf8" },
)
  .trim()
  .split("\n")
  .filter(Boolean)
  .sort();

const files = list.map((rel) => {
  const p = rel.replace(/^\.\//, "");
  return { file: p, data: fs.readFileSync(path.join(root, rel), "utf8") };
});

fs.writeFileSync("/tmp/char-deploy-files.json", JSON.stringify(files));
console.log(`files=${files.length} bytes=${fs.statSync("/tmp/char-deploy-files.json").size}`);
