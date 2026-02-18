import { existsSync } from "node:fs";
import { rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;

let deleted = 0;
let modified = 0;
let skipped = 0;

async function deleteTarget(relPath: string) {
    const abs = resolve(root, relPath);
    if (!existsSync(abs)) {
        console.log(`  ${dim("skip")}  ${dim(relPath)} ${dim("(not found)")}`);
        skipped++;
        return;
    }
    await rm(abs, { recursive: true, force: true });
    console.log(`  ${red("del ")}  ${relPath}`);
    deleted++;
}

async function writeTarget(relPath: string, content: string) {
    const abs = resolve(root, relPath);
    await writeFile(abs, content, "utf-8");
    console.log(`  ${green("mod ")}  ${relPath}`);
    modified++;
}

// ─── Files & directories to delete ───────────────────────────────────────────

const toDelete = [
    "src/features/todo/procedures/list.ts",
    "src/features/todo/procedures/index.ts",
    "src/features/todo/contracts.ts",
    "src/features/todo/collections.ts",
    "src/features/todo", // removes the now-empty directory tree
    "scripts",
    "README.md",
];

// ─── Cleaned router ───────────────────────────────────────────────────────────

const ROUTER_CONTENT = `export const router = {};

export type AppRouter = typeof router;
`;

// ─────────────────────────────────────────────────────────────────────────────

console.log();
console.log(`${bold("clean-boilerplate")}  removing todo example code\n`);

for (const p of toDelete) {
    await deleteTarget(p);
}

await writeTarget("src/server/rpc/index.ts", ROUTER_CONTENT);

console.log();
console.log(
    `done  ${red(`${deleted} deleted`)}  ${green(`${modified} modified`)}  ${dim(`${skipped} skipped`)}`,
);
console.log();
