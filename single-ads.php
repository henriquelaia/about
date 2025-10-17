<?php
/**
 * Template Name: Single Post with Ads
 * Template Post Type: post
 */
if (!defined('ABSPATH')) exit;
get_header();

if (have_posts()): while (have_posts()): the_post();
  $post_id = get_the_ID();
  $title   = get_the_title();
  $feat_id = get_post_thumbnail_id($post_id);
  $feat    = $feat_id ? wp_get_attachment_image_url($feat_id,'full') : '';
  $date_p  = get_the_date('c'); $date_h = get_the_date(get_option('date_format'));
  $rt      = hl_read_time($post_id);
  list($toc,$content)=hl_prepare_content_and_toc( apply_filters('the_content', get_the_content()) );
  ?>
  <main class="single-ads">
    <article <?php post_class('article'); ?>>
      <header class="article__header">
        <?php if($feat): ?><figure class="article__hero"><img src="<?php echo esc_url($feat); ?>" alt="<?php echo esc_attr($title); ?>"></figure><?php endif; ?>
        <h1 class="article__title"><?php echo esc_html($title); ?></h1>
        <div class="article__meta">
          <time datetime="<?php echo esc_attr($date_p); ?>"><?php echo esc_html($date_h); ?></time>
          <span class="article__dot">•</span>
          <span class="article__readtime"><?php echo esc_html($rt); ?></span>
        </div>
        <?php echo do_shortcode('[ad slot="top-leader" data="1234567893"]'); ?>
      </header>

      <?php if($toc): ?>
        <aside class="article__toc">
          <div class="toc__title"><?php _e('Neste artigo','textdomain'); ?></div>
          <?php echo $toc; ?>
        </aside>
      <?php endif; ?>

      <div class="content-with-sidebar">
        <div class="entry-content">
          <?php echo $content; ?>
        </div>
        <aside class="right-rail">
          <?php echo do_shortcode('[ad slot="sidebar-sticky" data="1234567895"]'); ?>
        </aside>
      </div>

      <footer class="article__footer">
        <?php echo do_shortcode('[ad slot="bottom-leader" data="1234567896"]'); ?>
      </footer>
    </article>
  </main>
  <?php
endwhile; endif;

get_footer();
