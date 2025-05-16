/**
 * Creates style.css.
 *
 * @param {object} config {
 *     @var {array}       fonts
 *     @var {string}      font_family
 *     @var {classPrefix} class_prefix
 *     @var {string}      json_file        Charcode json file path.
 *     @var {string}      output_directory Output directory path.
 * }
 *
 * @return {void}
 */
let create_style_files = function( config ) {
	const minify = require('csso').minify;
	const fs     = require('fs');
	const path   = require('path');
	const ora    = require('ora').default;

	let spiner = new ora('');
	let urls   = [];
	let css    = '/*! this file is auto-generated */\n';

	spiner.start('reading ' + config.json );

	for (let i = 0; i < config.fonts.length; i++) {
		let font   = config.fonts[i];
		let format = font.match(/\.[a-z0-9]+$/i)[0];

		if (format == '.ttf') {
			format = 'truetype';
		} else if ( format == '.eot' ) {
			format = 'embedded-opentype';
		} else {
			format = format.substring(1);
		}

		urls.push(`url("fonts/${ font }") format('${ format }')`);
	}

	css += `@font-face {\n`;
	css += `\tfont-family: "maazicon_${ config.font_family }";\n`;
	css += `\tfont-weight: normal;\n`;
	css += `\tfont-style: normal;\n`;
	css += `\tsrc: ${ urls.join(', ') };\n`;
	css += `}\n`;

	css += `[class^="maazicon-${ config.class_prefix }"]::before,\n`
	css += `[class*="maazicon-${ config.class_prefix }"]::before {\n`;
	css += `\tfont-family: "maazicon_${ config.font_family }" !important;\n`;
	css += `\tfont-style: normal !important;\n`;
	css += `\tfont-weight: normal !important;\n`;
	css += `\tfont-variant: normal !important;\n`;
	css += `\tdisplay: inline-block !important;\n`;
	css += `\ttext-transform: none !important;\n`;
	css += `\tline-height: 1;\n`;
	css += `\tspeak: none;\n`;
	css += `\t-webkit-font-smoothing: antialiased;\n`;
	css += `\t-moz-osx-font-smoothing: grayscale;\n`;
	css += `}\n`;

	fs.readFile(config.json_file, function(err, str){
		if (err) {
			spiner.fail('failed openning json file', err);
		}

		let json = JSON.parse(str);

		for (let key in json) {
			css += `.maazicon-${ config.class_prefix }${ key }::before {\n`;
			css += `\tcontent: "\\${ (Number(json[key])).toString(16) }";\n`;
			css += `}\n`;
		}

		css_min = minify(css).css;

		spiner.text = 'writing style.css';

		fs.writeFile(path.join(config.output_directory, 'style.css'), css, function(err, data){
			if (err) {
				spiner.fail('failed writing style.css', err);
			}

			spiner.text = 'writing style.min.css';

			fs.writeFile(path.join(config.output_directory, 'style.min.css'), css_min, function(err, data){
				if (err) {
					spiner.fail('failed writing files', err);
				} else {
					spiner.succeed('styles have been craeted');
				}
			});
		});
	});
}

module.exports = { create_style_files }
