import terser from "@rollup/plugin-terser";
import resolve from "@rollup/plugin-node-resolve";

export default {
  input: "src/main.js",
  output: [
    {
      dir: "dist",
      format: "esm",
      entryFileNames: "HyperTextEditor.js",
      chunkFileNames: "[name].js",
      manualChunks: {
        "lodash-utils": ["lodash-es"],
      },
    },
    {
      file: "dist/hypertextEditor.min.js",
      format: "iife",
      name: "HypertextEditor",
      plugins: [terser()],
      extend: true,
    },
  ],
  plugins: [
    resolve(), // 使用插件
  ],
};
