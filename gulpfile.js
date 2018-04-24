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

    generatedConfiguration.module.rules.push({
      test: require.resolve('monaco-editor/esm/vs/editor/common/services/editorSimpleWorker'),
      use: [{
        loader: 'babel-loader',
        options: {
          plugins: [
            replaceSelfRequireWithGlobalRequire()
          ]
        }
      }],
    });

    generatedConfiguration.plugins.push(new webpack.ContextReplacementPlugin(
      new RegExp('^' + path.dirname(require.resolve('monaco-editor/esm/vs/editor/common/services/editorSimpleWorker')) + '$'),
      ''
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
