<?php
/**
 * Maazicon Admin Class.
 *
 * @package Maazicon
 * @since 1.0.0
 */

if ( ! class_exists( 'Maazicon_Admin' ) ):
	/**
	 * Admin.
	 *
	 * @since 1.0.0
	 */
	class Maazicon_Admin {

		/**
		 * Constructor.
		 *
		 * @since 1.0.0
		 */
		public function __construct() {
			add_action( 'admin_menu', array( $this, 'register_menu' ) );
			add_action( 'wp_ajax_maazicon_save_settings', array( $this, 'ajax' ) );
		}

		/**
		 * Registers menu page.
		 *
		 * @since 1.0.0
		 */
		public function register_menu() {
			$hook = add_submenu_page(
				'options-general.php',
				__( "Maazicon", 'maazicon' ),
				__( "Maazicon", 'maazicon' ),
				'manage_options',
				'maazicon',
				array( $this, 'menu_page' ),
			);

			// add_action( "load-$hook", array( $this, 'load' ) );
		}

		/**
		 * Renders menu page contents.
		 *
		 * @since 1.0.0
		 */
		public function menu_page() {
			?>
			<div class="wrap">
				<h1><?php echo esc_html( __( "Maazicon", 'maazicon' ) ); ?></h1>

				<p><?php echo esc_html( __( "Additional icons for Elementor", 'maazicon' ) ); ?></p>
	
				<?php if ( ! defined( 'ELEMENTOR_VERSION' ) ): ?>
					<p class="notice notice-error"><?php printf( __( "Please install %s", 'maazicon' ), '<a href="https://wordpress.org/plugins/elementor/">' . __( 'Elementor' ) . '</a>' ); ?></p>
				<?php endif; ?>

				<br />

				<section class="maazicon-settings" id="maazicon-settings">
					<h2><?php echo esc_html( __( 'Settings' ) ); ?></h2>

					<form>
						<div class="form-field">
							<label for="maazicon_render_method"><?php echo esc_html( __( "Render Method", 'maazicon' ) ); ?></label>

							<select name="maazicon_render_method" id="maazicon_render_method">
								<option <?php if ( get_option( 'maazicon_render_method', 'svg' ) === 'svg' ) { echo 'selected'; } ?> value="svg">SVG (<?php echo esc_html( __( "Recommended", 'maazicon' ) ); ?>)</option>
								<option <?php if ( get_option( 'maazicon_render_method', 'svg' ) === 'i' ) { echo 'selected'; } ?> value="i">CSS Font</option>
							</select>

							<div class="description">
								<?php echo esc_html( __( "If yout theme does not display the icons correctly, change this option", 'maazicon' ) ); ?>
							</div>
						</div>

						<br />

						<div class="form-field form-submit-field">
							<button type="button" class="button button-primary" onclick="maazicon_save_settings();" id="maazicon_submit_button">
								<?php echo esc_html( __( 'Save Settings', 'maazicon' ) ); ?>
							</button>
						</div>
					</form>
				</section>
			</div>

			<script>
				function maazicon_save_settings() {
					let $ = jQuery;

					let wait_notice = maazicon_notice( 'info', '<?php echo esc_attr( __( 'Please wait', 'maazicon' ) ); ?>', 1 );
					$('#maazicon_submit_button').attr('disabled', 'disabled');

					let data = {
						action                : 'maazicon_save_settings',
						maazicon_render_method: document.getElementById('maazicon_render_method').value,
						_maazicon_nonce       : '<?php echo wp_create_nonce( 'maazicon_save_settings' ); ?>',
					};

					$.post(
						'<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>',
						data,
						function ( response ) {
							maazicon_remove_notice( wait_notice );
							$('#maazicon_submit_button').removeAttr('disabled');

							if ( response.success ) {
								maazicon_notice( 'success', '<?php echo esc_attr( __( 'Settings saved', 'maazicon' ) ); ?>', 1 );
							} else {
								maazicon_notice( 'error', '<?php echo esc_attr( __( 'Failed to save settings!', 'maazicon' ) ); ?>', 1 );
							}
						}
					);
				}

				function maazicon_notice( type, txt, clear = false, dur = 0 ) {
					let $ = jQuery;

					clear && $('.maazicon-notice').remove();

					if ( txt ) {
						let notice = $( `<div class="notice notice-${ type } maazicon-notice">` ).html(txt);
						$('#maazicon-settings form').before( notice );

						if ( Number( dur ) ) {
							setTimeout( function() {
								$( notice ).remove();
								//alert( 'Yu' );
							}, Number( dur ) );
						}

						return notice;
					}
				}

				function maazicon_remove_notice( notice ) {
					jQuery( notice ).remove();
				}
			</script>
			<?php
		}

		/**
		 * Handles ajax.
		 *
		 * @since 1.0.0
		 */
		public function ajax() {
			if ( $_SERVER["REQUEST_METHOD"] !== 'POST' ) {
				wp_send_json_error( array(
					'message' => esc_attr( __( 'Your connection is not secure.', 'maazicon' ) ),
				) );
			}

			if ( ! array_key_exists( '_maazicon_nonce', $_POST ) || ! wp_verify_nonce( $_POST['_maazicon_nonce'], 'maazicon_save_settings' ) ) {
				wp_send_json_error( array(
					'message' => esc_attr( __( 'Authenticaion error.', 'maazicon' ) ),
				) );
			}
			
			if ( ! array_key_exists( 'maazicon_render_method', $_POST ) ) {
				wp_send_json_error( array(
					'message' => esc_attr( __( 'Unknow error.', 'maazicon' ) ),
				) );
			}
			
			if ( ! in_array( $_POST['maazicon_render_method'], array( 'i', 'svg' ) ) ) {
				wp_send_json_error( array(
					'message' => esc_attr( __( 'Unknow error.', 'maazicon' ) ),
				) );
			}

			update_option( 'maazicon_render_method', $_POST['maazicon_render_method'] );

			wp_send_json_success( array(
				'message' => esc_attr( __( 'Settings saved successfully.', 'maazicon' ) ),
			) );
		}
	}
endif;
