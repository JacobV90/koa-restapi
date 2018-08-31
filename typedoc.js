module.exports = {
    out: './docs',
    readme: 'none',
    includes: './src',
    exclude: [
        '**/*.spec.ts',
    ],
    mode: 'file',
    excludeExternals: true,
    excludeNotExported: true,
    excludePrivate: true,
    ignoreCompilerErrors: true,
    includeDeclarations: true,
    name: "Ninsho",
    hideGenerator: true,
};
