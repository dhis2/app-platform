import path from "path";
import outputManifest from "rollup-plugin-output-manifest";

export default ({ name, dir, mode, baseScriptDir }) =>
  outputManifest({
    fileName: path.resolve(
      baseScriptDir,
      mode === "production" ? "import-map.json" : `import-map.${mode}.json`
    ),
    isMerge: true,
    nameSuffix: "",
    generate: (keyValueDecorator, seed) => (chunks) => ({
      ...seed,
      imports: [chunks[0]].reduce(
        (imports, { isEntry, fileName }) => ({
          ...imports,
          ...(isEntry
            ? keyValueDecorator(
                name,
                "./" + path.relative(baseScriptDir, path.join(dir, fileName))
              )
            : {}),
        }),
        seed.imports
      ),
      // TODO: add integrity section
    }),
  });
