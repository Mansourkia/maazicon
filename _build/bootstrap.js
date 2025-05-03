const fs = require('fs').promises;
// const { futimes } = require('fs');
const path = require('path');
const ora = require('ora').default;
const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const style = require('./_style').style;

/**
 * Modifies icon source.
 *
 * @param {string} source
 * @return {string}
 */
function modify( source ) {
	let dom = new JSDOM(source);
	let document = dom.window.document;
	let svg = document.querySelector('svg');

	if (!svg) {
		console.log('error parsing svg', source);
		return false;
	}

	let attributesToRemove = Array.from(svg.attributes);
	let childrenToRmove = Array.from(svg.childNodes);

	for (let attr of attributesToRemove) {
		if (attr.name !== 'fill' && attr.name !== 'xmlns' && !attr.name.match(/viewbox/i)) {
			svg.removeAttribute(attr.name);
		}
	}

	for (let child of childrenToRmove) {
		if (!child.nodeName.match(/path/i)) {
			child.remove();
		}
	}

	return svg.outerHTML;
}

// create library.json and fetch.json
(async function() {
    try {
        let library = {};
        let fetch = {icons: []};
        let files = await fs.readdir('libs/bi/icons/');
        let spinner = new ora();

		// spiner
		let proggress = 0;
		let length = Object.keys(files).length;

		// spiner start
        spinner.text = 'Reading files ...';
        spinner.start();

        for (const file_path of files) {
            let source = await fs.readFile(path.join('libs/bi/icons/', file_path), 'utf8');
            let slug = file_path.replace(/\.svg$/gi, '');

			// modify source
			source = modify(source);

            library[slug] = source;
            fetch.icons.push(slug);

			// ora update
			proggress++;
			spinner.text = `parsing ${proggress}/${length}`;
        }

		// writing file library.json
        await fs.writeFile('outputs/bi/library.json', JSON.stringify(library /*, null, 2*/));
        await fs.writeFile('outputs/bi/fetch.json', JSON.stringify(fetch /*, null, 2*/));
        spinner.succeed('Files have been read and written successfully!');
    } catch (err) {
        console.error('Error:', err);
        spinner.fail('Failed to read files.');
    }
})();

// style.css
style({
	fonts: ['bootstrap-icons.woff2', 'bootstrap-icons.woff'],
	fontFamily: 'bootstrap',
	classPrefix: 'bi',
	json: 'libs/bi/font/bootstrap-icons.json',
	output: 'outputs/bi/',
});
