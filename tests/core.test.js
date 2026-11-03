const test=require('node:test');const assert=require('node:assert/strict');
const c=require('../eventdesk/assets/core.js');
const rows=[{title:'Safety',description:'Training',location:'Hall',format:'Online',date:'2027-02-01'},
{title:'Meetup',description:'Coding',location:'Studio',format:'In person',date:'2026-01-01'},
{title:'TBA',description:'',location:'',format:'Online',date:''}];
test('rejects executable and credential-bearing links',()=>{for(const u of ['javascript:alert(1)','data:text/html,x','https://u:p@example.com','bad'])assert.equal(c.safeUrl(u),'');});
test('preserves an external HTTPS registration link',()=>assert.equal(c.safeUrl('https://example.com/register'),'https://example.com/register'));
test('validates leap days and rejects impossible dates',()=>{assert.equal(c.validDay('2028-02-29'),true);assert.equal(c.validDay('2027-02-29'),false);assert.equal(c.validDay('2027-13-01'),false);});
test('searches description and location case-insensitively',()=>assert.equal(c.select(rows,' STUDIO ','',false,'2027-01-01')[0].title,'Meetup'));
test('combines format and date filters',()=>assert.deepEqual(c.select(rows,'','Online',true,'2027-01-01').map(e=>e.title),['Safety']));
test('puts undated events last',()=>assert.deepEqual(c.select(rows,'','',false,'').map(e=>e.title),['Meetup','Safety','TBA']));
test('handles absent WordPress metadata',()=>{const e=c.normalize({id:1},String);assert.equal(e.date,'');assert.equal(e.registration,'');assert.equal(e.title,'Untitled event');});
test('returns no results for unmatched search',()=>assert.equal(c.select(rows,'nonexistent','',false,'').length,0));
