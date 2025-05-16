const create_style_files = require('./functions/_style').create_style_files;
const create_fetch_files = require('./functions/_fetch').create_fetch_files;
const create_library_files = require('./functions/_library').create_library_files;
const Source_Modifier = require('./classes/class-source-modifier').Source_Modifier;

// on this document
const ora = require('ora').default;
const fs = require('fs').promises;

// dictionary
let dic_promise = new Promise(function(dic_resolve, dic_reject){
	(async function () {
		let spiner = new ora('');
		spiner.start('create bootstrap dictionary');
	
		try {
			spiner.text = 'read file "libs/bi/font/bootstrap-icons.json"';
			
			let content = await fs.readFile( 'libs/bi/font/bootstrap-icons.json', 'utf8' );
	
			let dictionary = JSON.parse( content );
	
			spiner.text = 'create dictionary files';
	
			await fs.writeFile( 'output/bi/dictionary.min.json', JSON.stringify( dictionary ) );
			await fs.writeFile( 'output/bi/dictionary.json', JSON.stringify( dictionary, null, 1 ) );
	
			spiner.succeed('dictionary files created');

			dic_resolve();
		} catch ( error ) {
			spiner.succeed( 'Error: ' + error );
			dic_reject();
		}
	})();
});

dic_promise.then(
	function() {
		// styles
		create_style_files({
			fonts: ['bootstrap-icons.woff2', 'bootstrap-icons.woff'],
			font_family: 'Bootstrap',
			class_prefix: 'bi-',
			json_file: 'output/bi/dictionary.min.json',
			output_directory: '../assets/bi/',
		});

		// fetch
		create_fetch_files({
			dictionary_file: 'output/bi/dictionary.min.json',
			output_directory: '../assets/bi/',
		});

		// library
		create_library_files({
			dictionary_file: 'output/bi/dictionary.min.json',
			icons_directory: 'libs/bi/icons/',
			output_directory: '../assets/bi/',
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
			} ),
			icon_file_path_callback: null,
		});
	},
	function (error) {
		console.log(error);
	}
);
