import { spawn } from "node:child_process";
import process from "node:process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backendDirectory = path.join(projectRoot, "backend");
const backendWrapper = process.platform === "win32" ? "mvnw.cmd" : "./mvnw";
const vehiclesUrl = "http://localhost:8080/vehicles";
const startupTimeout = 120_000;

let backendProcess;
let frontendProcess;
let stopping = false;

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function backendIsReady() {
  try {
    const response = await fetch(vehiclesUrl, { signal: AbortSignal.timeout(2000) });
    if (!response.ok) return false;
    return Array.isArray(await response.json());
  } catch {
    return false;
  }
}

function stopChild(child) {
  if (child && child.exitCode === null) child.kill();
}

function stopProcesses() {
  stopping = true;
  stopChild(frontendProcess);
  stopChild(backendProcess);
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, stopProcesses);
}

async function main() {
  if (!(await backendIsReady())) {
    if (process.platform === "win32") {
      backendProcess = spawn("cmd.exe", ["/d", "/c", "mvnw.cmd spring-boot:run"], {
        cwd: backendDirectory,
        stdio: "inherit",
      });
    } else {
      backendProcess = spawn(backendWrapper, ["spring-boot:run"], {
        cwd: backendDirectory,
        stdio: "inherit",
      });
    }

    let backendExited = false;
    backendProcess.once("error", (error) => {
      backendExited = true;
      console.error(`Could not start the backend: ${error.message}`);
    });
    backendProcess.once("exit", (code) => {
      backendExited = true;
      if (!stopping) {
        console.error(`Backend stopped unexpectedly (exit code ${code ?? "unknown"}).`);
        stopChild(frontendProcess);
        process.exitCode = code || 1;
      }
    });

    const deadline = Date.now() + startupTimeout;
    while (Date.now() < deadline) {
      if (backendExited) throw new Error("Backend exited before the vehicle API became ready.");
      if (await backendIsReady()) break;
      await delay(1000);
    }

    if (!(await backendIsReady())) {
      throw new Error("Backend did not start in time. Check the backend startup output above.");
    }
  }

  if (backendProcess?.exitCode !== null && backendProcess?.exitCode !== undefined) {
    throw new Error("Backend stopped before the frontend could start.");
  }

  console.log("Vehicle API is ready. Starting the frontend...");
  const viteEntry = path.join(projectRoot, "node_modules", "vite", "bin", "vite.js");
  frontendProcess = spawn(process.execPath, [viteEntry, ...process.argv.slice(2)], {
    cwd: projectRoot,
    stdio: "inherit",
  });

  const frontendExitCode = await new Promise((resolve, reject) => {
    frontendProcess.once("error", reject);
    frontendProcess.once("close", resolve);
  });
  if (!stopping) process.exitCode = frontendExitCode || 0;
}

try {
  await main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  stopProcesses();
}
