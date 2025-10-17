<?php
if (!defined('ABSPATH')) exit;

/**
 * Tema base
 */
add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
});

/**
 * Helpers + Enqueues
 */
add_action('wp_enqueue_scripts', function () {
    if (is_admin()) return;

    // ===== Helpers =====
    $resolve_asset = function ($rel) {
        $child_dir  = get_stylesheet_directory()      . '/assets/' . $rel;
        $child_uri  = get_stylesheet_directory_uri()  . '/assets/' . $rel;
        $parent_dir = get_template_directory()        . '/assets/' . $rel;
        $parent_uri = get_template_directory_uri()    . '/assets/' . $rel;

        if (file_exists($child_dir))  return [$child_uri, filemtime($child_dir)];
        if (file_exists($parent_dir)) return [$parent_uri, filemtime($parent_dir)];
        return [null, null];
    };

    $enqueue = function ($handle, $rel, $deps = [], $in_footer = false) use ($resolve_asset) {
        [$url, $v] = $resolve_asset($rel);
        if (!$url) return;
        $ext = pathinfo($rel, PATHINFO_EXTENSION);
        if ($ext === 'css') wp_enqueue_style($handle, $url, $deps, $v ?: false);
        else                wp_enqueue_script($handle, $url, $deps, $v ?: false, $in_footer);
    };

    $enqueue_theme_file = function ($handle, $relpath, $deps = [], $in_footer = false) {
        $relpath   = ltrim($relpath, '/');
        $abs_child = get_stylesheet_directory() . '/' . $relpath;
        $uri_child = get_stylesheet_directory_uri() . '/' . $relpath;
        $abs_par   = get_template_directory() . '/' . $relpath;
        $uri_par   = get_template_directory_uri() . '/' . $relpath;

        if (file_exists($abs_child))      { $url = $uri_child; $v = filemtime($abs_child); }
        elseif (file_exists($abs_par))    { $url = $uri_par;   $v = filemtime($abs_par);   }
        else { return; }

        $ext = pathinfo($relpath, PATHINFO_EXTENSION);
        if ($ext === 'css') wp_enqueue_style($handle, $url, $deps, $v ?: false);
        else                wp_enqueue_script($handle, $url, $deps, $v ?: false, $in_footer);
    };

    // ===== Limpar registos/handles legados =====
    foreach ([
        'lucrar-header','lcr-site-header',
        'peg-project','partners','lcr-partners',
        'lcr-realestate-css','lcr-realestate-js',
    ] as $h) {
        wp_dequeue_style($h);  wp_deregister_style($h);
        wp_dequeue_script($h); wp_deregister_script($h);
    }

    // ===== CSS crítico =====
    wp_register_style('lcr-critical', false, [], null);
    wp_enqueue_style('lcr-critical');
    wp_add_inline_style('lcr-critical', 'html,body{--site-bg:#0b1014;background:var(--site-bg)!important;color:#fff}');

    // Base + Fontes globais
    $enqueue('lucrar-projects', 'css/projects.css');
    $enqueue('lcr-fonts', 'css/fonts.css', ['lucrar-projects']); // /assets/css/fonts.css

    // ===== Detectores por conteúdo/slug =====
    $page_html = '';
    if (is_page()) { global $post; if ($post instanceof WP_Post) $page_html = (string) ($post->post_content ?? ''); }

    $load_gold  = $page_html && (stripos($page_html, 'id="gold-backup"') !== false || stripos($page_html, 'class="gb-hero"') !== false);

    $load_stock = false;
    if ($page_html) {
        foreach (['id="stock-tokenization"','id="stock-tokenization-pt"','id="stock-tokenization-en"'] as $n) {
            if (stripos($page_html, $n) !== false) { $load_stock = true; break; }
        }
    }
    if (!$load_stock && is_page(['stock-tokenization','tokenizacao-de-acoes'])) $load_stock = true;

    $load_peg   = ($page_html && stripos($page_html, 'id="peg-project"') !== false);

    $load_owner = ($page_html && (stripos($page_html, 'id="owner-hero"') !== false || stripos($page_html, 'class="owner-hero"') !== false));

    // ===== ABOUT: deteção robusta (slug, HTML e URL)
    $load_about = false;
    if (is_page(['about','sobre','about-en'])) $load_about = true;

    if (!$load_about && is_page()) {
        global $post;
        $slug = ($post instanceof WP_Post) ? sanitize_title($post->post_name ?? '') : '';
        if (in_array($slug, ['sobre','about','about-en'], true)) $load_about = true;
    }
    if (!$load_about && $page_html) {
        foreach (['lucrar-about-section','id="about-section"','id="about-hero"','class="about-hero"'] as $needle) {
            if (stripos($page_html, $needle) !== false) { $load_about = true; break; }
        }
    }
    if (!$load_about) {
        $req_path = trim(parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH), '/');
        if (preg_match('~(^|/)(sobre|about|about-en)(/|$)~i', $req_path)) $load_about = true;
    }

    // **NEW**: REAL-ESTATE
    $load_realestate = ($page_html && stripos($page_html, 'id="real-estate-3d"') !== false);

    // ===== Enqueues específicos =====

    // GOLD BACKUP
    if ($load_gold) {
        $enqueue_theme_file('lcr-gold-css', 'gold_backup/gold_backup.css', ['lucrar-projects']);
        $enqueue_theme_file('lcr-gold-js',  'gold_backup/gold_backup.js',   [], true);

        $gold_base = trailingslashit( get_stylesheet_directory_uri() ) . 'gold_backup/';
        wp_add_inline_script('lcr-gold-js',
            'window.LCR_BASES = window.LCR_BASES || {}; window.LCR_BASES.gold = "'. esc_js($gold_base) .'";',
            'before'
        );
        $GLOBALS['LCR_LOAD_GOLD'] = true;
    }

    // STOCK TOKENIZATION
    if ($load_stock) {
        $enqueue_theme_file('lcr-stock-css', 'stock_tokenization/stock-tokenization.css', ['lucrar-projects']);
        $enqueue_theme_file('lcr-stock-js',  'stock_tokenization/stock-tokenization.js',   [], true);
        $GLOBALS['LCR_LOAD_STOCK'] = true;
    }

    // PEG PROJECT
    if ($load_peg) {
        $enqueue_theme_file('lcr-peg-css', 'peg-project/peg-project.css', ['lucrar-projects']);
        $enqueue_theme_file('lcr-peg-js',  'peg-project/peg-project.js',  [], true);
        $GLOBALS['LCR_LOAD_PEG'] = true;
    }

    // OWNER
    if ($load_owner) {
        $enqueue_theme_file('lcr-owner-css', 'owner/owner-hero.css', ['lucrar-projects']);
        $enqueue_theme_file('lcr-owner-js',  'owner/owner-hero.js',  [], true);
        $GLOBALS['LCR_LOAD_OWNER'] = true;
    }

    // ABOUT
if ($load_about) {
    // usa os ficheiros dentro da pasta /about/
    $enqueue_theme_file('lcr-about-css', 'about/about.css', ['lucrar-projects']);
    $enqueue_theme_file('lcr-about-js',  'about/about.js',  [], true);
    $GLOBALS['LCR_LOAD_ABOUT'] = true;
}


    // PARTNERS
    $enqueue_theme_file('lcr-partners-css', 'partners/partners.css', ['lucrar-projects']);
    $enqueue_theme_file('lcr-partners-js',  'partners/partners.js',  [], true);

    // REAL-ESTATE
    if ($load_realestate) {
        $enqueue_theme_file('lcr-realestate-css', 'real-estate/real-estate.css', ['lucrar-projects']);
        $enqueue_theme_file('lcr-realestate-js',  'real-estate/real-estate.js',  [], true);
        $GLOBALS['LCR_LOAD_REALESTATE'] = true;
    }

}, 20);

