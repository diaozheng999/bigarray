const { walk } = require("walk");
const { join } = require("path");
const config = require("../bsconfig.json");
const chalk = require("chalk");
const spawn = require("child_process");
const { writeFileSync } = require("fs");

const { sync } = require("command-exists");

// either `ocamlformat` or `ocp-indent`
const ocamlformatter = "ocamlformat";

console.log(`checking if OCaml formatter "${ocamlformatter}" exists...`);
const hasOCamlFormatter = sync(ocamlformatter);
if (hasOCamlFormatter) {
  console.log(`${ocamlformatter} exists.`);
} else {
  console.log(
    `${ocamlformatter} does not exist. Please execute \`opam install ${ocamlformatter}\` to install it on supported systems.`
  );
}

const refmt = "refmt";
console.log(`checking if Reason formatter exists...`);
const hasRefmt = sync(refmt);
if (hasRefmt) {
  console.log(`${refmt} exists.`);
} else {
  console.log(
    `${refmt} does not exist. Please execute \`opam install ${refmt}\` to install it on supported systems.`
  );
}
const formatters = {};

function registerFormatter(ext, name, args, npx = false) {
  formatters[ext] = { name, args, npx };
}

const rootDir = config.sources.dir;

const win = process.platform === "win32";

const bsc = win ? "bsc.cmd" : "bsc";

registerFormatter(".res", bsc, ["-format"]);
registerFormatter(".resi", bsc, ["-format"]);

if (hasOCamlFormatter) {
  registerFormatter(".ml", ocamlformatter, []);
  registerFormatter(".mli", ocamlformatter, []);
}

if (hasRefmt) {
  registerFormatter(".re", refmt, []);
  registerFormatter(".rei", refmt, []);
}

function format(filepath, { name, args, npx }) {
  const formatter = name;
  console.log(`formatting ${filepath} with "${formatter}"`);

  const response = npx
    ? spawn.spawnSync("npx", [formatter, ...args, filepath])
    : spawn.spawnSync(formatter, [...args, filepath]);

  if (response.error) {
    throw new Error(response.error);
  }
  const err = response.stderr.toString();
  if (err) {
    console.warn();
  }
  writeFileSync(filepath, response.stdout);
}

const registeredExt = Object.keys(formatters);
console.log(formatters);
console.log(registeredExt);

const walker = walk(".", {
  filters: [
    "node_modules",
    "lib",
    "ios/Pods",
    ".git",
    ".vscode",
    "_esy",
    "esy.lock",
    "_build",
  ],
  followLinks: false,
});

walker.on("file", (base, stats, next) => {
  const filepath = join(base, stats.name);

  let formatted = false;
  for (const ext of registeredExt) {
    if (filepath.endsWith(ext)) {
      format(filepath, formatters[ext]);
      formatted = true;
      break;
    }
  }
  if (!formatted) {
    console.log(chalk.grey`no formatters available for ${filepath}`);
  }
  next();
});
