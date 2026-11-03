<?php
/**
 * Plugin Name: EventDesk
 * Description: An AngularJS event directory with a WordPress editing workflow. Portfolio prototype.
 * Version: 0.1.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * License: MIT
 */
if (!defined('ABSPATH')) { exit; }
function eventdesk_clean_date($value) {
    $value = sanitize_text_field($value);
    if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $value, $m)) { return ''; }
    return checkdate((int)$m[2], (int)$m[3], (int)$m[1]) ? $value : '';
}
function eventdesk_clean_format($value) {
    return in_array($value, array('In person', 'Online', 'Hybrid'), true) ? $value : 'In person';
}
function eventdesk_clean_url($value) { return esc_url_raw($value, array('http','https')); }
function eventdesk_fields() {
    return array('eventdesk_date'=>'Date (YYYY-MM-DD)', 'eventdesk_location'=>'Location',
        'eventdesk_format'=>'Format', 'eventdesk_registration'=>'External registration URL');
}
add_action('init', function() {
    register_post_type('eventdesk_event', array(
        'labels'=>array('name'=>'EventDesk Events','singular_name'=>'Event','add_new_item'=>'Add Event'),
        'public'=>true, 'show_in_rest'=>true, 'rest_base'=>'eventdesk-events',
        'menu_icon'=>'dashicons-calendar-alt',
        'supports'=>array('title','editor','excerpt','custom-fields'),
        'has_archive'=>false
    ));
    foreach(eventdesk_fields() as $key=>$label) {
        $clean = 'sanitize_text_field';
        if ($key==='eventdesk_date') { $clean='eventdesk_clean_date'; }
        if ($key==='eventdesk_format') { $clean='eventdesk_clean_format'; }
        if ($key==='eventdesk_registration') { $clean='eventdesk_clean_url'; }
        register_post_meta('eventdesk_event',$key,array(
            'type'=>'string','single'=>true,'show_in_rest'=>true,'sanitize_callback'=>$clean,
            'auth_callback'=>function($allowed,$key,$post_id) { return current_user_can('edit_post',$post_id); }
        ));
    }
});
add_action('add_meta_boxes',function() {
    add_meta_box('eventdesk-details','Event details','eventdesk_render_fields','eventdesk_event');
});
function eventdesk_render_fields($post) {
    wp_nonce_field('eventdesk_save','eventdesk_nonce');
    foreach(eventdesk_fields() as $key=>$label) {
        $value=get_post_meta($post->ID,$key,true);
        echo '<p><label for="'.esc_attr($key).'">'.esc_html($label).'</label><br>';
        if($key==='eventdesk_format') {
            echo '<select id="'.esc_attr($key).'" name="'.esc_attr($key).'">';
            foreach(array('In person','Online','Hybrid') as $format) {
                echo '<option value="'.esc_attr($format).'" '.selected($value,$format,false).'>'.esc_html($format).'</option>';
            }
            echo '</select>';
        } else {
            $type=$key==='eventdesk_date' ? 'date' : ($key==='eventdesk_registration' ? 'url' : 'text');
            echo '<input class="widefat" type="'.esc_attr($type).'" id="'.esc_attr($key).'" name="'.esc_attr($key).'" value="'.esc_attr($value).'">';
        }
        echo '</p>';
    }
    echo '<p>Use the Excerpt panel for the short directory description. Dates have day-level precision; use the event body for time and timezone.</p>';
}
add_action('save_post_eventdesk_event',function($post_id) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) { return; }
    if (wp_is_post_revision($post_id) || !current_user_can('edit_post',$post_id)) { return; }
    if (!isset($_POST['eventdesk_nonce']) || !is_string($_POST['eventdesk_nonce']) ||
        !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['eventdesk_nonce'])),'eventdesk_save')) { return; }
    foreach(eventdesk_fields() as $key=>$label) {
        if(isset($_POST[$key]) && is_string($_POST[$key])) {
            update_post_meta($post_id,$key,wp_unslash($_POST[$key]));
        }
    }
});
add_shortcode('eventdesk',function() {
    static $rendered=false;
    if($rendered) { return '<p>EventDesk is already displayed on this page.</p>'; }
    $rendered=true;
    $base=plugin_dir_url(__FILE__).'assets/';
    wp_enqueue_style('eventdesk-style',$base.'style.css',array(),'0.1.0');
    wp_enqueue_script('eventdesk-angular',$base.'angular.min.js',array(),'1.8.3',true);
    wp_enqueue_script('eventdesk-core',$base.'core.js',array(),'0.1.0',true);
    wp_enqueue_script('eventdesk-app',$base.'app.js',array('eventdesk-angular','eventdesk-core'),'0.1.0',true);
    wp_localize_script('eventdesk-app','EventDeskConfig',array('demo'=>false,'endpoint'=>rest_url('wp/v2/eventdesk-events')));
    ob_start(); include __DIR__.'/view.php'; return ob_get_clean();
});
