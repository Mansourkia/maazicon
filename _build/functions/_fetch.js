/**
 * Creates fetch files.
 *
 * Fetch file is a json file that introduces icons to elementor.
 *
 * @since 1.0.1
 *
 * @param {object} args {
 *     @var {string} dictionary_file
 *     @var {string} output_directory
 * }
 */
async function create_fetch_files(args) {
	const fs = require('fs').promises;
	const path = require('path');
	const ora = require('ora').default;

	let spiner = new ora('');

	spiner.start('create fetch files');
	
	try {
		let fetch = {icons: []};

		spiner.text = 'read dictionary';
		
		// read dictionary
		let dictionary_contents = await fs.readFile( args.dictionary_file );
		
		spiner.text = 'parse dictionary';
		
		// parse dictionary
		let dictionary = JSON.parse( dictionary_contents );

		for (let slug in dictionary ) {
			fetch.icons.push( slug );
		}

		spiner.text = 'write dictionary files';

		// write files
		await fs.writeFile( path.join( args.output_directory, 'fetch.min.json' ), JSON.stringify( fetch ) );
		await fs.writeFile( path.join( args.output_directory, 'fetch.json' ), JSON.stringify( fetch, null, 1 ) );

		spiner.succeed( `fetch files created at "${ args.output_directory }"` );
	} catch ( error ) {
		spiner.fail( `filed craeting fetch files: ${ error }` );
	}
}

module.exports = { create_fetch_files };
