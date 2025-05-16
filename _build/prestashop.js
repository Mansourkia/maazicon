/**
 * 1. create dictionary
 * 2. parse svg font file and craete svg icon files
 * 3. create styles, fetch and library
 */

const create_style_files = require('./functions/_style').create_style_files;
const create_fetch_files = require('./functions/_fetch').create_fetch_files;
const create_library_files = require('./functions/_library').create_library_files;
const Source_Modifier = require('./classes/class-source-modifier').Source_Modifier;
const ora = require('ora').default;
const fs = require('fs').promises;
const jsdom = require('jsdom');
const {JSDOM} = jsdom;

// dictionary
let dic_promise = new Promise(
	function( dic_resolve, dic_reject) {
		(async function() {
			let spinner = new ora();
			spinner.start('create dictionary');

			try {
				let dictionary = {};
				let css = await fs.readFile( 'libs/prestashop-icon-font-master/ps-icon-pack.css', 'utf8' );
				let match = null;
				let reg = /\.ps\-icon\-([a-z0-9\-]+).*?\{\n\s*content\:\s\"([a-zA-Z0-9]*)\"\;\n\s*\}/gi;

				spinner.text = 'parse css file';

				// spiner
				let spn_all = css.match(reg).length;
				let spn_i   = 0;
		
				while ( (match = (reg).exec( css ) ) != null ) {
					css = css.replace(match[0], '');
					dictionary[match[1]] = match[2].charCodeAt();

					spinner.text = `parse css file ( ${spn_i++} / ${spn_all} )` ;
				}

				await fs.writeFile('output/prestashop/dictionary.min.json', JSON.stringify(dictionary));
				await fs.writeFile('output/prestashop/dictionary.json', JSON.stringify(dictionary, null, 2));
		
				spinner.succeed('dictionaries are created');

				dic_resolve();
			} catch (err) {
				spinner.fail('Error: ' + err);

				dic_reject();
			}
		})();
	}
);

dic_promise.then(
	function(){
		// icons
		let icons_promise = new Promise(
			function( icons_resolve, icons_reject ) {
				(async function () {
					let spiner = new ora('');
					spiner.start('create svg files');
					
					try {
						spiner.text = 'read svg font file and dictionary';
						
						let svg_font_content   = await fs.readFile('libs/prestashop-icon-font-master/fonts/prestashop-icon-font.svg', 'utf8');
						let dictionary_content = await fs.readFile('output/prestashop/dictionary.json', 'utf8');
						
						spiner.text = 'parse svg font file and dictionary';
						
						let dom = new JSDOM(svg_font_content);
						let doc = dom.window.document;
						let glyphs = doc.querySelectorAll('glyph');
						let dictionary = JSON.parse(dictionary_content);

						spiner.text = 'parse data';
						spn_all = Object.keys(dictionary).length;
						
						for (let i = 0; i < glyphs.length; i++) {
							let glyph = glyphs[i];
							
							let unicode_attr_value = glyph.getAttribute('unicode');

							// HTML entities are characters
							let unicode = unicode_attr_value.charCodeAt();

							for (let key in dictionary) {
								if (dictionary[key] == unicode) {
									let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"><path fill="currentColor" d="${ glyph.getAttribute('d') }" ></path></svg>`;
									await fs.writeFile('output/prestashop/icons/' + key + '.svg', svg );

									spiner.text = `create svg files: ${i}/${spn_all}`;
								}
							}
						}
						
						spiner.succeed(`svg files created`);

						icons_resolve();
					} catch (error) {
						spiner.fail('Error: ' + error);
						icons_reject();
					}
				})();
			}
		);

		icons_promise.then(
			function() {
				// styles
				create_style_files({
					fonts: ['prestashop-icon-font.eot', 'prestashop-icon-font.woff', 'prestashop-icon-font.ttf', 'prestashop-icon-font.svg'],
					font_family: 'Prestashop',
					class_prefix: 'prestashop-',
					json_file: 'output/prestashop/dictionary.min.json',
					output_directory: '../assets/prestashop/',
				});
		
				// fetch
				create_fetch_files({
					dictionary_file: 'output/prestashop/dictionary.min.json',
					output_directory: '../assets/prestashop/',
				});
		
				// library
				create_library_files({
					dictionary_file: 'output/prestashop/dictionary.min.json',
					icons_directory: 'output/prestashop/icons/',
					output_directory: '../assets/prestashop/',
					modifier: new Source_Modifier( {
						default_attrs: {
							'viewBox': '0 0 512 512',
							'xmlns': 'http://www.w3.org/2000/svg',
							'width': '16',
							'height': '16',
							'fill': 'currentColor',
						},
						attrs: {},
						nodes: [ /path/gi ],
						callback: function(svg) {
							let pathes = svg.querySelectorAll('path');

							for (let i = 0; i < pathes.length; i++) {
								let path = pathes[i];

								path.setAttribute('style', 'transform: rotateX(180deg); transform-origin: center;');
							}
						},
					} ),
					icon_file_path_callback: null,
				});
			},
			function(error) {
				console.log(error)
			}
		);
	}
);