/**
 * Corrigir URLs errados que plugins possam injetar
 */
add_filter('style_loader_src', function($src, $handle){
    if (preg_match('#/themes/lucrar-hello-child/(peg-project|partners|real-estate|about)\.css#', $src, $m)) {
        $map = [
            'peg-project'  => get_stylesheet_directory_uri() . '/peg-project/peg-project.css',
            'partners'     => get_stylesheet_directory_uri() . '/partners/partners.css',
            'real-estate'  => get_stylesheet_directory_uri() . '/real-estate/real-estate.css',
            'about'        => get_stylesheet_directory_uri() . '/about/about.css',
        ];
        return $map[$m[1]];
    }
    return $src;
}, 10, 2);

add_filter('script_loader_src', function($src, $handle){
    if (preg_match('#/themes/lucrar-hello-child/(peg-project|partners|real-estate|about)\.js#', $src, $m)) {
        $map = [
            'peg-project'  => get_stylesheet_directory_uri() . '/peg-project/peg-project.js',
            'partners'     => get_stylesheet_directory_uri() . '/partners/partners.js',
            'real-estate'  => get_stylesheet_directory_uri() . '/real-estate/real-estate.js',
            'about'        => get_stylesheet_directory_uri() . '/about/about.js',
        ];
        return $map[$m[1]];
    }
    return $src;
}, 10, 2);

