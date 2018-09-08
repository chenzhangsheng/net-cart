/**
 * Created by yancongliu on 2016/10/20.
 */
// 原则上该Controller里只操作此view下的DOM
(function (window, $) {
    var _viewEl = '#auditStatisticsView';
    var _tableEl = '#statiticsTable';
    var _view;
    var _app;
    var _scope;
    
    var now = new Date();
    //搜索条件
    var s_dateBegin = (new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0,0,0)).getTime()/1000;
    var s_dateEnd = (new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23,59,59)).getTime()/1000;
    
    var dateTime = (new Date(s_dateBegin*1000)).format('yyyy-MM-dd') + ' 至  ' + (new Date(s_dateEnd*1000)).format('yyyy-MM-dd');
    
    // 露出的Controller对象提供init初始化
    // 接收其控制范围的view, 可以是CSS选择器字符串、DOM或jQuery对象
    window.auditStatisCtrl = {
        init: function () {
            _view = $(_viewEl);
            initView();
            setTimeout(initEvent, 0); // 排队等待试图渲染完
        },
    };

    var dataRangeConfig = $.extend({}, window.dataRangeConf, {
        autoUpdateInput: false,
        autoApply: false,
        ranges:{
        	'今日':[moment(), moment()],
        	'昨日': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            '最近七日': [moment().subtract(6, 'days'), moment()]
        },
        locale: {
            format: 'YYYY-MM-DD',
            separator: ' 至 ',
            applyLabel: '确定',
            cancelLabel: '清除',
            fromLabel: '起始时间',
            toLabel: '结束时间',
            customRangeLabel: '自定义',
            daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            firstDay: 1
        }
    });
    
    function inner(sel) {
        return _view.find(sel);
    }

    function initScope() {
        if (!_scope) {
        	_scope = {};
        	
        }
        _scope.auditStatus = [];
//        _scope.dateBegin = 0;
//        _scope.dateEnd = 0;
        s_dateBegin = 0;
        s_dateEnd = 0;
    }

    function initView() {
        initScope();
        _app = new Vue({
            el: _viewEl,
            data: _scope,
            computed: {},
            methods: {
                search: function (e) {
                    search();
                }
            }
        });
        
        inner('input[name="daterange"]').daterangepicker(dataRangeConfig, function (start, end, label) {});
        inner('input[name="daterange"]').on('apply.daterangepicker', function(ev, picker) {
            $(this).val(picker.startDate.format('YYYY-MM-DD') + ' 至 ' + picker.endDate.format('YYYY-MM-DD'));
            s_dateBegin = picker.startDate.unix();
            s_dateEnd = picker.endDate.unix();
        });
        
        inner('input[name="daterange"]').on('cancel.daterangepicker', function (ev, picker) {
            $(this).val('');
            s_dateBegin = 0;
            s_dateEnd = 0;
        });

    }

    function initEvent() {
        inner('#auditLogs').on('click', function () {
            initScope();
        });
    	getAuditStatus();
        inner('#btn-search').on('click', search);
    }

    function getAuditStatus() {
        $.getJSON('auditor/statistics?timeBg='+s_dateBegin+'&timeEnd='+s_dateEnd, function(result) {
            if (result.err != 0) {
                $.smkAlert({
                    text: '获取审核错误:' + result.msg,
                    type: 'danger'
                });
                return;
            }
            _scope.auditStatus = result.data;
//            _scope.dateBegin = s_dateBegin;
//            _scope.dateEnd = s_dateEnd;
        });
    }
    
    function search() {
    	getAuditStatus();
        _dt.ajax.reload();
    }

}(window, jQuery));