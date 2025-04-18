<?php
/**
 * Plugin Name: Maazicon
 * Description: Additional icons for Elementor
 * Tags: icon,elementor,elementor icon,svg
 * Version: 1.0.0
 * Author: Amirhossein Mansourkiaei
 * Text Domain: maazicon
 * Domain Path: /languages
 * License: GPL-3.0
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
*/

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Define constants.
 */
define( 'MAAZICON_VERSION', '1.0.0' . time() );
define( 'MAAZICON_DIR', trailingslashit( plugin_dir_path( __FILE__ ) ) );
define( 'MAAZICON_URI', trailingslashit( esc_url( plugin_dir_url( __FILE__ ) ) ) );
define( 'MAAZICON_FILE', __FILE__ );

require_once MAAZICON_DIR . 'class-maazicon.php';
require_once MAAZICON_DIR . 'admin/class-maazicon-admin.php';

( new Maazicon() );

if ( is_admin() ) {
	( new Maazicon_Admin() );
}
