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

			add_action( "load-$hook", array( $this, 'enqueue_scripts' ) );
		}

		public function enqueue_scripts() {
			add_action( 'admin_enqueue_scripts', array( $this, 'enqueue' ) );
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
					<p class="notice notice-error"><?php printf( __( "Please install %s", 'maazicon' ), '<a href="https://wordpress.org/plugins/elementor/">' . esc_html( __( 'Elementor' ) ) . '</a>' ); ?></p>
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
							<button type="button" class="button button-primary" id="maazicon_submit_button">
								<?php echo esc_html( __( 'Save Settings', 'maazicon' ) ); ?>
							</button>
						</div>
					</form>
				</section>
			</div>
			<?php
		}

		/**
		 * Enqueeus scripts.
		 *
		 * @since 1.0.0
		 *
		 * @global $pagenow
		 */
		public function enqueue() {
			wp_enqueue_script( 'maazicon_notice', esc_url( MAAZICON_URI . 'admin/assets/notice.min.js' ), array( 'jquery' ), MAAZICON_VERSION );
			wp_enqueue_script( 'maazicon_ajax', esc_url( MAAZICON_URI . 'admin/assets/ajax.min.js' ), array( 'jquery' ), MAAZICON_VERSION );

			wp_add_inline_script( 'maazicon_ajax', '
				(function($){
					$(document).ready(function(){
						$("#maazicon_submit_button").on("click", function() {
							maazicon_save_settings({
								admin_ajax_url: "' . esc_url( admin_url( 'admin-ajax.php' ) ) . '",
								nonce: "' . esc_attr( wp_create_nonce( 'maazicon_save_settings' ) ) . '",
								notice: {
									wait: "' . esc_html( __( 'Please wait', 'maazicon' ) ) . '",
									success: "' . esc_html( __( 'Settings saved', 'maazicon' ) ) . '",
									error: "' . esc_html( __( 'Failed to save settings', 'maazicon' ) ) . '",
								}
							});
						});
					});
				})( jQuery );
			', 'before' );
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

			if ( ! current_user_can( 'manage_options' ) ) {
				wp_send_json_error( array(
					'message' => esc_attr( __( 'Authenticaion error.', 'maazicon' ) ),
				) );
			}

			// nonce
			if ( ! array_key_exists( '_maazicon_nonce', $_POST ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['_maazicon_nonce'] ) ), 'maazicon_save_settings' ) ) {
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
