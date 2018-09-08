/**
 * Created by yancongliu on 2016/10/20.
 */

// 原则上该Controller里只操作此view下的DOM
(function (window, $) {
    var now = new Date();
    var _viewName = '#livesView';
    var _view;
    var _dt, _dtSettings;
    var _app;
    var _scope;
    var _flowPlayer;

    //用于设定Scope初始值，不额外赋值
    var _videoUrl = '';
    var _liveInfo = {};
    var _rtmpWatch = {channels:[{}]};
    var _live2Watch = {channels:[{}]};
    var _vmsStreamStatus = {
        stream_info:[{},{},{}],
        server_ip: {
            cutter_ip: null,
            dc_ip: null,
            rtmpgate_ip: null,
            vms_server_ip: null
        },
        server_report_status: {
            cutter_input_status: null,
            cutter_output_status: null,
            dc_report_status: null,
            rtmpgate_report_status: null
        },
        publish_url: null
    };

    var _tmpLiveList = [];
    //搜索条件
    var s_cid = '';
    var s_cp = '';
    var s_statuses = [];
    var s_limit = '';
    var s_dateBegin = (new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0,0,0)).getTime()/1000; //默认当天0点
    var s_dateEnd = (new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23,59,59)).getTime()/1000;//默认当天24点


    // 露出的Controller对象提供init初始化
    // 接收其控制范围的view, 可以是CSS选择器字符串、DOM或jQuery对象
    window.livesCtrl = {
        init:function() {
            _view = $(_viewName);
            initView();
            initEvent();
        },
    };

    function i(sel) {
        return _view.find(sel)
    }

    function initScope() {
        if(!_scope){
            _scope = {};
        }
        _scope.showList = true;
        _scope.liveInfo = _liveInfo;
        _scope.vmsStreamStatus = _vmsStreamStatus;
        _scope.live2Watch = _live2Watch;
        _scope.rtmpWatch = _rtmpWatch;
        _scope.videoUrl = _videoUrl;
    }

    function initView() {
        initScope();
        _app = new Vue({
            el: '#livesView',
            data: _scope,
            computed: {
                livestatusText: function () {
                    return vMap.liveStatusMap[this.liveInfo.status];
                },
                modeText: function () {
                    return vMap.modeMap[this.liveInfo.mode];
                },
                cpnameText: function () {
                    return vMap.cpMap[this.liveInfo.cpName];
                },
                rtmpStatusText: function () {
                    if(!this.rtmpWatch.channels || !this.rtmpWatch.channels[0]) return '';
                    return vMap.pushStatus[this.rtmpWatch.channels[0].streamstatus];
                },
                live2StatusText: function () {
                    if(!this.live2Watch.channels || !this.live2Watch.channels[0]) return '';
                    return vMap.pushStatus[this.live2Watch.channels[0].streamstatus];
                },
            }
        });

        i('input[name="daterange"]').daterangepicker(
            window.dataRangeConf,
            function (start, end, label) {
                s_dateBegin = start.unix();
                s_dateEnd = end.unix();
                console.log('New date range selected: ' + start.format('YYYY-MM-DD HH:mm:ss') + ' to ' + end.format('YYYY-MM-DD HH:mm:ss') + ' (predefined range: ' + label + ')');
                if (end.unix() - start.unix() > 7 * 24 * 3600) {
                    $.smkAlert({text: '查询的时间长度不要超过7天.', type: 'warning', time: 10,})
                }
            }
        );

        _dtSettings = {
            // scrollX: true,
            aLengthMenu: [10, 20, 50, 100],
            paging: true,
            searching: false,
            ordering: false,
            iDisplayLength: 10,
            serverSide:true,
            // processing:true,
            language:window.jqTableLange,
            columns: [
                {"data": "screenshotUrl"},
                {"data": "channelId"},
                {"data": "createTime"},
                {"data": "startTime"},
                {"data": "endTime"},
                {"data": "cpName"},
                {"data": "mode"},
                {"data": "expireMilliseconds"},
                {"data": "watchProtocols"},
                {"data": "status"},
                {"data": "streamStatus"},
            ],

            // ajax:{
            //     url:'lives/list',
            //     type: 'GET',
            //     data: function ( d ) { //查询参数
            //         console.log(d);
            //         return {page: d.start / d.length+1, pageSize: d.length};
            //     },
            //     dataFilter: function(result){ //查询结果过滤
            //         var json = {};//jQuery.parseJSON( result );
            //         json.recordsTotal = 100;//json.total;
            //         json.recordsFiltered = 100;//json.total;
            //         return JSON.stringify( json ); // return JSON string
            //     },
            //     dataSrc: function (json) {
            //         json.data = [{cid:2212, a:1,b:1,c:1,d:2},{cid:444, a:1,b:1,c:1,d:2},{cid:5555, a:1,b:1,c:1,d:2}];//json.list;
            //         return json.data;
            //     }
            // }

            columnDefs: [
                {
                    targets: [0], orderable: false,
                    render: function (data, type, full, meta) {
                        if (data)
                            return '<img class="list-thumbnail" src="' + data + '">';
                        else
                            return '<img class="list-thumbnail" src="static/img/default-cover.jpg">';
                    }
                },
                {
                    targets: [2,3,4], orderable: false,
                    render: function (data, type, full, meta) {
                        if(data)
                            return new Date(parseInt(data)).format('yyyy-MM-dd hh:mm');
                        else
                            return '';
                    }
                },
                {
                    targets: [5], orderable: false,
                    render: function (data, type, full, meta) {
                        if(data)
                            return vMap.cpMap[data] ? vMap.cpMap[data] : data;
                        else
                            return '';
                    }
                },
                {
                    targets: [6], orderable: false,
                    render: function (data, type, full, meta) {
                        if(data)
                            return vMap.modeMap[data] ? vMap.modeMap[data] : data;
                        else
                            return '';
                    }
                },
                {
                    targets: [7], orderable: false,
                    render: function (data, type, full, meta) {
                        if(data == -1 || data == '-1')
                            return '24小时';
                        else
                            return '限时';
                    }
                },
                {
                    targets: [9], orderable: false,
                    render: function (data, type, full, meta) {
                        if(data)
                            return vMap.liveStatusMap[data] ? vMap.liveStatusMap[data] : data;
                        else
                            return '';
                    }
                },
                {
                    targets: [10], orderable: false,
                    render: function (data, type, full, meta) {
                        if(data){
                            if(data == 'ok'){
                                return '<span class="label-success">'+vMap.pushStatus[data]+'</span>'
                            }
                            else if(data == 'error'){
                                return '<span class="label-danger">'+vMap.pushStatus[data]+'</span>'
                            }
                            else if(data == 'error'){
                                return vMap.pushStatus[data] ? vMap.pushStatus[data] : data;
                            }
                        }
                        return '';
                    }
                },
            ],
            ajax: function (data, callback, settings) {
                prg('加载中...');

                fillSearchVars();
                if(s_dateEnd - s_dateBegin > 7*24*3600){
                    prgEnd();
                    $.smkAlert({text:'查询的时间长度不要超过7天.', type:'warning', time: 10,})
                    return;
                }

                if(s_cid){
                    $.getJSON('lives/' + s_cid, function (result) {
                        prgEnd();
                        if(result.err != 0 || !result.data || !result.data.list || !result.data.list.length){
                            $.smkAlert({text: '获取视频信息失败', type: 'warning'});
                            return;
                        }
                        hanleSearchResult(result, callback);
                    });
                }
                else {
                    var body = {
                        create_time_begin: s_dateBegin,
                        create_time_end: s_dateEnd,
                        page: (data.start / data.length),
                        pageSize: data.length,
                        cp: s_cp,
                        status: s_statuses,
                        limitTime: s_limit
                    };
                    $.ajax({
                        url: 'lives/list',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            body: JSON.stringify(body)
                        },
                        success: function (result) {
                            hanleSearchResult(result, callback);
                        }
                    });
                }
            }
        };

        _dt = i('#liveTable').DataTable(_dtSettings);
    }

    function initEvent() {
        i('#livesHome').on('click', function () {
        	$('#liveStatusTitle').html('<div id="liveStatusTitle" ><i class="fa fa-youtube-play fa-2x"></i><h2 class="inline">直播状态</h2></div>');

            initScope();
            if(_flowPlayer)
                _flowPlayer.shutdown();
        });

        i('#btn-search').on('click', search);
    }

    var vMap = {
        liveStatusMap: {
            'notstart': '未开始',
            'init': '直播初始化',
            'preview': '直播预览',
            'living': '直播中',
            'pause': '暂停',
            'broken': '断流',
            'stopped': '已停止',
            'sysdeleted': '系统删除',
        },
        modeMap: {
            'unknown': '未知',
            'camera': '摄像头',
            'xsplit': '第三方软件',
            'rtmp': '拉流转播'
        },
        cpMap:{
            'pgc': 'pgc',
            'source_media': '媒资',
            '1717wan':'1717玩',
            'ppcloud': 'PP云',
            'aibo':'爱播',
            'private_cloud': '私有云',
        },
        pushStatus:{
            'error': '错误',
            'ok': '正常',
            'unknow': '未知',
        },
    };
    var onLiveStatus =  ['living','preview','pause', 'broken'];

    function search(event) {
        _dt.ajax.reload();
    }

    function hanleSearchResult(result, callback) {
        var json = {recordsTotal:0, recordsFiltered:0, data:[]};
        prgEnd();

        if (!result || result.err != 0) {
            _tmpLiveList = [];
            $.smkAlert({
                text: '加载列表失败：' + result.msg,
                type: 'warning',
                position: 'bottom-right',
                time: 10,
            });
            callback(json);
            return;
        }
        else {
            json.recordsTotal = result.data.total;
            json.recordsFiltered = json.recordsTotal;
            json.data = result.data.list;
            _tmpLiveList = json.data;
            callback(json);
        }
        setTimeout(function () {
            i('#liveTable tbody tr').unbind().on('click', function () {
                var cid = $($(this).find('td')[1]).text();
                var liveInfo;
                console.log('open cid:' + cid);
                for (var i = 0; i < _tmpLiveList.length; i++) {
                    if (_tmpLiveList[i].channelId == cid) {
                        liveInfo = _tmpLiveList[i];
                        break;
                    }
                }
                console.log(liveInfo);
                showDetail(liveInfo);
            });
        }, 0)
    }


    var defaultQuality = "流畅";
    var qualities = ["流畅", "高清", "超清", "蓝光", "原画"];
    function showDetail(liveInfo) {
        _scope.liveInfo = liveInfo;
        $('#liveStatusTitle').html('<div id="liveStatusTitle" ><i class="fa"></i><h2 class="inline">返回直播状态</h2></div>');
        $('#livesPlayerCon').html('<div id="livesPlayer"  class="flowplayer" style="margin-bottom: 3px;">' +
            '<div class="" style="padding-top: 56.25%;"></div></div>');

        if(_scope.liveInfo.screenshotUrl) {
            $('#livesPlayer').css('background-image', 'url(' + _scope.liveInfo.screenshotUrl + ')');
        }
        else {
            $('#livesPlayer').css('background-color', '#999999');
        }
       

        if ($.inArray(_scope.liveInfo.status, onLiveStatus) != -1) {
            //获取推流信息
            $.getJSON('lives/' + liveInfo.channelId + '/vmsStreamStatus', function (result) {
                console.log('vms stream status:');
                console.log(result);

                if (result.err != 0) {
                    $.smkAlert({text: '获取推流信息失败', type: 'warning'});
                    return;
                }
                _scope.vmsStreamStatus = result.data;
            });

            if(_scope.liveInfo.status != 'preview') {
                $.getJSON('lives/' + liveInfo.channelId + '/watch', function (result) {
                    console.log('watch:');
                    console.log(result);

                    if (result.err != 0) {
                        $.smkAlert({text: '获取播放信息失败', type: 'warning'});
                        return;
                    }
                    var watch = $.parseJSON(result.data.watch);
                    if(watch.err != 0){
                        $.smkAlert({text: '获取播放信息失败', type: 'warning'});
                        return;
                    }
                    watch = watch.data;
                    _scope.watchAuth = result.data.auth;

                    _scope.videoUrl = '';
                    _scope.live2Watch = null;
                    for (var i = 0; i < watch.medias.length; i++) {
                        _scope.rtmpWatch = watch.medias[i];

                        if (watch.medias[i].protocol == 'rtmp') {
                            var channel = watch.medias[i].channels[0];
                            _scope.videoUrl = 'rtmp://' + channel.addr[0] + channel.path + '/' + channel.name;
                            console.log('rtmp 播放地址：' + _scope.videoUrl);
                            console.log('播放auth：' + _scope.watchAuth);
                        }
                        else if (watch.medias[i].protocol == 'live2') {
                            _scope.live2Watch = watch.medias[i];
                        }
                    }

                    if(_scope.videoUrl){
                        _flowPlayer = flowplayer('#livesPlayer', {
                            clip: {
                                defaultQuality: defaultQuality,
                                qualities: qualities,
                                sources: [{
                                    type: "video/flash",
                                    src: _scope.videoUrl + '_1?' + _scope.watchAuth ,
                                }]
                            }
                        });
                        onQualityChange(_flowPlayer);
                        _flowPlayer.on('shutdown', function (e, api) {
                            $('#livesPlayerCon').html('');
                        });
                    }
                    else if(_scope.live2Watch) {  //hls 播放
                        var delay = _scope.live2Watch.delay;
                        var interval = _scope.live2Watch.interval;
                        var live2Channel = _scope.live2Watch.channels[0];
                        var liveUrl = 'http://' + live2Channel.addr[0] + live2Channel.path + '/'
                            + "/" + interval + "/" + delay + "/" + live2Channel.name + ".m3u8?" + _scope.watchAuth;
                        // 该系统使用vms允许的flash跨域站点域名，避免播放跨域阻挡的问题
                        // 或者，使用proxyUrl 通过自身的服务端代理访问m3u8和ts文件
                        // var urlEncode = encodeURIComponent(liveUrl);
                        // var proxyUrl = "m3u8Proxy?url=" + urlEncode + "&guid=" + live2Channel.name +
                        //     "&host=" + 'http://' + live2Channel.addr[0];
                        _flowPlayer = flowplayer('#livesPlayer', {
                            swf: 'static/plugins/flowplayer/flowplayer.swf',
                            swfHls:'static/plugins/flowplayer/flowplayerhls.swf',
                            splash: true,
                            embed: true,
                            clip: {
                                hlsjs: {
                                    smoothSwitching: false
                                },
                                live: true,
                                sources: [{
                                    type: "application/x-mpegurl",
                                    src: liveUrl,
                                }],
                                speedEnable: false,
                            }
                        }, function (e, api, video) {
                            console.log(video);
                        });
                    }
                });
            }
        }
        _scope.showList = false;
    }

    function onQualityChange(flowPlayerApi) {
        flowPlayerApi.on('quality-change', function (ev, api, quality) {
            if (!_scope.videoUrl) {
                $.smkAlert({text: '还未获取到播放信息...'})
                return;
            }

            var ft = '';
            switch (quality) {
                case '流畅':
                    ft = '_1';
                    break;
                case '高清':
                    ft = '_2';
                    break;
                case '超清':
                    ft = '_3';
                    break;
                case '蓝光':
                    ft = '_4';
                    break;
                case '原画':
                    ft = '';
                    break;
            }

            var lvlPlayUrl = _scope.videoUrl + ft + "?" + _scope.watchAuth;

            api.load({
                autoplay: true,
                defaultQuality: defaultQuality,
                qualities: qualities,
                sources: [
                    {
                        type: "video/flash", src: lvlPlayUrl
                    }]
            }, function () {
                api.finished = false;
            });

        });
    }

    function fillSearchVars() {
        s_limit = $('#timeTypeSel').val() == 'true' ? true : ($('#timeTypeSel').val() == 'false' ? false : null);
        s_cid = $('#cidInput').val();
        s_cp = $('#cpSel').val();
        s_statuses = [];
        $.each(i('#statusCkbxGrp input[type="checkbox"]'), function (i, item) {
            if(item.checked){
                var tmpArr = item.value.split(',');
                s_statuses = s_statuses.concat(tmpArr);
            }
        });
    }

}(window, jQuery));