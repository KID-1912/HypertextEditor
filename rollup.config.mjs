import resolve from "@rollup/plugin-node-resolve";
import { getBabelOutputPlugin } from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";

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
      plugins: [
        getBabelOutputPlugin({
          presets: [
            [
              "@babel/preset-env",
              {
                targets: "> 0.25%, not dead",
                loose: true,
              },
            ],
          ],
          plugins: [["@babel/plugin-transform-runtime", { corejs: 3 }]],
        }),
      ],
    },
    {
      file: "dist/hypertextEditor.min.js",
      format: "iife",
      name: "HypertextEditor",
      plugins: [
        getBabelOutputPlugin({
          allowAllFormats: true,
          presets: [
            [
              "@babel/preset-env",
              {
                targets: "> 0.25%, not dead",
                loose: true,
              },
            ],
          ],
        }),
        terser(),
      ],
      extend: true,
    },
  ],
  plugins: [resolve()],
};
