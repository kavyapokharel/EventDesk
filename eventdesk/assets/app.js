(function() {
  'use strict';
  var cfg=window.EventDeskConfig || {};
  var app=angular.module('eventDesk', []);
  app.controller('EventsController', ['$http', function($http) {
    var vm=this, core=window.EventDeskCore;
    vm.demo=!!cfg.demo;vm.query='';vm.format='';vm.upcoming=false;vm.events=[];
    var now=new Date();
    vm.today=now.getFullYear()+'-'+('0'+(now.getMonth()+1)).slice(-2)+'-'+('0'+now.getDate()).slice(-2);
    function plain(html) {
      // Never insert remote markup into the visible DOM or compile it as Angular.
      var doc=new DOMParser().parseFromString(String(html),'text/html');
      Array.prototype.forEach.call(doc.querySelectorAll('script,style'),function(n){n.remove();});
      return (doc.body.textContent || '').replace(/\s+/g,' ').trim();
    }
    vm.visible=function(){return core.select(vm.events,vm.query,vm.format,vm.upcoming,vm.today);};
    vm.reset=function(){vm.query='';vm.format='';vm.upcoming=false;};
    vm.load=function() {
      vm.loading=true;vm.error='';vm.events=[];
      function page(n) {
        return $http.get(cfg.endpoint,{params:cfg.demo ? {} : {per_page:100,page:n},timeout:10000}).then(function(res){
          if (!Array.isArray(res.data)) throw new Error('Invalid event response.');
          vm.events=vm.events.concat(res.data.map(function(p){return core.normalize(p,plain);}));
          var pages=cfg.demo ? 1 : Number(res.headers('X-WP-TotalPages') || 1);
          if(n<pages && n<20) return page(n+1);
          if(pages>20) vm.note='Showing the first 2,000 events.';
        });
      }
      vm.note='';
      page(1).catch(function(){vm.events=[];vm.error='Events could not be loaded. Check the connection and try again.';})
        .finally(function(){vm.loading=false;});
    };
    vm.load();
  }]);
  angular.element(document).ready(function() {
    var root=document.getElementById('eventdesk-root');
    if(root) angular.bootstrap(root,['eventDesk']);
  });
}());
