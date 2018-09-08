/**
 * Created by yancongliu on 2016/10/20.
 */

// 原则上该Controller里只操作此view下的DOM
(function (window, $) {
    var now = new Date();
    var _viewName = '#vodsView';
    var _view;
    var _app;
    var _scope;
    var _flowPlayer;
    var _vodInfo;

    var _tmpLiveList = [];
    //搜索条件
    var s_cid = '';
    var s_fid = '';
    var s_cp = '';
    var s_status = 200;
    var s_dateBegin = (new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)).format('yyyy-MM-dd hh:mm:ss'); //默认当天0点
    var s_dateEnd = (new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)).format('yyyy-MM-dd hh:mm:ss');//默认当天24点

    // 露出的Controller对象提供init初始化
    // 接收其控制范围的view, 可以是CSS选择器字符串、DOM或jQuery对象
    window.vodsCtrl = {
        init: function () {
            _view = $(_viewName);
            initView();
        },
    };

    function inner(sel) {
        return _view.find(sel);
    }

    var convert = {
        convertVodStatus: function (v) {
            if (v >= 0 && v2sMap.vodStatusMap[v]) {
                return v2sMap.vodStatusMap[v];
            }
            else if (v >= 0 && (v >= 150 && v <= 179)) {
                return '压制失败';
            }
            else {
                return '';
            }
        },
        convertVodStatusBlock: function (v) {
            if (v >= 0 && v2sMap.vodStatusMap[v]) {
                return '<span class="vod-block-status">' + v2sMap.vodStatusMap[v] + '</span>';
            }
            else if (v >= 0 && (v >= 150 && v <= 179 && v!=155)) {
                return '<span class="vod-block-status">压制失败</span>';
            }
            else if(v==155){
                return '<span class="vod-block-status">无需压制</span>';
            }
            else {
                return '';
            }
        },
        convertVodFileStatus: function (v) {
            if (v >= 0 && v2sMap.vodFileStatusMap[v]) {
                return v2sMap.vodFileStatusMap[v];
            }
            else if (v >= 0 && (v >= 150 && v <= 179 && v!=155)) {
                return '压制失败';
            }
            else if(v==155){
                return '无需压制';
            }
            else {
                return '';
            }
        },
        convertVodFileStatusBlock: function (v) {
            if (v >= 0 && v2sMap.vodFileStatusMap[v]) {
                return '<span class="vod-block-status">' + v2sMap.vodFileStatusMap[v] + '</span>';
            }
            else if (v >= 0 && (v >= 150 && v <= 179)) {
                return '<span class="vod-block-status">压制失败</span>';
            }
            else {
                return '';
            }
        },
        convertQuqlityStr: function (v) {
            if (v >= 0 && v2sMap.encodeTmpMap[v]) {
                return v2sMap.encodeTmpMap[v];
            }
            else {
                return '';
            }
        },
        converColorAlert: function (v) {
            if (!v || v.indexOf('失败') == -1) return v;
            return '<label class="label-danger">' + v + '</label>'
        },
        convertVodTimeRange: function (v) {
            var arrow = '&nbsp;&nbsp;<i class="fa fa-long-arrow-right"></i>&nbsp;&nbsp;';
            var c = new Date(v.createTime);
            var u = new Date(v.updateTime);
            var r = c.format('yyyy-MM-dd hh:mm:ss');
            if (u.getFullYear() == c.getFullYear() && u.getMonth() == c.getMonth() && u.getDate() == c.getDate()) {
                r += arrow + u.format('hh:mm:ss');
            }
            else {
                r += arrow + u.format('MM-dd hh:mm:ss');
            }
            return r;
        },
        convertVodTimeLong: function (v) {
            var sec = Math.floor((v.updateTime - v.createTime) / 1000);
            var r = '';
            if (sec / 3600 >= 1)
                r += Math.floor(sec / 3600) + '小时';
            if ((sec % 3600) / 60 >= 1)
                r += Math.floor(((sec % 3600) / 60)) + '分';
            if (r == '' || sec % 60 >= 1)
                r += sec % 60 + '秒';
            return r;
        },
    };

    Vue.filter('vodStatusStr', convert.convertVodStatus);
    Vue.filter('vodFileStatusStr', convert.convertVodFileStatus);
    Vue.filter('vodStatusStrBlock', convert.convertVodStatusBlock);
    Vue.filter('vodFileStatusStrBlock', convert.convertVodFileStatusBlock);
    Vue.filter('vodFtStr', convert.convertQuqlityStr);
    Vue.filter('vodColorAlert', convert.converColorAlert);
    Vue.filter('vodTimeRange', convert.convertVodTimeRange);
    Vue.filter('vodTimeLong', convert.convertVodTimeLong);
    Vue.filter('isVodFileFail', function (prg) {
        return prg.toStatus && prg.toStatus >= 150 && prg.toStatus != 155 && prg.toStatus <= 179
            || prg.fromStatus >= 150 && prg.fromStatus != 155 && prg.fromStatus <= 179;
    });
    Vue.filter('vodFileFailClass', function (prg) {
        if( prg.toStatus && prg.toStatus >= 150 && prg.toStatus != 155 && prg.toStatus <= 179
            || prg.fromStatus >= 150 && prg.fromStatus != 155 && prg.fromStatus <= 179)
            return 'label-danger';
        else
            return '';
    });
    Vue.filter('isVodFileRepreload', function (prg) {
        return prg.toStatus&&prg.toStatus==190 || prg.fromStatus==190;
    });

    function initScope() {
        if (!_scope) {
            _scope = {};
            _scope.v2sMap = v2sMap;
            _scope.user = window.user;
        }
        _scope.showList = true;
        _scope.vodInfo = {};
        _scope.videoUrl = '';
        _scope.vodFileProgress = [{}];
        _scope.vodChannelStatus = [];
        _scope.vodFileStatus = [{}, {}, {}, {}];
        _scope.vodType = false;
    }

    function initView() {
        initScope();
        _app = new Vue({
            el:'#vodsView',
            data: _scope,
            computed: {
                cpNameText: function () {
                    return v2sMap.cpCodeMap[this.vodInfo.cpId] ? v2sMap.cpCodeMap[this.vodInfo.cpId] : "";
                },
                isAdmin: function () {
                    return $.inArray('ADMIN', this.user.roles) != -1;
                },
                isOps: function () {
                    return $.inArray('OPS', this.user.roles) != -1;
                },
            },
            methods: {
                backHome: backHome,
                search: search,
                rePreload: rePreload,
                reEncode: reEncode,
                refreshStatus:refreshStatus
            }
        });

        _dtSettings = {
            // scrollX: true,
            aLengthMenu: [10, 20, 50, 100],
            paging: true,
            searching: false,
            ordering: false,
            iDisplayLength: 10,
            serverSide: true,
            // processing:true,
            language: window.jqTableLange,
            columns: [
                {"data": "coverImg"},
                {"data": "videoTitle"},
                {"data": "channelId"},
                {"data": "fid"},
                {"data": "cpId"},
                // {"data": "createTime"},
                {"data": "updateTime"},
                {"data": "duration"},
                {"data": "vodStatusInt"},
            ],
            columnDefs: [
                {
                    targets: [0], orderable: false,
                    render: function (data, type, full, meta) {
                        if (data) {
                            var imgUrl = window.vodCoverUrl + data;
                            return '<img class="list-thumbnail" src="' + imgUrl + '">';
                        }
                        else {
                            return '<img class="list-thumbnail" src="static/img/default-cover.jpg">';
                        }
                    }
                },
                {
                    targets: [4], orderable: false,
                    render: function (data, type, full, meta) {
                        if (data)
                            return v2sMap.cpCodeMap[data] ? v2sMap.cpCodeMap[data] : "";
                        else
                            return "";
                    }
                },
                {
                    targets: [5], orderable: false,
                    render: function (data, type, full, meta) {
                        if (data)
                            return new Date(parseInt(data)).format('yyyy-MM-dd hh:mm');
                        else
                            return '';
                    }
                },
                {
                    targets: [6], orderable: false,
                    render: function (data, type, full, meta) {
                        return timeLongHuman(data);
                    }
                },
                {
                    targets: [7], orderable: false,
                    render: function (data, type, full, meta) {
                        var tmpStatus = convert.convertVodStatus(data);
                        if(tmpStatus.indexOf('失败') != -1){
                            return '<label class="label-danger">' + tmpStatus + '</label>'
                        }
                        else{
                            return tmpStatus;
                        }
                    }
                },
            ],
            ajax: function (data, callback, settings) {
                prg('加载中...');

                fillSearchVars();
                if (s_dateEnd - s_dateBegin > 7 * 24 * 3600) {
                    prgEnd();
                    $.smkAlert({text: '查询的时间长度不要超过7天.', type: 'warning', time: 10,})
                    return;
                }
                var body = {
                    channelId: s_cid,
                    fid: s_fid,
                    beginUpdateTime: s_dateBegin,
                    endUpdateTime: s_dateEnd,
                    pageNo: (data.start / data.length) + 1,
                    pageSize: data.length,
                    cpId: s_cp,
                    vodStatusInt: s_status,
                };
                // 如果有cid或fid， 则时间条件忽略
                if (body.fid || body.channelId) {
                    body.beginUpdateTime = null;
                    body.endUpdateTime = null;
                    body.cpId = null;
                    body.vodStatusInt = null;
                }
                $.ajax({
                    url: 'vods/list',
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
        };
        _dt = inner('#vodsTable').DataTable(_dtSettings);


        inner('input[name="daterange"]').daterangepicker(
            window.dataRangeConf,
            function (start, end, label) {
                s_dateBegin = start.format('YYYY-MM-DD HH:mm:ss');
                s_dateEnd = end.format('YYYY-MM-DD HH:mm:ss');
                console.log('New date range selected: ' + start.format('YYYY-MM-DD HH:mm:ss') + ' to ' + end.format('YYYY-MM-DD HH:mm:ss') + ' (predefined range: ' + label + ')');
                if (end.unix() - start.unix() > 7 * 24 * 3600) {
                    $.smkAlert({text: '查询的时间长度不要超过7天.', type: 'warning', time: 10,})
                }
            }
        );
    }

    function backHome() {
    	inner('#vodstatusTitle').html('<div id="vodstatusTitle" ><i class="fa fa-youtube-play fa-2x"></i><h2 class="inline">点播状态</h2></div>');
        initScope();
        try{
            _flowPlayer.shutdown();;
        }catch(ignore){}
    }

    var v2sMap = {
        vodStatusMap: {
            0: '创建',
            50: '上传中',
            99: '重传中',
            101: '待压制',
            102: '压制中',
            106: '待审核',
            107: '审核中',
            111: '待分发',
            112: '分发中',
            116: '待回调',
            150: '压制失败', // 150 to 179
            180: '审核不通过',
            190: '分发失败',
            191: '回调失败',
            200: '可播放',
            210: '入epg中',
            211: '入epg失败',
            212: '入epg成功',
            214: 'CDN删除失败',
            215: 'CDN删除成功',
        },
        vodFileStatusMap: {
            99: '重传中',
            101: '待压制',
            102: '压制中',
            103: '压制成功	',
            111: '待分发',
            112: '分发中',
            113: '分发成功	',
            150: '压制失败', // 150 to 179
            190: '分发失败	',
            200: '可播放',
            214: 'CDN删除失败',
            215: 'CDN删除成功',
        },
        vodFileFailReason: {
            150: "",
            151: "任务格式错误",
            152: "字幕文件下载失败",
            153: "logo文件下载失败",
            154: "xml文件格式化错误",
            155: "素材码率过低",
            156: "没有指定素材文件",
            157: "视频下载失败",
            158: "视频下载超时",
            159: "视频md5校验错误",
            160: "生成成片失败",
            161: "成片mediaInfo更新失败",
            162: "无法删除成片文件同名文件",
            163: "无法重命名成片文件",
            164: "生成ipk文件失败",
            165: "无法重命名ipk文件",
            166: "ipk文件上传失败",
            167: "生成截图失败",
            168: "上传截图失败",
            169: "drag检查失败",
            170: "drag生成失败",
            171: "删除drag文件同名文件失败",
            172: "无法重命名drag文件",
            173: "drag上传失败",
            174: "drag上传超时",
            175: "成片服务器连接超时",
            176: "成片文件上传失败",
            177: "成片文件上传azure失败",
            178: "切分成片文件失败",
            179: "汇报特征码信息失败"
        },
        cpCodeMap: {
            100: "pgc",
            995: "1717玩",
            996: "PP云",
            997: "爱播",
            1000: "私有云",
        },
        encodeTmpMap: {1: "流畅360P", 2: "高清480P", 3: "超清720P", 4: "蓝光1080P"},
        ftMap: {0: "流畅", 1: "高清", 2: "超清", 3: "蓝光"},
        ftStrMap: {"流畅": 0, "高清": 1, "超清": 2, "蓝光": 3},
    };

    var defaultQuality = "流畅";
    var qualities = ["流畅", "高清", "超清", "蓝光"];

    function hanleSearchResult(result, callback) {
        var json = {recordsTotal: 0, recordsFiltered: 0, data: []};
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
            json.data = result.data.page_list;
            _tmpLiveList = json.data;
            callback(json);
        }
        setTimeout(function () {
            inner('#vodsTable tbody tr').unbind().on('click', function () {
                var cid = $($(this).find('td')[2]).text();
                inner('#vodstatusTitle').html('<div id="vodstatusTitle" ><i class="fa"></i><h2 class="inline">返回点播状态</h2></div>');
                showDetail(cid);
            });
        }, 0)
    }


    function showDetail(cid) {
        var vodInfo;
        for (var i = 0; i < _tmpLiveList.length; i++) {
            if (_tmpLiveList[i].channelId == cid) {
                vodInfo = _tmpLiveList[i];
                break;
            }
        }

        console.log('open vod:');
        console.log(vodInfo);

        _scope.vodInfo = vodInfo;

        getVodChannelStatus(cid);
        getVodFileStatus(cid);

        inner('#vodsPlayerCon').html('<div id="vodsPlayer"  style="margin-top: 10px;margin-bottom: 10px;"></div>');
        var coverImg = window.vodCoverUrl + vodInfo.coverImg;
        inner('#vodsPlayer').css('background-image', 'url(' + coverImg + ')');

        if (vodInfo.reviewUrl) {
            _scope.videoUrl = vodInfo.reviewUrl;
            _flowPlayer = flowplayer('#vodsPlayer', {
                clip: {
                    sources: [{
                        type: "video/mp4",
                        src: _scope.videoUrl
                    }],
                    speedEnable: true,
                    speeds: ['1', '2', '4'],
                    qualities: qualities,
                    defaultQuality: defaultQuality,
                }
            });
        }
        else {
            _scope.videoUrl = '';
            console.log(cid + '频道信息里无播放地址');
            _flowPlayer = flowplayer('#vodsPlayer', {
                clip: {
                    sources: [{
                        type: "video/mp4"
                    }],
                    speedEnable: true,
                    speeds: ['1', '2', '4'],
                    qualities: qualities,
                    defaultQuality: defaultQuality,
                }
            });
            // 频道信息里无默认播放地址的 处于可播放状态的视频，请求接口获取
            if(_scope.vodInfo.vodStatusInt >= 200) {
                getReviewUrl(_scope.vodInfo.channelId, 0, function (result) {
                    reloadViedo(_flowPlayer, result, 0, false);
                });
            }
        }
        onQualityChange(_flowPlayer);
        _flowPlayer.on('shutdown', function (e, api) {
            inner('#vodsPlayer video').attr('src', ''); //避免原生的html5播放继续下载视频文件
            inner('#vodsPlayer').remove();              //清空页面元素， 好下次切回该页面时重新创建播放器
        });

        _scope.showList = false;
        isCanRefresh(cid);
    }

    function getVodChannelStatus(cid) {
        $.getJSON('vods/' + cid + '/channelStatusLog', function (result) {
            if (!result || result.err != 0 || !result.data) {
                console.log('get vod channel status log error, result:');
                console.log(result);
                if (result.err) {
                    $.smkAlert({text: cid + '获取视频压制日志失败:' + err.msg, type: 'warning'});
                }
                else {
                    $.smkAlert({text: cid + '获取视频压制日志失败', type: 'warning'});
                }
                return;
            }
            _scope.vodChannelStatus = result.data;
        });
    }

    function getVodFileStatus(cid) {
        $.getJSON('vods/' + cid + '/filesStatusLog', function (result) {
            if (!result || result.err != 0 || !result.data) {
                console.log('get vod file status log error, result:');
                console.log(result);
                if (result.err) {
                    $.smkAlert({text: cid + '获取子任务日志失败:' + err.msg, type: 'warning'});
                }
                else {
                    $.smkAlert({text: cid + '获取子任务日志失败', type: 'warning'});
                }
                return;
            }

            _scope.vodFileProgress = [];
            // 按压制模板1到4 分为四个数组
            var arr = [[], [], [], []];
            for (var i = 0; i < result.data.length; i++) {
                if (result.data[i].encodeTemplate < 1 || result.data[i].encodeTemplate > 4) {
                    console.log(result.data[i]);
                    $.smkAlert({text: '状态应在1～4之间'});
                    continue;
                }
                arr[result.data[i].encodeTemplate - 1].push(result.data[i]);
            }
            _scope.vodFileStatus = arr;
            arr[0].length > 0 && _scope.vodFileProgress.push(arr[0][arr[0].length - 1]);
            arr[1].length > 0 && _scope.vodFileProgress.push(arr[1][arr[1].length - 1]);
            arr[2].length > 0 && _scope.vodFileProgress.push(arr[2][arr[2].length - 1]);
            arr[3].length > 0 && _scope.vodFileProgress.push(arr[3][arr[3].length - 1]);
        });
    }

    function fillSearchVars() {
        s_cid = inner('#cidInput').val();
        s_fid = inner('#fidInput').val();
        s_cp = inner('#cpSel').val();
        s_status = inner('#statusSel').val();
    }

    function onQualityChange(flowPlayerApi) {
        flowPlayerApi.on('quality-change', function (ev, api, quality) {
            var currentTime = api.finished ? 0 : api.video.time;
            var ft = v2sMap.ftStrMap[quality];
            getReviewUrl(_scope.vodInfo.channelId, ft, function (result) {
                reloadViedo(flowPlayerApi, result, currentTime);
            });
        })
    }

    function getReviewUrl(cid, ft, callback) {
        $.getJSON('vods/' + cid + '/reviewurl?ft=' + ft, function (urlResult) {
            if(urlResult.err != 0){
                if(urlResult.err == 404)
                    $.smkAlert({text: cid + '该视频无【' + v2sMap.ftMap[ft] + '】码率播放地址'});
                else
                    $.smkAlert({text: cid + '未获取到码率【'+ v2sMap.ftMap[ft] + '】的播放地址'});
                return;
            }
            _scope.videoUrl = urlResult.data;
            callback(_scope.videoUrl);
        });
    }

    function reloadViedo(api, videoUrl, resumTime, autoplay) {
        autoplay = !!autoplay;
        api.load({
                autoplay: autoplay,
                speeds:['1', '2', '4'],
                defaultQuality: defaultQuality,
                qualities: qualities,
                sources: [
                    {
                        type: "video/mp4", src: videoUrl
                    }]
            }, function () {
                api.finished = false;
                if (resumTime && !api.live) {
                    api.seek(resumTime, function () {
                        api.resume();
                    });
                }
                if(!autoplay) {
                    api.pause();
                }
            }
        );
    }

    function search() {
        _dt.ajax.reload();
    }

    function refreshStatus(cid){
         var url = 'vods/' + cid + '/refreshStatus';
         $.ajax({
             url: url,
             type: 'POST',
             dataType: 'json',
             success: function (result) {
            	 if(result.err==0){
            		 showDetail(cid);
            		 $.smkAlert({text: '请求成功！'}); 
            	 }else{
            		 $.smkAlert({text: result.msg});
            	 }
                
                 prgEnd();
             }
         });
    }
    
    function isCanRefresh(cid){
    	if(cid>150000000){
    		_scope.vodType = true;
    	}
    }
    
    function rePreload(cfid) {
        $.smkConfirm({
                text: '确定重新分发？',
                accept: '确定',
                cancel: '取消'
            },
            function (res) {
                if(!res)return;

                prg('请求中...');
                var url = 'ops/channelFile/' + cfid + '/preload';
                $.ajax({
                    url: url,
                    type: 'POST',
                    dataType: 'json',
                    success: function (result) {
                        $.smkAlert({text: '请求成功！'});
                        prgEnd();
                    }
                });

            });
    }

    function reEncode(cfid) {
        var cid = _scope.vodInfo.channelId;
        $.smkConfirm({
                text: '确定重新压制？',
                accept: '确定',
                cancel: '取消'
            },
            function (res) {
                if(!res)return;

                prg('请求中...');
                var url = 'ops/channelFile/' + cfid + '/encode?cid=' + cid;
                $.ajax({
                    url: url,
                    type: 'POST',
                    dataType: 'json',
                    success: function (result) {
                        prgEnd();
                        if (result.err == 0) {
                            $.smkAlert({text: '请求成功！'});
                        }
                        else {
                            $.smkAlert({text: '发生错误：' + result.msg, type: 'danger'});
                        }
                    }
                });
            }
        );

    }

}(window, jQuery));