/* Shared data boundary: REST responses are treated as untrusted input. */
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.EventDeskCore = factory();
}(typeof window !== 'undefined' ? window : this, function() {
  'use strict';
  function safeUrl(value) {
    try { var u = new URL(value); return /^https?:$/.test(u.protocol) && !u.username && !u.password ? u.href : ''; }
    catch (_) { return ''; }
  }
  function validDay(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return false;
    var d = new Date(s + 'T12:00:00Z');
    return !isNaN(d.getTime()) && d.toISOString().slice(0,10) === s;
  }
  function normalize(p, text) {
    var m = p.meta || {};
    return {id:p.id, title:text((p.title || {}).rendered || 'Untitled event'),
      description:text((p.excerpt || {}).rendered || ''),
      date: validDay(m.eventdesk_date) ? m.eventdesk_date : '',
      location:String(m.eventdesk_location || 'Location to be announced'),
      format:['In person','Online','Hybrid'].indexOf(m.eventdesk_format) >= 0 ? m.eventdesk_format : 'In person',
      registration:safeUrl(m.eventdesk_registration), link:safeUrl(p.link)};
  }
  function select(events, query, format, upcoming, today) {
    var q=(query || '').trim().toLowerCase();
    return events.filter(function(e) {
      return (!q || (e.title+' '+e.description+' '+e.location).toLowerCase().indexOf(q)>=0) &&
        (!format || e.format===format) && (!upcoming || (e.date && e.date>=today));
    }).sort(function(a,b) {return (a.date || '9999').localeCompare(b.date || '9999') || a.title.localeCompare(b.title);});
  }
  return {safeUrl:safeUrl, validDay:validDay, normalize:normalize, select:select};
}));
