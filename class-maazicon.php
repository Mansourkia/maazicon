<?php
/**
 * Maazicon core class.
 *
 * @package Maazicon
 * @since 1.0.0
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'Maazicon' ) ) {
	/**
	 * Maazicon core class.
	 *
	 * @since 1.0.0
	 */
	class Maazicon {

		/**
		 * Libraries.
		 *
		 * @var array
		 * @since 1.0.0
		 */
		private $libraries;

		/**
		 * cache.
		 *
		 * @since 1.0.0
		 * @var array
		 */
		private $cache;

		/**
		 * Constructor.
		 *
		 * @since 1.0.0
		 */
		public function __construct() {
			$this->cache = array(
				'bi' => array(),
				'webicons' => array(),
				'mobirise' => array(),
				'simpleline' => array(),
				'metrize' => array(),
			);
			
			$this->libraries = array(
				'bi' => array(),
				'webicons' => array(),
				'mobirise' => array(),
				'simpleline' => array(),
				'metrize' => array(),
			);

			add_action( 'setup_theme', array( $this, 'init' ) );
			add_action( 'init', array( $this, 'load_textdomain' ) );
			//add_action( 'admin_init', array( $this, 'filesystem' ) );

			register_uninstall_hook( MAAZICON_FILE, array( $this, 'uninstall' ) );
		}

		// public function filesystem() {
		// 	if ( ! function_exists( 'WP_Filesystem' ) ) {
		// 		require_once ABSPATH . 'wp-admin/includes/file.php';
		// 	}

		// 	global $wp_filesystem;

		// 	WP_Filesystem();
		// }

		// public function creds() {
		// 	$url = wp_nonce_url( 'options-general.php?page=maazicon', 'maazicon_creds' );
			
		// 	if ( false === ( $creds = request_filesystem_credentials( $url, '', false, false, null ) ) ) {
		// 		return false;
		// 	}

		// 	return $creds;
		// }

		/**
		 * Initialize.
		 *
		 * @since 1.0.0
		 */
		public function init() {
			if ( defined( 'ELEMENTOR_VERSION' ) ) {
				add_action( 'elementor/icons_manager/additional_tabs', array( $this, 'register_icons' ) );
			}
		}

		/**
		 * Registers icons.
		 *
		 * @since 1.0.0
		 *
		 * @param array $tabs
		 * @return array
		 */
		public function register_icons( $tabs ) {
			// bootstrap icons
			$tabs['bi'] = array(
				'name'            => 'bi',
				'label'           => sprintf( '%1s (%2s)', esc_html__( 'Bootstrap', 'maazicon' ), __( "Maazicon", 'maazicon' ) ),
				'labelIcon'       => 'maazicon-bi maazicon-bi-bootstrap-fill',
				'prefix'          => 'maazicon-bi-',
				'displayPrefix'   => 'maazicon-bi',
				'url'             => MAAZICON_URI . 'assets/bi/style.css?ver=' . MAAZICON_VERSION,
				'fetchJson'       => MAAZICON_URI . 'assets/bi/fetch.json',
				'ver'             => '1.11.3',
			);

			// webicons
			$tabs['webicons'] = array(
				'name'            => 'webicons',
				'label'           => sprintf( '%1s (%2s)', esc_html__( 'Webicon', 'maazicon' ), __( "Maazicon", 'maazicon' ) ),
				'labelIcon'       => 'maazicon-webicons maazicon-webicons-chat',
				'prefix'          => 'maazicon-webicons-',
				'displayPrefix'   => 'maazicon-webicons',
				'url'             => MAAZICON_URI . 'assets/webicons/style.css?ver=' . MAAZICON_VERSION,
				'fetchJson'       => MAAZICON_URI . 'assets/webicons/fetch.json',
				'ver'             => '1.11.3',
			);

			// mobirise
			$tabs['mobirise'] = array(
				'name'            => 'mobirise',
				'label'           => sprintf( '%1s (%2s)', esc_html__( 'Mobirise', 'maazicon' ), __( "Maazicon", 'maazicon' ) ),
				'labelIcon'       => 'maazicon-mobirise maazicon-mobirise-mobirise',
				'prefix'          => 'maazicon-mobirise-',
				'displayPrefix'   => 'maazicon-mobirise',
				'url'             => MAAZICON_URI . 'assets/mobirise/style.css?ver=' . MAAZICON_VERSION,
				'fetchJson'       => MAAZICON_URI . 'assets/mobirise/fetch.json',
				'ver'             => '1.0.0',
			);

			// simpleline
			$tabs['simpleline'] = array(
				'name'            => 'simpleline',
				'label'           => sprintf( '%1s (%2s)', esc_html__( 'Simpleline', 'maazicon' ), __( "Maazicon", 'maazicon' ) ),
				'labelIcon'       => 'maazicon-simpleline maazicon-simpleline-magnet',
				'prefix'          => 'maazicon-simpleline-',
				'displayPrefix'   => 'maazicon-simpleline',
				'url'             => MAAZICON_URI . 'assets/simpleline/style.css?ver=' . MAAZICON_VERSION,
				'fetchJson'       => MAAZICON_URI . 'assets/simpleline/fetch.json',
				'ver'             => '1.0.0',
			);

			if ( get_option( 'maazicon_render_method', 'svg' ) === 'svg' ) {
				$tabs['bi']['render_callback'] = array( $this, 'render_callback' );
				$tabs['webicons']['render_callback'] = array( $this, 'render_callback' );
				$tabs['mobirise']['render_callback'] = array( $this, 'render_callback' );
				$tabs['simpleline']['render_callback'] = array( $this, 'render_callback' );
			}

			return $tabs;
		}

		/**
		 * Renders an icon.
		 *
		 * @param array  $icon
		 * @param array  $attrs Ignored.
		 * @param string $tag   Ignored.
		 *
		 * @return string|false Icon source or False
		 */
		public function render_callback( $icon, $attrs = array(), $tag = false ) {
			$slug    = $this->get_icon_slug( $icon['value'] );
			$library = $icon['library'];

			if ( $source = $this->get_cache( $library, $slug ) ) {
				return $source;
			}

			// cache modified
			if ( $source = $this->get_icon( $library, $slug ) ) {
				return $source;
			}

			return false;
		}

		/**
		 * Retrieves an icon from the cache.
		 *
		 * @since 1.0.0
		 *
		 * @param string $library
		 * @param string $slug
		 *
		 * @return string|false
		 */
		private function get_cache( $library, $slug ) {
			if ( isset( $this->cache[$library][$slug] ) ) {
				return $this->cache[$library][$slug];
			}

			return false;
		}

		/**
		 * Retrieves the source of an icon.
		 *
		 * @since 1.0.0
		 *
		 * @param string $library
		 * @param string $slug
		 *
		 * @return string|false
		 */
		private function get_icon( $library, $slug ) {
			if ( empty( $this->libraries[$library] ) ) {
				$this->libraries[$library] = $this->get_library( $library );
			}

			if ( isset( $this->libraries[$library][$slug] ) ) {
				$this->cache[$library][$slug] = $this->libraries[$library][$slug];
				return $this->libraries[$library][$slug];
			}

			return false;
		}

		/**
		 * Retrieves the icon slug.
		 *
		 * @since 1.0.0
		 *
		 * @param string $icon_value
		 * @return string
		 */
		private function get_icon_slug( $icon_value ) {
			$slug = $icon_value;

			$slug = preg_replace( "/maazicon\\-bi\\-?/", '', $slug );
			$slug = preg_replace( "/maazicon\\-webicons\\-?/", '', $slug );
			$slug = preg_replace( "/maazicon\\-mobirise\\-?/", '', $slug );
			$slug = preg_replace( "/maazicon\\-simpleline\\-?/", '', $slug );
			$slug = preg_replace( "/\\s*/", '', $slug );

			return $slug;
		}

		/**
		 * Retrieves an icon library.
		 *
		 * @since 1.0.0
		 *
		 * @param $library
		 *
		 * @return array
		 */
		private function get_library( $library ) {
			$file = fopen( MAAZICON_DIR . 'assets/' . $library . '/library.json', 'r' );
			$txt  = '';

			while ( ! feof( $file ) ) {
				$txt .= fgets( $file );
			}

			// $creds = $this->creds();

			// if ( false === $creds ) {
			// 	return false;
			// }
		
			// global $wp_filesystem;

			// if ( ! WP_Filesystem( $creds ) ) {
			// 	return false;
			// }

			// $content = $wp_filesystem->get_contents( $filename );
			
			// if ( $content === false ) {
			// 	return false;
			// }

			return json_decode( $txt, true );
		}

		/**
		 * Removes the options.
		 *
		 * @since 1.0.0
		 */
		public function uninstall() {
			delete_option( 'maazicon_render_method' );
		}

		/**
		 * Loads textdomain.
		 *
		 * @since 1.0.0
		 */
		function load_textdomain() {
			load_plugin_textdomain(
				'maazicon',
				false,
				dirname( plugin_basename( MAAZICON_FILE ) ) . '/languages'
			);
		}
	}
}
