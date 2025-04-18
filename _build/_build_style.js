/**
 * Creates style.css.
 *
 * @param {object} config {
 *     @var {array}       fonts
 *     @var {string}      fontFamily
 *     @var {classPrefix} classPrefix
 *     @var {string}      json        The path to the charcode file.
 *     @var {string}      output      The path to the output directory.
 * }
 *
 * @return {void}
 */
let style = function(config) {
	const minify = require('csso').minify;
	const fs     = require('fs');
	const path   = require('path');
	const ora    = require('ora').default;
	let spiner   = new ora('');

	spiner.start('reading ' + config.json );

	let urls = [];

	for (let i = 0; i < config.fonts.length; i++) {
		let font   = config.fonts[i];
		let format = font.match(/\.[a-z0-9]+$/i)[0];

		if (format == '.ttf') {
			format = 'truetype';
		} else {
			format = format.substring(1);
		}

		urls.push(`url("${ font }") format('${ format }')`);
	}

	let css = `
		@font-face {
			font-family: "maazicon_${ config.fontFamily }";
			font-weight: normal;
			font-style: normal;
			src: ${ urls.join(', ') };
		}

		[class^="maazicon-${ config.classPrefix }"]::before,
		[class*="maazicon-${ config.classPrefix }"]::before {
			font-family: "maazicon_${ config.fontFamily }" !important;
			font-style: normal !important;
			font-weight: normal !important;
			font-variant: normal !important;
			display: inline-block !important;
			text-transform: none !important;
			line-height: 1;
			speak: none;
			-webkit-font-smoothing: antialiased;
			-moz-osx-font-smoothing: grayscale;
		}
	`;

	fs.readFile(config.json, function(err, str){
		if (err) {
			spiner.fail('failed openning json file', err);
		}

		let json = JSON.parse(str);

		for (let key in json) {
			css += `
				.maazicon-${ config.classPrefix }-${ key }::before {
					content: "\\${ (Number(json[key])).toString(16) }";
				}
			`;
		}

		css = minify(css).css;

		spiner.text = 'writing style.css';

		fs.writeFile(path.join(config.output, 'style.css'), css, function(err, data){
			if (err) {
				spiner.fail('failed writing style.css', err);
			} else {
				spiner.succeed('style.css has been craeted');
			}
		});
	});
}

module.exports = {
	style,
}

// module.exports = {
// 	style: style,
// }
