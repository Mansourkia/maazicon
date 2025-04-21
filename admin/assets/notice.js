/**
 * Adds a new notice.
 *
 * @param {string}  type
 * @param {string}  txt
 * @param {boolean} clear
 * @param {number} dur
 */
function maazicon_notice( type, txt, clear = false, dur = 0 ) {
	let $ = jQuery;

	// clear notices
	clear && $('.maazicon-notice').remove();

	if ( txt ) {
		let notice = $( `<div class="notice notice-${ type } maazicon-notice">` ).html(txt);
		$('#maazicon-settings form').before( notice );

		if ( Number( dur ) ) {
			setTimeout( function() {
				$( notice ).remove();
			}, Number( dur ) );
		}

		return notice;
	}
}

/**
 * Removes an existing notice.
 *
 * @param {HTMLElement} notice 
 */
function maazicon_remove_notice( notice ) {
	jQuery( notice ).remove();
}
