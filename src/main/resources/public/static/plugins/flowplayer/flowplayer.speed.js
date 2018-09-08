/**
 * Created by yancongliu on 2016/11/3.
 */
(function () {
    'use strict';
    var extension = function(flowplayer) {
        flowplayer(function(api, root) {
            var bean = flowplayer.bean
                ,  common = flowplayer.common

            //only register once
            if (api.pluginSpeedSelectorEnabled) return;
            api.pluginSpeedSelectorEnabled = true;

            if (!flowplayer.support.inlineVideo) return; // No inline video

            var currentSpeed = 1;
            bean.on(root, 'click', '.fp-speed-selector li', function(ev) {
                var elem = ev.currentTarget;
                if (!common.hasClass(elem, 'active')) {
                    var speed = elem.getAttribute('data-speed');
                    currentSpeed = speed;
                    api.speed(currentSpeed);
                    // api.trigger('speed-change', [api, quality]);
                }
            });

            api.on('load', function(ev, api, video) {
                api.conf.speedEnable = video.speedEnable || api.conf.speedEnable || false;
                api.speeds = video.speeds || api.conf.speeds || [];
            }).on('ready', function(ev, api, video) {
                initView(api, video);
            }).on('unload', function() {
                removeAllSpeedClasses();
                common.removeNode(common.find('.fp-speed-selector', root)[0]);

            }).on('speed', function (ev, api, video) {
                initView(api, video);
            });

            function removeAllSpeedClasses() {
                // if (!api.speeds || !api.speeds.length) return;
                // api.speeds.forEach(function(quality) {
                //     common.removeClass(root, 'quality-' + quality);
                // });
            }

            function initView(api, video) {
                if(!api.conf.speedEnable){
                    return;
                }
                var ui = common.find('.fp-ui', root)[0];
                common.removeNode(common.find('.fp-speed-selector', ui)[0]);
                if (api.speeds.length < 2) return;
                var selector = common.createElement('ul', {'class': 'fp-speed-selector'});
                ui.appendChild(selector);
                api.speeds.forEach(function(q) {
                    selector.appendChild(common.createElement('li', {'data-speed': q, 'class': q == currentSpeed ? 'active': ''}, q+'X'));
                });
            }

        });
    };

    if (typeof module === 'object' && module.exports) module.exports = extension;
    else if (window.flowplayer) extension(window.flowplayer);
}());
