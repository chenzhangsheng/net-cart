/**
 * Created by yancongliu on 2016/10/20.
 */
// 原则上该Controller里只操作此view下的DOM
(function(window, $) {
    var viewName = "#vodReviewConfView";
    var _view;
    var _app;
    var _scope;
    // 露出的Controller对象提供init初始化
    // 接收其控制范围的view, 可以是CSS选择器字符串、DOM或jQuery对象
    window.reviewCofCtrl = {
        init: function() {
            _view = $(viewName);
            initView();
            initEvent();
        },
    };
    //只查找作用范围内的DOM
    function inner(sel) {
        return _view.find(sel);
    }

    function initScope() {
        if (!_scope) {
            _scope = {};
        }
        _scope.reasons = [];
        _scope.reasonToAdd = '';
        _scope.rates = [];
    }

    function initView() {
        initScope();
        _app = new Vue({
            el: viewName,
            data: _scope,
            computed: {},
            methods: {
                showModify: function(item) {
                    $.each(_scope.reasons, function(i, r) {
                        r.modify = false;
                    })
                    item.oldReason = item.reason;
                    item.modify = true;
                },
                rateShowModify:function(rate){
                	$.each(_scope.rates, function(i, r) {
                        r.modify = false;
                    })
                    rate.oldMinRate = rate.minRate;
                	rate.oldMaxRate = rate.maxRate;
                	rate.modify = true;
                },
                cancelModify: function(item) {
                    item.reason = item.oldReason;
                    item.modify = false;
                },
                rateCancelModify:function(rate){
                	rate.modify = false;
                },
                modify: function(r) {
                    var url = 'audit/reasons/' + r.id;
                    $.post(url, {
                        reason: r.reason
                    }, function(result) {
                        if (result.err != 0) {
                            $.smkAlert({
                                text: '出错了：' + result.msg,
                                type: 'danger'
                            });
                        } else {
                            $.smkAlert({
                                text: '修改成功！'
                            });
                            loadUsers();
                        }
                    });
                    r.modify = false;
                },
                rateModify:function(r){
                    if(!r.minRate){
                        $.smkAlert({
                            text: '出错了：下限必须指定!',
                            type: 'danger'
                        });
                        return;
                    }
                	var url='audit/yellowrate/'+r.id;
                	$.post(url, {
                        /*min: document.getElementById("minRate"),*/
                		min: r.minRate,
                        max: r.maxRate
                    }, function(result) {
                        if (result.err != 0) {
                            $.smkAlert({
                                text: '出错了：' + result.msg,
                                type: 'danger'
                            });
                        } else {
                            $.smkAlert({
                                text: '修改成功！'
                            });
//                            loadUsers();
                        }
                    });
                    r.modify = false;
                },
                add: function(reason) {
                    var url = 'audit/reasons';
                    $.post(url, {
                        reason: reason
                    }, function(result) {
                        if (result.err != 0) {
                            $.smkAlert({
                                text: '出错了：' + result.msg,
                                type: 'danger'
                            });
                        } else {
                            $.smkAlert({
                                text: '添加成功！'
                            });
                            loadReasons();
                        }
                    });
                },
                del: function(r) {
                    $.smkConfirm({
                        text: '删除请谨慎！<br> 确定删除【' + r.reason + '】？',
                        accept: '确定',
                        cancel: '取消',                        
                    }, function(res) {
                        if(!res) return;                        
                        var url = 'audit/reasons/' + r.id;
                        $.ajax({
                            url: url,
                            type: 'DELETE',
                            dataType: 'json',
                            success: function(result) {
                                if (result.err != 0) {
                                    $.smkAlert({
                                        text: '出错了：' + result.msg,
                                        type: 'danger'
                                    });
                                } else {
                                    $.smkAlert({
                                        text: '删除成功！'
                                    });
                                    loadReasons();
                                }
                            },
                            error: function(xhr, textStatus, err) {
                                $.smkAlert({
                                    text: '出错了：' + err,
                                    type: 'danger'
                                });
                                console.log('add reason error, id:' + r.id);
                                console.log(err);
                            }
                        });
                    });
                }
            }
        });
    }

    function initEvent() {
        loadReasons();
        loadRates();
    }

    function loadReasons() {
        $.smkProgressBar({
            element: '#content',
            status: 'start',
            bgColor: 'rgba(250, 250, 250,.6)',
            barColor: '#3c763d',
            content: '加载列表中...'
        });
        $.get('audit/reasons', function(result) {
            $.smkProgressBar({
                status: 'end',
            });
            if (result.err != 0) {
                $.smkAlert({
                    text: '出错了：' + result.msg,
                    type: 'danger'
                });
            } else {
                var arr = [];
                for (var i = 0; i < result.data.length; i++) {
                    var item = $.extend(result.data[i], {
                        modify: false
                    });
                    arr.push(item);
                }
                _scope.reasons = arr;
            }
        })
    }
    
    function loadRates(){
        $.smkProgressBar({
            element: '#content',
            status: 'start',
            bgColor: 'rgba(250, 250, 250,.6)',
            barColor: '#3c763d',
            content: '加载列表中...'
        });
        $.get('audit/yellowrate/getall', function(result) {
            $.smkProgressBar({
                status: 'end',
            });
            if (result.err != 0) {
                $.smkAlert({
                    text: '出错了：' + result.msg,
                    type: 'danger'
                });
            } else {
                var arr = [];
                for (var i = 0; i < result.data.length; i++) {
                    var item = $.extend(result.data[i], {
                        modify: false
                    });
                    arr.push(item);
                }
                _scope.rates = arr;
            }
        })
    }
    
}(window, jQuery));