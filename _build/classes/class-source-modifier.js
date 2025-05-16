/**
 * SVG source parser / modifier.
 *
 * @since 1.0.1
 */
class Source_Modifier {

	/**
	 * Constructor.
	 *
	 * @since 1.0.1
	 *
	 * @param {object} args {
	 *     @var {object}   default_attrs
	 *     @var {object}   attrs         Required attributes.
	 *     @var {array}    nodes         An array of RegEx objects (allowed node names).
	 *     @var {function} callback      Params: svg object, svg source.
	 * }
	 */
	constructor( args ) {
		this.fs = require( 'fs' );
		this.path = require( 'path' );
		this.jsdom = require( 'jsdom' );
		this.args = args;
	}

	/**
	 * Modifier.
	 *
	 * @since 1.0.1
	 *
	 * @param {string} svg_source
	 * @return {string}
	 */
	modify( svg_source ) {
		const {JSDOM} = this.jsdom;

		let dom = new JSDOM( svg_source );
		let doc = dom.window.document;
		let svg = doc.querySelector( 'svg' );

		if ( ! svg ) {
			return false;
		}

		this.modifyAttributes( svg );
		this.remove_nodes( svg );

		if ( this.args.callback ) {
			this.args.callback( svg, svg_source );
		}

		return svg.outerHTML;
	}

	/**
	 * Modifies SVG attributes.
	 *
	 * @since 1.0.1
	 * @param {DOMElement} svg
	 */
	modifyAttributes(svg) {
		let attrs = Array.from( svg.attributes );
		let allowed_attrs_names = Object.keys( this.args.default_attrs );
		let allowed_attrs = this.args.default_attrs;
		let required_attrs = this.args.attrs;

		// remove attrs
		for ( let attribute of attrs ) {
			if ( ! allowed_attrs_names.includes( attribute.name ) ) {
				svg.removeAttribute( attribute.name );
			}
		}

		// set default attrs
		for ( let attribute in allowed_attrs ) {
			if ( ! svg.hasAttribute( attribute ) ) {
				svg.setAttribute( attribute, allowed_attrs[attribute] );
			}
		}

		// set required attrs
		for ( let required_attribute in required_attrs ) {
			svg.setAttribute( required_attribute, required_attrs[required_attribute] );
		}
	}

	/**
	 * Removes nodes.
	 *
	 * @since 1.0.1
	 *
	 * @param {DOMElement} node
	 */
	remove_nodes(node) {
		let children = Array.from( node.childNodes );

		for ( let i = 0; i < children.length; i++ ) {
			let child = children[i];

			for ( let j = 0; j < this.args.nodes.length; j++ ) {
				if ( ! child.nodeName.match( this.args.nodes[j] ) ) {
					child.remove();
				}
			}

			if ( child.childNodes && child.childNodes.length ) {
				this.remove_nodes( child );
			}
		}
	}
}

module.exports = {Source_Modifier}
