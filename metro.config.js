const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Some packages (e.g. zustand) publish a package.json "exports" field with an
// "import" condition pointing at a raw ESM (.mjs) build that uses import.meta.
// Metro's web bundler does not transform import.meta in dependencies, which
// causes "Cannot use 'import.meta' outside a module" at runtime. Removing
// "import" from the resolved condition names forces Metro to fall back to the
// "module"/"default" condition (a CommonJS build) instead, which is safe.
config.resolver.unstable_conditionNames = ['require', 'react-native', 'browser'];

module.exports = config;