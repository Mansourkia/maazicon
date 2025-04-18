const jsdom = require("jsdom");
const { config } = require("process");
const { JSDOM } = jsdom;
const fs = require('fs').promises;
const ora = require('ora').default;
const style = require('./_build_style').style;
const fetch = require('./_build_fetch').fetch;

// global variables
let library = {};

// svg modifier
function modify_svg( svg_string ) {
	let dom = new JSDOM(svg_string);
	let document = dom.window.document;
	let svg = document.querySelector('svg');

	if (!svg) {
		console.log('error parsing svg', svg_string);
		return false;
	}

	let attributesToRemove = Array.from(svg.attributes);
	let childrenToRmove = Array.from(svg.childNodes);

	for (let attr of attributesToRemove) {
		if (attr.name !== 'xmlns' && !attr.name.match(/viewbox/i)) {
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

// library.json
(async function(){
	try {
		let data = await fs.readFile('__libs/bootstrap-icons-1.11.3/font/bootstrap-icons.json');
		let data_json = JSON.parse(data);
		let progress  = 0;
		let length    = Object.keys(data_json).length;
		let spinner   = new ora()

		spinner.start();

		for (let slug in data_json) {
			try {
				let d = await fs.readFile('__libs/bootstrap-icons-1.11.3/icons/' + slug + '.svg');
				library[slug] = modify_svg(d.toString());
				progress++;
				spinner.text = `fetching and parsing svg files... ${ progress }/${ length }`;
			} catch (err) {
				console.log('error writing library.json', err)
			}
		}

		spinner.text = 'writing the output json';
		
		await fs.writeFile( '__outputs/bi/library.json', JSON.stringify(library));
		
		spinner.succeed('library.json has been writed');
	} catch (err) {
		console.log('error writing library.json', err)
	}
})();

// style.css
style({
	fonts: ['bootstrap-icons.woff2', 'bootstrap-icons.woff'],
	fontFamily: 'bootstrap',
	classPrefix: 'bi',
	json: '__libs/bootstrap-icons-1.11.3/font/bootstrap-icons.json',
	output: '__outputs/bi/',
});

// fetch.json
fetch({
	json: '__libs/bootstrap-icons-1.11.3/font/bootstrap-icons.json',
	output: '__outputs/bi/',
});
