// Force a fixed timezone so date/time formatter tests are deterministic
// regardless of the machine/CI running them.
process.env.TZ = "UTC";

/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  // jsdom so component tests (React Testing Library) can render into a DOM;
  // plain unit tests (services/utils) run fine under jsdom too.
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  rootDir: ".",
  moduleNameMapper: {
    "^@shared/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/dist/"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
};
