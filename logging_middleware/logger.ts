type Stack = "backend" | "frontend";
type Level = "debug" | "info" | "warn" | "error" | "fatal";
type FrontendPackage =
  | "api"
  | "component"
  | "hook"
  | "page"
  | "state"
  | "style"
  | "auth"
  | "config"
  | "middleware"
  | "utils";
type BackendPackage =
  | "cache"
  | "controller"
  | "cron_job"
  | "db"
  | "domain"
  | "handler"
  | "repository"
  | "route"
  | "service"
  | "auth"
  | "config"
  | "middleware"
  | "utils";

type PackageName = FrontendPackage | BackendPackage;

const validStacks = ["backend", "frontend"];
const validLevels = ["debug", "info", "warn", "error", "fatal"];
const frontendPackages = [
  "api",
  "component",
  "hook",
  "page",
  "state",
  "style",
  "auth",
  "config",
  "middleware",
  "utils",
];
const backendPackages = [
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
  "handler",
  "repository",
  "route",
  "service",
  "auth",
  "config",
  "middleware",
  "utils",
];

function getEnvValue(key: string): string {
  const env = import.meta.env as Record<string, string | undefined>;
  return env[key] ?? "";
}

function isValidLogInput(stack: string, level: string, packageName: string): boolean {
  if (!validStacks.includes(stack) || !validLevels.includes(level)) {
    return false;
  }

  if (stack === "frontend") {
    return frontendPackages.includes(packageName);
  }

  return backendPackages.includes(packageName);
}

export async function Log(
  stack: Stack,
  level: Level,
  packageName: PackageName,
  message: string
) {
  if (!isValidLogInput(stack, level, packageName)) {
    return null;
  }

  try {
    const logApiUrl =
      getEnvValue("VITE_LOG_API_URL") ||
      getEnvValue("LOG_API_URL") ||
      "/evaluation-service/logs";
    const accessToken = getEnvValue("VITE_ACCESS_TOKEN");

    const response = await fetch(logApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        stack,
        level,
        package: packageName,
        message,
      }),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}