/**
 * Esconde h1 padrão quando usamos páginas “app-like”
 */
add_action('wp_head', function () {
    $hide = false;
    if (is_page()) {
        $slugs = ['stock-tokenization','tokenizacao-de-acoes','about','sobre','about-en'];
        if (is_page($slugs)) $hide = true;

        if (!$hide) {
            global $post;
            if ($post instanceof WP_Post) {
                $html = (string) ($post->post_content ?? '');
                $hide = (stripos($html, 'id="peg-project"') !== false)
                     || (stripos($html, 'id="stock-tokenization"') !== false)
                     || (stripos($html, 'id="stock-tokenization-pt"') !== false)
                     || (stripos($html, 'id="stock-tokenization-en"') !== false)
                     || (stripos($html, 'id="owner-hero"') !== false)
                     || (stripos($html, 'class="owner-hero"') !== false)
                     || (stripos($html, 'lucrar-about-section') !== false)
                     || (stripos($html, 'id="about-hero"') !== false)
                     || (stripos($html, 'class="about-hero"') !== false)
                     || (stripos($html, 'id="gold-backup"') !== false)
                     || (stripos($html, 'class="gb-hero"') !== false)
                     || (stripos($html, 'id="real-estate-3d"') !== false);
            }
        }
    }
    if ($hide) {
        echo '<style>h1.entry-title,.entry-title,.elementor-page-title,h1.page-title{display:none!important}</style>';
    }
}, 5);

/**
 * Preload de fontes (apenas se existirem no tema child)
 */
add_action('wp_head', function () {
    $font_dirs = [
        get_stylesheet_directory() . '/assets/fonts'                    => get_stylesheet_directory_uri() . '/assets/fonts',
        get_stylesheet_directory() . '/peg-project/assets/fonts'        => get_stylesheet_directory_uri() . '/peg-project/assets/fonts',
        get_stylesheet_directory() . '/stock_tokenization/assets/fonts' => get_stylesheet_directory_uri() . '/stock_tokenization/assets/fonts',
        get_stylesheet_directory() . '/owner/assets/fonts'              => get_stylesheet_directory_uri() . '/owner/assets/fonts',
        get_stylesheet_directory() . '/gold_backup/assets/fonts'        => get_stylesheet_directory_uri() . '/gold_backup/assets/fonts',
    ];
    $files = ['Akrobat-Variable.woff2','Akrobat-Regular.woff2','Akrobat-Bold.woff2','Akrobat-Black.woff2','segoepr.woff2'];

    foreach ($font_dirs as $abs => $uri) {
        foreach ($files as $f) {
            if (file_exists($abs.'/'.$f)) {
                echo '<link rel="preload" href="'.$uri.'/'.$f.'" as="font" type="font/woff2" crossorigin>'."\n";
            }
        }
    }
}, 1);

/**
 * Meta Pixel
 */
function lcr_add_meta_pixel_to_head() { ?>
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','1736847933656688');fbq('track','PageView');
</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1736847933656688&ev=PageView&noscript=1"/></noscript>
<?php }
add_action('wp_head', 'lcr_add_meta_pixel_to_head', 4);

add_action('after_switch_theme', function () { flush_rewrite_rules(); });

/**
 * ===== REST: Liquidity routes =====
 * (inalterado)
 */
