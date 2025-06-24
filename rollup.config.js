const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel');
const terser = require('@rollup/plugin-terser');
const peerDepsExternal = require('rollup-plugin-peer-deps-external');
const postcss = require('rollup-plugin-postcss');

module.exports = {
  input: 'src/lib/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: false
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      exports: 'named',
      sourcemap: false
    }
  ],
  plugins: [
    peerDepsExternal(),
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    babel({
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-env', { modules: false }],
        ['@babel/preset-react', { runtime: 'automatic' }]
      ],
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx']
    }),
    commonjs(),
    postcss({
      extract: true,
      minimize: true,
      use: ['sass']
    }),
    terser()
  ],
  external: [
    'react',
    'react-dom',
    '@emotion/react',
    '@emotion/styled',
    '@mui/material',
    '@mui/icons-material',
    '@mui/lab'
  ]
}; 