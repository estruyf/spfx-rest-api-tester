'use strict';

const gulp = require('gulp');
const build = require('@microsoft/sp-build-web');
const webpack = require('webpack');
const path = require('path');
// const CopyWebpackPlugin = require('copy-webpack-plugin');
// const MonacoWebpackPlugin = require('monaco-editor/webpack');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

build.configureWebpack.mergeConfig({
  additionalConfiguration: (generatedConfiguration) => {
    // https://github.com/Microsoft/monaco-editor-samples/blob/master/browser-esm-webpack/webpack.config.js

    /**
     * Working start
     */
    // generatedConfiguration.entry["editor.worker"] = "./node_modules/monaco-editor/esm/vs/editor/editor.worker.js";
    // generatedConfiguration.entry["json.worker"] = "./node_modules/monaco-editor/esm/vs/language/json/json.worker";
    // generatedConfiguration.entry["ts.worker"] = "./node_modules/monaco-editor/esm/vs/language/typescript/ts.worker";

    // generatedConfiguration.module.rules.push({
    //   test: require.resolve('monaco-editor/esm/vs/editor/common/services/editorSimpleWorker'),
    //   use: [
    //     {
    //       loader: 'babel-loader',
    //       options: {
    //         plugins: [
    //           replaceSelfRequireWithGlobalRequire()
    //         ]
    //       }
    //     }
    //   ],
    // });

    // generatedConfiguration.plugins.push(new webpack.IgnorePlugin(/^((fs)|(path)|(os)|(crypto)|(source-map-support))$/, /vs\/language\/typescript\/lib/));

    // generatedConfiguration.plugins.push(new webpack.ContextReplacementPlugin(
		// 	new RegExp('^' + path.dirname(require.resolve('monaco-editor/esm/vs/editor/common/services/editorSimpleWorker')) + '$'),
		// 	'',
		// 	{
		// 		'vs/language/json/jsonWorker': require.resolve('monaco-editor/esm/vs/language/json/jsonWorker'),
		// 		'vs/language/typescript/tsWorker': require.resolve('monaco-editor/esm/vs/language/typescript/tsWorker')
		// 	}
    // ));
    /**
     * Working end
     */

    // generatedConfiguration.plugins.push(new CopyWebpackPlugin([
    //     {
    //       from: 'node_modules/monaco-editor/min/vs',
    //       to: 'vs',
    //     }
    //   ])
    // );

    // generatedConfiguration.plugins.push(new MonacoWebpackPlugin(webpack));

    // generatedConfiguration.plugins.push(new webpack.ContextReplacementPlugin(/loader/, /^$/));

    return generatedConfiguration;
  }
});

build.initialize(gulp);


function replaceSelfRequireWithGlobalRequire() {
	return (babel) => {
		const { types: t } = babel;
		return {
			visitor: {
				CallExpression(path) {
					const { node } = path;
					const isSelfRequireExpression = (
						t.isMemberExpression(node.callee)
						&& t.isIdentifier(node.callee.object, { name: 'self' })
						&& t.isIdentifier(node.callee.property, { name: 'require' })
					);
					if (!isSelfRequireExpression) { return; }
					path.get('callee').replaceWith(t.identifier('require'));
				}
			}
		};
	};
}