if (!defined('LUCRAR_LIQ_ROUTE_DONE')) {
    define('LUCRAR_LIQ_ROUTE_DONE', true);

    add_action('rest_api_init', function () {
        register_rest_route('lucrar/v1', '/liquidity/(?P<address>[0-9a-fA-Fx]+)/', [
            'methods'             => 'GET',
            'permission_callback' => '__return_true',
            'args' => [
                'address' => ['validate_callback' => function ($param) { return is_string($param) && preg_match('/^0x[0-9a-fA-F]{40}$/', $param); }],
                'mode'    => ['validate_callback' => function ($param) { return in_array($param, ['pair','pairhalf','token',''], true); }],
                'only'    => []
            ],
            'callback' => function (WP_REST_Request $req) {
                $addr = strtolower(sanitize_text_field($req['address']));
                $mode = $req->get_param('mode') ?: '';
                $ua   = ['accept'=>'application/json','user-agent'=>'LucrarBot/1.2'];

                if ($mode === 'pair' || $mode === 'pairhalf') {
                    $u = "https://api.dexscreener.com/latest/dex/tokens/$addr";
                    $r = wp_remote_get($u, ['timeout'=>12,'headers'=>$ua]);
                    if (!is_wp_error($r)) {
                        $j = json_decode(wp_remote_retrieve_body($r), true);
                        $pairs = is_array($j['pairs'] ?? null) ? $j['pairs'] : [];
                        $ps = array_values(array_filter($pairs, function ($p) {
                            $dex = strtolower($p['dexId'] ?? ''); $chain = strtolower($p['chainId'] ?? '');
                            return ($dex === 'pancakeswap') && (strpos($chain, 'bsc') !== false);
                        }));
                        if ($ps) {
                            usort($ps, function ($a,$b) {
                                $la = (float)($a['liquidity']['usd'] ?? 0); $lb = (float)($b['liquidity']['usd'] ?? 0); return $lb <=> $la;
                            });
                            $best = $ps[0];
                            $liq  = (float)($best['liquidity']['usd'] ?? 0);
                            if ($liq > 0) {
                                $half = $liq / 2.0;
                                return rest_ensure_response([
                                    'source'=>'dexscreener:pancakeswap',
                                    'chainId'=>$best['chainId'] ?? null,
                                    'pairAddress'=>$best['pairAddress'] ?? null,
                                    'pairLiquidityUSD'=>$liq,
                                    'liquidityUSD'=>($mode === 'pairhalf') ? $half : $liq,
                                    'mode'=>$mode,
                                ]);
                            }
                        }
                    }
                    return new WP_Error('no_pair','Unable to fetch pair liquidity',['status'=>502]);
                }

                $extract = function ($json) {
                    if (!$json) return null;
                    if (isset($json['data'])) $json = $json['data'];
                    if (isset($json['metrics']['liquidityUSD'])) return (float)$json['metrics']['liquidityUSD'];
                    foreach (['liquidityUSD','liquidityUsd','liquidity','usdLiquidity'] as $k) {
                        if (isset($json[$k]) && is_numeric($json[$k])) return (float)$json[$k];
                    }
                    if (isset($json['token']['liquidityUSD'])) return (float)$json['token']['liquidityUSD'];
                    return null;
                };

                $urls = [
                    "https://proxy-worker-api.pancakeswap.com/bsc/v1/analytics/token/$addr",
                    "https://proxy-worker-api.pancakeswap.com/bsc/v2/tokens/$addr",
                    "https://api.pancakeswap.info/api/v2/tokens/$addr",
                ];

                foreach ($urls as $u) {
                    $r = wp_remote_get($u, ['timeout'=>10,'headers'=>$ua]);
                    if (is_wp_error($r)) continue;
                    $j = json_decode(wp_remote_retrieve_body($r), true);
                    $liq = $extract($j);
                    if ($liq !== null) return rest_ensure_response(['source'=>'pancake:token','liquidityUSD'=>$liq]);
                }

                $r = wp_remote_get("https://api.dexscreener.com/latest/dex/tokens/$addr", ['timeout'=>8,'headers'=>$ua]);
                if (!is_wp_error($r)) {
                    $j = json_decode(wp_remote_retrieve_body($r), true);
                    $pairs = $j['pairs'][0]['liquidity']['usd'] ?? null;
                    if (is_numeric($pairs)) return rest_ensure_response(['source'=>'dexscreener:agg','liquidityUSD'=> (float)$pairs]);
                }
                return new WP_Error('no_liquidity','Unable to fetch liquidity',['status'=>502]);
            }
        ]);
    });

    add_filter('rest_post_dispatch', function ($result,$server,$request) {
        $route = $request->get_route();
        if (strpos($route, '/lucrar/v1/liquidity/') !== false && $result instanceof WP_REST_Response) {
            $result->header('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');
            $result->header('Pragma','no-cache');
            $result->header('Expires','0');
        }
        return $result;
    }, 10, 3);
}
