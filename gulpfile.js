'use strict';

const gulp = require('gulp');
const build = require('@microsoft/sp-build-web');
const webpack = require('webpack');
const path = require('path');
build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

build.configureWebpack.mergeConfig({
  additionalConfiguration: (generatedConfiguration) => {
    // generatedConfiguration.entry["editor.worker"] = 'monaco-editor/esm/vs/editor/editor.worker.js';

    generatedConfiguration.plugins.push(new webpack.IgnorePlugin(/^((fs)|(path)|(os)|(crypto)|(source-map-support))$/, /vs(\/|\\)language(\/|\\)typescript(\/|\\)lib/));

    const simpleWorkerPath = 'monaco-editor/esm/vs/editor/common/services/editorSimpleWorker';

    generatedConfiguration.module.rules.push({
      test: require.resolve(simpleWorkerPath),
      use: [{
        loader: 'babel-loader',
        options: {
          plugins: [
            replaceSelfRequireWithGlobalRequire()
          ]
        }
      }],
    });

    // Create regEx which works for files on macOS and Windows
    const dirName = path.dirname(simpleWorkerPath);
    const dirRegEx = `${dirName.replace(/\//g, `[\\/\\\\]`)}$`;
    generatedConfiguration.plugins.push(new webpack.ContextReplacementPlugin(
      new RegExp(dirRegEx),
      '',
      {}
    ));

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
