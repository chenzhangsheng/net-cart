/**
 * 该组件负责接受view的注册
 * changeUrl中负责取url的hash名加载相应的html视图填充到主节点
 * 并调用注册时的init方法
 * 下次再使用相同的view时，从缓存对象中获取
 */

// Example:
// $SPA.addModule('vods',{
//     view:"static/parts/vods.html",
//     init:function () {
//         window.vodsCtrl.init('#vodsView');
//     }
// });

(function (win, $) {
    win.$SPA = _SPA = {};               //global parameters
    _modules = {};
    _viewCache = {};      //cache for view pages
    _mainNode = {};      //div for loading views

    _SPA.setMainNode = function (nodId) {
        _mainNode = document.getElementById(nodId)
    };
    _SPA.addModule = function (moduleName, module) {
        _modules[moduleName] = module;
    };

    _SPA.changeUrl = function () {          //handle url change
        var url = location.hash.replace('#', '');
        if (url === '') {
            return;
            //url = 'home';           //default page
        }
        if (!_modules[url]) {
            return;
        }
        if (_viewCache[url]) {
            fillView(url, _viewCache[url]);
        }
        else {
            $.get(_modules[url].view, function (result) {
                _viewCache[url] = result;        //cache views to improve performance
                fillView(url, result);
            });
        }
    };

    function fillView(url, page) {
        _mainNode.innerHTML = page;
        var fn = _modules[url].init;
        if (fn && typeof fn === 'function') {
            fn();
        }
    }

})(window, jQuery);
