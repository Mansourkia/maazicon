/**
 * Saves settings.
 *
 * @param {object} args {
 *     @var {string} admin_ajax_url
 *     @var {string} nonce
 *     @var {object} notice {
 *         @var {string} wait
 *         @var {string} success
 *         @var {string} error
 *     }
 * }
 */
function maazicon_save_settings( args ) {
	let $ = jQuery;

	let wait_notice = maazicon_notice( 'info', args.notice.wait, 1 );
	$('#maazicon_submit_button').attr('disabled', 'disabled');

	let data = {
		action                : 'maazicon_save_settings',
		maazicon_render_method: document.getElementById('maazicon_render_method').value,
		_maazicon_nonce       : args.nonce,
	};

	$.post(
		args.admin_ajax_url,
		data,
		function ( response ) {
			maazicon_remove_notice( wait_notice );
			$('#maazicon_submit_button').removeAttr('disabled');

			if ( response.success ) {
				maazicon_notice( 'success', args.notice.success, 1 );
			} else {
				maazicon_notice( 'error', args.notice.error, 1 );
			}
		}
	);
}
