const create_style_files = require('./functions/_style').create_style_files;
const create_fetch_files = require('./functions/_fetch').create_fetch_files;
const create_library_files = require('./functions/_library').create_library_files;
const Source_Modifier = require('./classes/class-source-modifier').Source_Modifier;
const ora = require('ora').default;
const fs = require('fs').promises;

// dictionary
let dic_promise = new Promise(
	function( dic_resolve, dic_reject) {
		(async function() {
			let spinner = new ora();
			spinner.start('create dictionary');

			try {
				let dictionary = {};
				let css = await fs.readFile( 'libs/web-icons-master/css/web-icons.css', 'utf8' );
				let match = null;
				let reg = /\.wb\-([a-z0-9\-]+).*?\{\n\s*content\:\s\"\\([a-zA-Z0-9]*)\"\;\n\s*\}/gi;
		
				spinner.text = 'parse css file';

				let spn_all = css.match(reg).length;
				let spn_i   = 0;
		
				while ( (match = (reg).exec( css ) ) != null ) {
					css = css.replace(match[0], '');
					dictionary[match[1]] = parseInt( match[2], 16 );
					
					spinner.text = `parse css file ( ${spn_i++} / ${spn_all} )` ;
				}

				await fs.writeFile('output/webicons/dictionary.min.json', JSON.stringify(dictionary));
				await fs.writeFile('output/webicons/dictionary.json', JSON.stringify(dictionary, null, 2));

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
	function() {
		// styles
		create_style_files({
			fonts: ['web-icons.eot', 'web-icons.woff2', 'web-icons.woff', 'web-icons.ttf', 'web-icons.svg'],
			font_family: 'Web_Icons',
			class_prefix: 'webicons-',
			json_file: 'output/webicons/dictionary.min.json',
			output_directory: '../assets/webicons/',
		});

		// fetch
		create_fetch_files({
			dictionary_file: 'output/webicons/dictionary.min.json',
			output_directory: '../assets/webicons/',
		});

		// library
		create_library_files({
			dictionary_file: 'output/webicons/dictionary.min.json',
			icons_directory: 'libs/web-icons-master/src/svg/',
			output_directory: '../assets/webicons/',
			modifier: new Source_Modifier( {
				default_attrs: {
					'viewBox': '0 0 16 16',
					'xmlns': 'http://www.w3.org/2000/svg',
					'width': '16',
					'height': '16',
					'fill': 'currentColor',
				},
				attrs: {},
				nodes: [ /path/gi ],
				callback: null,
			} ),
			icon_file_path_callback: null,
		});
	},
	function (error) {
		console.log(error);
	}
);
