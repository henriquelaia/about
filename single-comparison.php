<?php
/**
 * Template Name: Comparison (Ranked)
 * Template Post Type: post
 * Description: Artigo de comparações com Top Picks, Tabela e FAQs + Ads.
 */
if (!defined('ABSPATH')) exit;

get_header();

if (have_posts()): while (have_posts()): the_post();

  $post_id = get_the_ID();
  $title   = get_the_title();
  $feat_id = get_post_thumbnail_id($post_id);
  $feat    = $feat_id ? wp_get_attachment_image_url($feat_id, 'full') : '';
  $updated = get_the_modified_date('c');
  $updated_h = get_the_modified_date(get_option('date_format'));
  $readtime = function_exists('lcr_read_time') ? lcr_read_time($post_id) : '';
  $excerpt = has_excerpt() ? get_the_excerpt() : wp_trim_words(wp_strip_all_tags(get_the_content()), 28);

  // Preferir ACF se existir
  $tp   = function_exists('get_field') ? (get_field('cmp_top_picks') ?: []) : [];
  $rows = function_exists('get_field') ? (get_field('cmp_compare_rows') ?: []) : [];
  $brks = function_exists('get_field') ? (get_field('cmp_brokers') ?: []) : [];
  $faqs = function_exists('get_field') ? (get_field('cmp_faq') ?: []) : [];
  $use_acf = !empty($tp) || !empty($rows) || !empty($brks) || !empty($faqs);

  // Conteúdo + TOC (fallback)
  if (function_exists('lcr_prepare_content_and_toc')) {
    list($toc_html, $content_with_ids) = lcr_prepare_content_and_toc( apply_filters('the_content', get_the_content()) );
  } else {
    $toc_html = '';
    $content_with_ids = apply_filters('the_content', get_the_content());
  }
  ?>
  <main class="cmp-page">
    <header class="cmp-hero">
      <?php if ($feat): ?>
        <img class="cmp-hero-img" src="<?php echo esc_url($feat); ?>" alt="<?php echo esc_attr($title); ?>">
      <?php endif; ?>
      <div class="cmp-hero-txt">
        <h1><?php echo esc_html($title); ?></h1>
        <div class="cmp-meta">
          <time datetime="<?php echo esc_attr($updated); ?>"><?php echo esc_html($updated_h); ?></time>
          <span>•</span><span><?php echo esc_html($readtime); ?></span>
        </div>
        <p class="cmp-excerpt"><?php echo esc_html($excerpt); ?></p>
        <?php echo do_shortcode('[ad slot="top-leader" data="1234567893"]'); ?>
        <p class="cmp-disclaimer">Conteúdo informativo. Pode conter links afiliados. Investir envolve risco.</p>
      </div>
    </header>

    <?php if ($toc_html && !$use_acf): // TOC só faz sentido no fallback de conteúdo ?>
      <aside class="article__toc cmp-toc">
        <div class="toc__title"><?php _e('Neste artigo','textdomain'); ?></div>
        <?php echo $toc_html; ?>
      </aside>
    <?php endif; ?>

    <div class="cmp-content">
      <div class="cmp-main">
        <?php
        echo do_shortcode('[ad slot="in-article-1" data="1234567894"]');

        if ($use_acf) {
          /* ========= Top Picks ========= */
          if (!empty($tp)) {
            echo '<section class="cmp-top-picks"><h2 class="cmp-sec-title">'.esc_html__('As nossas escolhas','textdomain').'</h2><div class="cmp-picks cols-3">';
            foreach ($tp as $p) {
              $name = $p['name'] ?? '';
              $rating = $p['rating'] ?? '';
              $logo = $p['logo'] ?? '';
              $badge = $p['badge'] ?? '';
              $tag = $p['tagline'] ?? '';
              $cta_url = $p['cta_url'] ?? '';
              $cta_label = $p['cta_label'] ?: 'Visitar';
              echo '<article class="pick"><div class="pick-head">'.
                   ($badge?'<span class="badge">'.esc_html($badge).'</span>':'').
                   '</div><div class="pick-body">'.
                   ($logo?'<img class="pick-logo" src="'.esc_url($logo).'" alt="'.esc_attr($name).'">':'').
                   '<h3 class="pick-name">'.esc_html($name).'</h3>'.
                   ($rating!==''?'<div class="pick-rating"><span class="stars" aria-label="'.esc_attr($rating).'">'.$rating.'★</span></div>':'').
                   ($tag?'<p class="pick-tag">'.esc_html($tag).'</p>':'').
                   ($cta_url?'<a class="btn btn-cta" href="'.esc_url($cta_url).'" rel="nofollow sponsored noopener" target="_blank">'.esc_html($cta_label).'</a>':'').
                   '</div></article>';
            }
            echo '</div></section>';
          }

          /* ========= Tabela ========= */
          if (!empty($rows)) {
            echo '<section class="cmp-table-wrap"><h2 class="cmp-sec-title">'.esc_html__('Comparação das melhores plataformas','textdomain').'</h2><div class="table-scroll"><table class="cmp-table"><thead><tr><th>Plataforma</th><th>Rating</th><th>Comissões/Taxas</th><th>Depósito Mínimo</th><th>Produtos</th><th>Reguladores</th><th></th></tr></thead><tbody>';
            $GLOBALS['lcr_itemlist'] = []; // reset
            $pos_auto = 1;
            foreach ($rows as $r) {
              $position = $r['position'] ?: $pos_auto++;
              $name = $r['name'] ?? '';
              $logo = $r['logo'] ?? '';
              $rating = $r['rating'] ?? '';
              $fees = $r['fees'] ?? '';
              $min = $r['min_deposit'] ?? '';
              $instr = $r['instruments'] ?? '';
              $regs = $r['regulators'] ?? '';
              $cta_url = $r['cta_url'] ?? '';
              $cta_label = $r['cta_label'] ?: 'Visitar';

              $GLOBALS['lcr_itemlist'][] = ['position'=>$position,'name'=>$name,'url'=>$cta_url ?: get_permalink()];

              echo '<tr>'.
                   '<td class="row-broker">'.($logo?'<img class="row-logo" src="'.esc_url($logo).'" alt="'.esc_attr($name).'">':'').'<span class="row-name">'.esc_html($name).'</span></td>'.
                   '<td class="row-rating">'.esc_html($rating).'</td>'.
                   '<td>'.esc_html($fees).'</td>'.
                   '<td>'.esc_html($min).'</td>'.
                   '<td>'.esc_html($instr).'</td>'.
                   '<td>'.esc_html($regs).'</td>'.
                   '<td>'.($cta_url?'<a class="btn btn-cta" href="'.esc_url($cta_url).'" rel="nofollow sponsored noopener" target="_blank">'.esc_html($cta_label).'</a>':'').'</td>'.
                   '</tr>';
            }
            echo '</tbody></table></div></section>';
          }

          /* ========= Brokers ========= */
          if (!empty($brks)) {
            foreach ($brks as $b) {
              $name = $b['name'] ?? '';
              $logo = $b['logo'] ?? '';
              $rating = $b['rating'] ?? '';
              $pros = array_filter(array_map('trim', explode("\n", (string)($b['pros'] ?? ''))));
              $cons = array_filter(array_map('trim', explode("\n", (string)($b['cons'] ?? ''))));
              echo '<section class="cmp-broker"><header class="brk-head">'.
                   ($logo?'<img class="brk-logo" src="'.esc_url($logo).'" alt="'.esc_attr($name).'">':'').
                   '<h3>'.esc_html($name).'</h3>'.
                   ($rating!==''?'<span class="stars">'.esc_html($rating).'★</span>':'').
                   '</header><div class="brk-body">';
              if ($pros) { echo '<ul class="brk-pros">'; foreach ($pros as $p) echo '<li>'.esc_html($p).'</li>'; echo '</ul>'; }
              if ($cons) { echo '<ul class="brk-cons">'; foreach ($cons as $c) echo '<li>'.esc_html($c).'</li>'; echo '</ul>'; }
              echo '</div></section>';
            }
          }

          /* ========= FAQ ========= */
          if (!empty($faqs)) {
            echo '<section class="cmp-faq"><h2 class="cmp-sec-title">'.esc_html__('Perguntas frequentes','textdomain').'</h2>';
            $GLOBALS['lcr_faq'] = [];
            foreach ($faqs as $f) {
              $q = $f['q'] ?? ''; $a = $f['a'] ?? '';
              $GLOBALS['lcr_faq'][] = ['@type'=>'Question','name'=>wp_strip_all_tags($q),'acceptedAnswer'=>['@type'=>'Answer','text'=>wp_kses_post($a)]];
              echo '<article class="faq-item"><h3 class="faq-q">'.esc_html($q).'</h3><div class="faq-a">'.wp_kses_post(wpautop($a)).'</div></article>';
            }
            echo '</section>';
          }

        } else {
          // Fallback: usa o que estiver no editor (podem ser shortcodes)
          echo $content_with_ids;
        }
        ?>
      </div>

      <aside class="cmp-sidebar">
        <?php echo do_shortcode('[ad slot="sidebar-sticky" data="1234567895"]'); ?>
      </aside>
    </div>

    <footer class="cmp-footer">
      <?php echo do_shortcode('[ad slot="bottom-leader" data="1234567896"]'); ?>
    </footer>
  </main>

  <?php
  /* ================= JSON-LD ================= */
  if (!empty($GLOBALS['lcr_itemlist'])) {
    usort($GLOBALS['lcr_itemlist'], fn($a,$b)=>$a['position']<=>$b['position']);
    $itemList = array_map(fn($it)=>[
      '@type'=>'ListItem','position'=>(int)$it['position'],'name'=>$it['name'],'url'=>$it['url']
    ], $GLOBALS['lcr_itemlist']);
    echo '<script type="application/ld+json">'.wp_json_encode([
      '@context'=>'https://schema.org',
      '@type'=>'ItemList',
      'name'=>wp_strip_all_tags($title),
      'itemListElement'=>$itemList
    ], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES).'</script>';
  }
  if (!empty($GLOBALS['lcr_faq'])) {
    echo '<script type="application/ld+json">'.wp_json_encode([
      '@context'=>'https://schema.org',
      '@type'=>'FAQPage',
      'mainEntity'=>$GLOBALS['lcr_faq']
    ], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES).'</script>';
  }

endwhile; endif;

get_footer();
