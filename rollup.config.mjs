// const typescript = require("@rollup/plugin-typescript")
// const nodeResolve = require("@rollup/plugin-node-resolve").nodeResolve

import typescript from "@rollup/plugin-typescript"
import { nodeResolve } from "@rollup/plugin-node-resolve"

export default {
  input: "src/index.ts", // Entry point of your application
  output: {
    file: "dist/bundle.js", // Output bundle file
    format: "iife", // Immediately Invoked Function Expression
    name: "Pathman", // Global variable for iife format
    sourcemap: true, // Generate source maps
  },
  plugins: [
    nodeResolve(), // Resolves node modules
    typescript(), // Compile TypeScript files
  ],
}
