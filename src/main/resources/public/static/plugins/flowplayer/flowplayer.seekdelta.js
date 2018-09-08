/**
 * Created by yancongliu on 2017/1/4.
 */
(function () {
    'use strict';
    var extension = function(flowplayer) {
        flowplayer(function(api, root) {
            var bean = flowplayer.bean
                ,  common = flowplayer.common

            //only register once
            if (api.pluginSeekSelectorEnabled) return;
            api.pluginSeekSelectorEnabled = true;

            if (!flowplayer.support.inlineVideo) return; // No inline video

            var currentSeekDelta = localStorage.currentSeekDelta
                    ? localStorage.currentSeekDelta
                    : 10; //
            currentSeekDelta = Number(currentSeekDelta);
            bean.on(root, 'click', '.fp-seek-selector li', function(ev) {
                var elem = ev.currentTarget;
                if (!common.hasClass(elem, 'active')) {
                    var seekDelta = Number(elem.getAttribute('data-seek'));
                    currentSeekDelta = seekDelta;
                    api.conf.currentSeekDelta = currentSeekDelta;
                    localStorage.currentSeekDelta = currentSeekDelta;
                    initView(api);
                    // api.trigger('speed-change', [api, quality]);
                }
            });

            api.on('load', function(ev, api, video) {
                api.conf.seekDeltaEnable = video.seekDeltaEnable || api.conf.seekDeltaEnable || false;
                api.seekDeltas = video.seekDeltas || api.conf.seekDeltas || [];
            }).on('ready', function(ev, api, video) {
                initView(api, video);
                api.conf.currentSeekDelta = currentSeekDelta;
            }).on('unload', function() {
                common.removeNode(common.find('.fp-seek-selector', root)[0]);
            });

            function initView(api, video) {
                if(!api.conf.seekDeltaEnable){
                    return;
                }
                var ui = common.find('.fp-ui', root)[0];
                common.removeNode(common.find('.fp-seek-selector', ui)[0]);
                var selector = common.createElement('ul', {'class': 'fp-seek-selector', 'title': '选择每次快进快退多少秒'});
                ui.appendChild(selector);
                api.seekDeltas.forEach(function(q) {
                    selector.appendChild(common.createElement('li', {'data-seek': q, 'class': q == currentSeekDelta ? 'active': ''}, q+'s'));
                });
            }

        });
    };

    if (typeof module === 'object' && module.exports) module.exports = extension;
    else if (window.flowplayer) extension(window.flowplayer);
}());
