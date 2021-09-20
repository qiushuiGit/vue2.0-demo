import babel from '@rollup/plugin-babel';
import serve from 'rollup-plugin-serve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: './src/core/index.js',
    output: {
        format: 'umd',
        name: 'Vue',
        file: 'dist/umd/vue.js',
        sourcemap: true
    },
    plugins: [
        babel({
            exclude: 'node_modules/**', // 排除 node_modules 下的文件
            // https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers
            babelHelpers: 'bundled' // 点击链接，可查看此选项详细配置信息
        }),
        serve({
            open: true,
            port: 8080,
            contentBase: '',
            openPage: '/index.html'
        }),
        commonjs()
    ]
}