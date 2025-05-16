/**
 * Creates library files.
 *
 * Library file is a json file containing icons slug => icons svg source.
 *
 * @since 1.0.1
 *
 * @param {object} args {
 *     @var {string}          dictionary_file
 *     @var {string}          icons_directory
 *     @var {string}          output_directory
 *     @var {Source_Modifier} modifier
 *     @var {function}        icon_file_path_callback
 * }
 */
async function create_library_files( args ) {
	const fs = require('fs').promises;
	const path = require('path');
	const ora = require('ora').default;

	// spiner
	let spiner = new ora('');
	spiner.start('create library files')

	try {
		let library = {};

		// spiner
		spiner.text = 'reading dictionary file';

		// read dictionary
		let dictionary_contents = await fs.readFile( args.dictionary_file );

		// spiner
		spiner.text = 'parsing dictionary';

		// parse dictionary
		let dictionary = JSON.parse( dictionary_contents );

		// spiner
		let spn_i = 0;
		let spn_all = Object.keys(dictionary).length;
		spiner.text = `reading svg files`;

		for (let slug in dictionary ) {
			let icon_file_path = path.join( args.icons_directory, slug + '.svg' );

			// filter icon file path
			if ( args.icon_file_path_callback ) {
				icon_file_path = args.icon_file_path_callback( args, slug, icon_file_path );
			}

			// get icon source
			let icon_source = await fs.readFile( icon_file_path, 'utf8' );

			// modify the icon
			if ( args.modifier ) {
				icon_source = args.modifier.modify( icon_source );
			}

			library[slug] = icon_source;

			spiner.text = `reading svg files: ${spn_i++}/${spn_all}`;
		}

		spiner.text = `write library files`;

		// write files
		await fs.writeFile( path.join( args.output_directory, 'library.min.json' ), JSON.stringify( library ) );
		await fs.writeFile( path.join( args.output_directory, 'library.json' ), JSON.stringify( library, null, 1 ) );

		spiner.succeed( `library files created at "${ args.output_directory }"` );
	} catch ( error ) {
		spiner.fail( 'Error: ' + error );
	}
}

module.exports = { create_library_files };
