import pkg from "./package.json";
import babel from "@rollup/plugin-babel";
import postcss from "rollup-plugin-postcss";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
const deps = { ...pkg.dependencies };

const extensions = [".js", ".ts", ".d.ts"];

export default {
  input: "src/index.ts", // our source file
  preserveModules: true,
  output: [
    {
      dir: pkg.module,
      format: "esm",
      sourcemap: true,
      entryFileNames: "[name].js",
    },
    {
      dir: pkg.main,
      format: "cjs",
      sourcemap: true,
      entryFileNames: "[name].js",
    },
  ],
  external: Object.keys(deps),
  plugins: [
    resolve({ extensions, module: true }),
    postcss({
      // postfix with .module.css etc. for css modules (DISABLED)
      modules: {
        generateScopedName: "[name]__[local]___[hash:base64:5]",
      },
      autoModules: true,
      namedExports: true,
      // CSS cannot be extracted outside of the bundle directory for rollup v2.
      extract: "index.css",
    }),
    babel({
      extensions,
      exclude: "node_modules/**",
      babelHelpers: "bundled",
    }),
    terser(),
  ],
};
