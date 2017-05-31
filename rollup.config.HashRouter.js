import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  entry: 'src/HashRouter.js',
  plugins: [
    resolve(),
    commonjs(),
    babel({ exclude: 'node_modules/**' })
  ],
  format: 'umd',
  moduleName: 'HashRouter',
  dest: 'HashRouter.js'
}
