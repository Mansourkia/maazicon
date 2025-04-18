/**
 * Creates fetch.json.
 * 
 * Elementor reads fetch.json file to load icons with icon font.
 *
 * @param {object} config {
 *     @var {string} json
 *     @var {string} output
 * }
 */
let fetch = function(config) {
	let fs   = require('fs');
	let path = require('path');
	let ora  = require('ora').default;
	let spiner = new ora('');

	spiner.start();

	spiner.text = 'reading the json file...';

	fs.readFile(config.json, function(err, str){
		let json  = JSON.parse(str);
		let fetch = {
			icons: [],
		};
		
		for (let key in json) {
			fetch.icons.push(key);
		}

		spiner.text = 'parsing the json file...';

		fs.writeFile( path.join(config.output, 'fetch.json'), JSON.stringify(fetch), function(err){
			if (err) {
				spiner.fail('error writing fetch.json', err);
			} else {
				spiner.succeed('fetch.json has been craeted');
			}
		})
	});
}

module.exports = {
	fetch,
}
