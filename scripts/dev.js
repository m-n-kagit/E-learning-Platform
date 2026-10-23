import { spawn } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const services = [
  { name: "backend", cwd: "e-learn_backend" },
  { name: "frontend", cwd: "e-learn" },
];
const children = services.map(({ name, cwd }) => {
  const child = spawn(npm, ["run", "dev"], { cwd, stdio: "inherit", shell: process.platform === "win32" });
  child.on("error", (error) => console.error(`[${name}] failed to start:`, error.message));
  child.on("exit", (code) => {
    if (code && code !== 0) console.error(`[${name}] exited with code ${code}`);
  });
  return child;
});

const stopChildren = () => {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
};

process.on("SIGINT", () => {
  stopChildren();
  process.exit(0);
});
process.on("SIGTERM", () => {
  stopChildren();
  process.exit(0);
});
