<?php

require_once 'plugin-update-checker-4.10/plugin-update-checker.php';
$updateChecker = Puc_v4_Factory::buildUpdateChecker(
    'https://raw.githubusercontent.com/IngoStramm/micro-office-child/master/info.json',
    __FILE__,
    'micro-office-child'
);

function moc_debug( $debug ) {
	echo '<pre>';
	var_dump( $debug );
	echo '</pre>';
}

function moc_scripts() {
    wp_enqueue_style( 'micro-office-style', get_template_directory_uri() . '/style.css' );
    wp_enqueue_style( 'moc-style', get_stylesheet_directory_uri() . '/assets/css/style.css' );
    // wp_enqueue_script( 'script-name', get_template_directory_uri() . '/js/example.js', array(), '1.0.0', true );
}

add_action( 'wp_enqueue_scripts', 'moc_scripts' );

// Sobreescreve a função que exibe o layout blog
function micro_office_template_related_output( $post_options, $post_data ) {
	$show_title = true;	
	$parts = explode('_', $post_options['layout']);
	$style = $parts[0];
	$columns = max(1, min(12, empty($post_options['columns_count']) 
								? (empty($parts[1]) ? 1 : (int) $parts[1])
								: $post_options['columns_count']
								));
	$tag = micro_office_in_shortcode_blogger(true) ? 'div' : 'article';
	if ($columns > 1) {
		?><div class="<?php echo 'column-1_'.esc_attr($columns); ?> column_padding_bottom"><?php
	}
	?>
	<<?php micro_office_show_layout($tag); ?> class="post_item post_item_<?php echo esc_attr($style); ?> post_item_<?php echo esc_attr($post_options['number']); ?>">

		<div class="post_content">
			<?php if ($post_data['post_video'] || $post_data['post_thumb'] || $post_data['post_gallery']) { ?>
			<div class="post_featured">
				<?php
				micro_office_template_set_args('post-featured', array(
					'post_options' => $post_options,
					'post_data' => $post_data
				));
				get_template_part(micro_office_get_file_slug('templates/_parts/post-featured.php'));
				?>
			</div>
			<?php } ?>

			<?php if ($show_title) { ?>
				<div class="post_content_wrap">
					<?php
					if (!isset($post_options['links']) || $post_options['links']) { 
						/* ?><h5 class="post_title"><a href="<?php echo esc_url($post_data['post_link']); ?>"><?php micro_office_show_layout($post_data['post_title']); ?></a></h5><?php */
						?>

						<h5 class="post_title"><?php micro_office_show_layout($post_data['post_title']); ?></h5>

						<?php do_action( 'moc_projects_buttons', $post_data[ 'post_id' ] ); ?>

						<?php//moc_debug( $post_data[ 'post_id' ] ); ?>

						<?php
					} else {
						?><h5 class="post_title"><?php micro_office_show_layout($post_data['post_title']); ?></h5><?php
					}
					if (!empty($post_data['post_terms'][$post_data['post_taxonomy_tags']]->terms_links)) {
						?><div class="post_info post_info_tags"><?php echo join(', ', $post_data['post_terms'][$post_data['post_taxonomy_tags']]->terms_links); ?></div><?php
					}
					?>
				</div>
			<?php } ?>
		</div>	<!-- /.post_content -->
	</<?php micro_office_show_layout($tag); ?>>	<!-- /.post_item -->
	<?php
	if ($columns > 1) {
		?></div><?php
	}
}

// Sobreescreve a função que exibe a mensagem de quando não há posts
function micro_office_template_no_articles_output($post_options, $post_data) {
	return;
}