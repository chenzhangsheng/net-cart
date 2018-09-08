/**
 * Created by yancongliu on 2016/10/20.
 */
// 原则上该Controller里只操作此view下的DOM
(function (window, $) {
    var _viewEl = '#logsView';
    var _tableEl = '#logsTable';
    var _view;
    var _app;
    var _scope;
    //搜索条件
    var s_dateBegin = 0;
    var s_dateEnd = 0;
    // 露出的Controller对象提供init初始化
    // 接收其控制范围的view, 可以是CSS选择器字符串、DOM或jQuery对象
    window.logsCtrl = {
        init: function () {
            _view = $(_viewEl);
            initView();
            setTimeout(initEvent, 0); // 排队等待试图渲染完
        },
    };

    function inner(sel) {
        return _view.find(sel);
    }

    function initScope() {
        if (!_scope) {
            _scope = {};
            _scope.user = window.user;
        }
        _scope.logs = [];
        _scope.search = {
            userName: null
        };
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
        _dtSettings = {
            // scrollX: true,
            aLengthMenu: [15, 30, 50, 100],
            paging: true,
            searching: false,
            ordering: false,
            iDisplayLength: 15,
            serverSide: true,
            // processing:true,
            language: window.jqTableLange,
            columns: [
                {"data": "userName"},
                {"data": "operate"},
                {"data": "content"},
                {"data": "ip"},
                {"data": "createTime"},
            ],
            columnDefs: [
                {
                    targets: [4],
                    orderable: false,
                    render: function (data, type, full, meta) {
                        if (data)
                            return new Date(parseInt(data)).format('yyyy-MM-dd hh:mm');
                        else
                            return '';
                    }
                },
            ],
            ajax: function (data, callback, settings) {
                prg('加载列表中...');
                var body = {
                    userName: _scope.search.userName,
                    timeBg: s_dateBegin,
                    timeEnd: s_dateEnd,
                    pageIndex: (data.start / data.length),
                    pageSize: data.length
                };
                $.ajax({
                    url: 'sysLogs',
                    type: 'GET',
                    dataType: 'json',
                    data: body,
                    success: function (result) {
                        hanleSearchResult(result, callback);
                    }
                });
            }
        };
        _dt = inner(_tableEl).DataTable(_dtSettings);
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
        inner('#logsHome').on('click', function () {
            initScope();
        });
        inner('#btn-search').on('click', search);
    }

    function hanleSearchResult(result, callback) {
        prgEnd();
        var json = {
            recordsTotal: 0,
            recordsFiltered: 0,
            data: []
        };
        if (!result || result.err != 0) {
            prgEnd();
            $.smkAlert({
                text: '加载列表失败：' + result.msg,
                type: 'warning',
                position: 'bottom-right',
                time: 10,
            });
            callback(json);
            return;
        } else {
            var jsonResult = result.data;
            json.recordsTotal = jsonResult.totalElements;
            json.recordsFiltered = json.recordsTotal;
            json.data = jsonResult.content;
            callback(json);
        }
    }


    function search() {
        _dt.ajax.reload();
    }

}(window, jQuery));