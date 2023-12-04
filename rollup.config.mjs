import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

const targets = 'node 18';
const extensions = ['.ts', '.js'];

export default {
  input: {
    index: './src/index.ts',
    defaults: './src/defaults.ts',
  },
  output: {
    // file: 'dist/index.js',
    dir: './dist',
    format: 'cjs',
  },
  plugins: [
    replace({
      'process.env.PACKAGE_NAME': JSON.stringify(pkg.name),
      'process.env.PACKAGE_VERSION': JSON.stringify(pkg.version),
      preventAssignment: true,
    }),
    nodeResolve({ extensions }),
    babel({
      babelrc: false,
      configFile: false,
      targets,
      extensions,
      babelHelpers: 'bundled',
      presets: [['@babel/preset-env', { targets }], '@babel/preset-typescript'],
    }),
  ],
};
