import fs from 'fs';
import sourcemaps from 'rollup-plugin-sourcemaps';
import {plugins} from './build/rollup_plugins';

const production = process.env.BUILD === 'production';
const outputFile = production ? 'www/mapbox-gl-cordova-offline.js' : 'www/mapbox-gl-cordova-offline-dev.js';

const config = [{
    // First, use code splitting to bundle GL JS into three "chunks":
    // - rollup/build/index.js: the main module, plus all its dependencies not shared by the worker module
    // - rollup/build/worker.js: the worker module, plus all dependencies not shared by the main module
    // - rollup/build/chunk1.js: the set of modules that are dependencies of both the main module and the worker module
    //
    // This is also where we do all of our source transformations: removing
    // flow annotations, transpiling ES6 features using buble, inlining shader
    // sources as strings, etc.
    input: ['src/index.js', 'src/worker.js'],
    output: {
        dir: 'rollup/build/mapboxgl',
        format: 'amd',
        sourcemap: 'inline',
        indent: false
    },
    experimentalCodeSplitting: true,
    treeshake: production,
    plugins: plugins()
}, {
    // Next, bundle together the three "chunks" produced in the previous pass
    // into a single, final bundle. See rollup/bundle_prelude.js and
    // rollup/mapboxgl.js for details.
    input: 'rollup/mapboxgl.js',
    output: {
        name: 'mapboxgl',
        file: outputFile,
        format: 'umd',
        sourcemap: production ? true : 'inline',
        indent: false,
        intro: fs.readFileSync(require.resolve('./rollup/bundle_prelude.js'), 'utf8')
    },
    treeshake: false,
    plugins: [
        // Ingest the sourcemaps produced in the first step of the build.
        // This is the only reason we use Rollup for this second pass
        sourcemaps()
    ],
}];

export default config