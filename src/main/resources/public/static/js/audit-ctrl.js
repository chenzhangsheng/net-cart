/**
 * Created by yancongliu on 2016/10/20.
 */
// 原则上该Controller里只操作此view下的DOM
(function(window, $) {
    var now = new Date();
    var _viewName = '#auditView';
    var _view;
    var _app;
    var _scope;
    var _flowPlayer;
    //搜索条件
    var s_status = ''; //'100,200,300'
    var s_dateBegin = 0; // = (new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)).getTime(); //默认当天0点
    var s_dateEnd = 0; // = (new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)).getTime();//默认当天24点
    var s_auditTimeBg = 0;
    var s_auditTimeEd = 0;
    var s_myGainTimeBg = 0;
    var s_myGainTimeEd = 0;
    
    //全局变量
    var isAll = true;
 
    // 露出的Controller对象提供init初始化
    // 接收其控制范围的view, 可以是CSS选择器字符串、DOM或jQuery对象
    window.auditCtrl = {
        init: function(view) {
            _view = $(_viewName);
            initView();
            setTimeout(initEvent, 0); // 排队等待试图渲染完
        },
        showDetail: showDetail,
        showNewDetail:showNewDetail,
        toggleAll: toggleAll,
        batchAudit: batchAudit,
        batchAuditSubmit: batchAuditSubmit,
        batchGainTask:batchGainTask,
        changeGainTaskStatus:changeGainTaskStatus
    };

    function inner(sel) {
        return _view.find(sel);
    }

    function initScope() {
        if (!_scope) {
            _scope = {};
            _scope.user = window.user;
            _scope.reviewReasons = [];
            _scope.panoUrl = '';
            initScopeSearch();
            // _scope.search.statuses.not_review = true;
        }
        _scope.showList = true;
        _scope.allList = isAll;
        _scope.vodInfo = {};
        _scope.channelInfo = {};
        _scope.panoImgs = [];
        _scope.reviewInfo = {};
        _scope.batchReview = {category: '', reviewResult: 'prompt', passed: ''};
        _scope.selBatchItems = [];
        _scope.reviewLogs = [];
        _scope.reviewPassed = '';
        _scope.videoUrl = '';
        _scope.v2sMap = v2sMap;
        s_dateBegin = 0;
        s_dateEnd = 0;
        s_myGainTimeBg = 0;
        s_myGainTimeEd = 0
    }
    function initScopeSearch() {
        _scope.search = {
            fid: null,
            name: '',
            cpname: '',
            reviewer: '',
            gainTaskStatus:'',
            statuses: {
                not_review: false,
                illegal: false,
                passed: false
            },
            rates:{
                high:false,
                middle:false,
                light:false,
                not:false
            }
        };
    }

    function initView() {
        initScope();
        _app = new Vue({
            el: '#auditView',
            data: _scope,
            computed: {
                isAdmin: function () {
                    return $.inArray('ADMIN', window.user.roles) != -1;
                },
                isOps: function () {
                    return $.inArray('OPS', window.user.roles) != -1;
                },
                isSingleAudit: function () {
                    return $.inArray('SINGLE_AUDIT', window.user.roles) != -1;
                },
                isBatchAudit: function () {
                    return $.inArray('BATCH_AUDIT', window.user.roles) != -1;
                },
            },
            methods: {
                postReviewInfo: postReviewInfo,

                enterSearch: function (e) {
                    search();
                },
                showMyFile: function(){
                	_scope.allList = false;
                	isAll = false;
                	search();
//                	window.location.assign( "#vod-audit");
                },
                showAllFile: function(){
                	_scope.allList = true;
                	isAll = true;
                	search();
//                	window.location.assign( "#vod-audit");
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
                {"data": "fid"},
                {"data": "cpname"},
                {"data": "names"},
                {"data": "createtime"},
                {"data": "review_time"},
                {"data": "avScanResult"},
                {"data": "reviewStatus"},
                {"data": "category"},
            ],
            columnDefs: [
                {
                    targets: [0],
                    orderable: false,
                    render: function (data, type, full, meta) {
                        return '<label class="checkbox-inline"><input id="fid" data-fid="' + data + '" type="checkbox" value="' + data + '" />' + data + '</label>';
                    }
                },
                {
                    targets: [1],
                    orderable: false,
                    render: function (data, type, full, meta) {
                        return v2sMap.cpMap[data] ? v2sMap.cpMap[data] : data;
                    }
                },
                {
                    targets: [2],
                    orderable: false,
                    render: function (data, type, full, meta) {
                        var fileName = data ? data : '（空）';
                        return  fileName;
                    }
                },
                {
                    targets: [3],
                    orderable: false,
                    render: function (data, type, full, meta) {
                        if (data) return new Date(parseInt(data)).format('yyyy-MM-dd hh:mm');
                        else return '';
                    }
                },
                {
                	targets:[4],
                	orderable:false,
                	render:function(data,type,full,meta){
                		if (data) return new Date(parseInt(data)).format('yyyy-MM-dd hh:mm');
                        else return '';
                	}
                },
                {
                    targets: [5],
                    orderable: false,
                    render: function (data, type, full, meta) {
                         return data?(data*100).toFixed(0) : '未完成';
                    }
                },
                {
                    targets: [6],
                    orderable: false,
                    render: function (data, type, full, meta) {
                        if (data == 100) {
                            return '<span class="">' + v2sMap.statusMap[data] + '</span>'
                        } else if (data == 200) {
                            return '<span class="label-danger">' + v2sMap.statusMap[data] + '</span>'
                        } else if (data == 300) {
                            return '<span class="label-success">' + v2sMap.statusMap[data] + '</span>'
                        } else {
                            return '<span class="label-success">' + v2sMap.statusMap[data] + '</span>';
                        }
                    }
                },
                
                {
                    targets: [7],
                    orderable: false,
                    render: function (data, type, full, meta) {
                    	 var isSingleAudit = $.inArray('SINGLE_AUDIT', window.user.roles) != -1;
                    	 var isAdmin = $.inArray('ADMIN', window.user.roles) != -1;
                    	 if ((full.reviewStatus == 100 && (isSingleAudit || isAdmin) )&&(data == 0 /*|| gainTaskstatus == 0*/)) {
                    		 return ' <a class="btn-link" href="javascript:auditCtrl.showDetail(' + full.fid + ',0);">审核</a> ';
                    	 }else if ((isSingleAudit || isAdmin) && (data == 1 || full.reviewStatus ==200  || full.reviewStatus ==300)) {
                    		 return  '<a class="btn-link" href="javascript:auditCtrl.showDetail(' + full.fid + ',0);">复核</a> ';
                    	 }else{
                    		 return '<a class="btn-link" href="javascript:auditCtrl.showDetail(' + full.fid + ',-1);">查看</a>';
                    	 }
                    }
                },
            
            ],
          
            ajax: function(data, callback, settings) {
            	fillSearchVars();
                prg('加载列表中...');
                if(isAll){
                	var body = {
                     name: _scope.search.name,
                     fid: _scope.search.fid ? Number(_scope.search.fid) : 0,
                     reviewer: _scope.search.reviewer,
                     cpname: _scope.search.cpname,
                     timeBg: s_dateBegin,
                     timeEnd: s_dateEnd,
                     auditTimeBg:s_auditTimeBg,
                     auditTimeEd:s_auditTimeEd,
                     statuses: s_status,
                     rateId: _scope.search.rate?_scope.search.rate : 0,
                     pageNo: data.start,
                     pageSize: data.length
                 };
                 $.ajax({
                     url: 'audit/files',
                     type: 'POST',
                     dataType: 'json',
                     data: body,
                     success: function(result) {
                         hanleSearchResult(result, callback);
                     }
                 });
               }else{
                	var body = {
                            /*name: _scope.search.name,*/
                            gainTimeBg: s_myGainTimeBg,
                            gainTimeEd: s_myGainTimeEd, 
                            fid: _scope.search.fid ? Number(_scope.search.fid) : 0,
                            statuses: s_status,
                            pageNo: data.start,
                            pageSize: data.length
                        };
                        $.ajax({
                            url: 'audit/myfiles',
                            type: 'POST',
                            dataType: 'json',
                            data: body,
                            success: function(result) {
                                hanleSearchResult(result, callback);
                            }
                        });
                }
            	
            }
        };
        _dt = inner('#auditTable').DataTable(_dtSettings);
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
        inner('input[name="daterange"]').daterangepicker(dataRangeConfig, function(start, end, label) {});
        inner('input[name="daterange"]').on('apply.daterangepicker', function(ev, picker) {
            $(this).val(picker.startDate.format('YYYY-MM-DD') + ' 至 ' + picker.endDate.format('YYYY-MM-DD'));
            s_dateBegin = picker.startDate.unix() * 1000;
            s_dateEnd = picker.endDate.unix() * 1000;
        });
        inner('input[name="daterange"]').on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('');
            s_dateBegin = 0;
            s_dateEnd = 0;
        });
       
	    inner('input[name="auditDaterange"]').daterangepicker(dataRangeConfig, function(start, end, label) {});
	    
	    inner('input[name="auditDaterange"]').on('apply.daterangepicker', function(ev, picker) {
    		$(this).val(picker.startDate.format('YYYY-MM-DD') + ' 至 ' + picker.endDate.format('YYYY-MM-DD'));
            s_auditTimeBg = picker.startDate.unix() * 1000;
            s_auditTimeEd = picker.endDate.unix() * 1000;
        });
	    
	  /*  if(s_auditTimeBg != 0 && s_auditTimeEd != 0){
	    	$("input[name='auditDaterange']").val(dateTime);
	    }*/
        
        inner('input[name="auditDaterange"]').on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('');
            s_auditTimeBg = 0;
            s_auditTimeEd = 0;
        });
        
        
        inner('input[name="gainDaterange"]').daterangepicker(dataRangeConfig, function(start, end, label) {});
        inner('input[name="gainDaterange"]').on('apply.daterangepicker', function(ev, picker) {
            $(this).val(picker.startDate.format('YYYY-MM-DD') + ' 至 ' + picker.endDate.format('YYYY-MM-DD'));
            s_myGainTimeBg = picker.startDate.unix();
            s_myGainTimeEd = picker.endDate.unix();
        });
        inner('input[name="gainDaterange"]').on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('');
            s_myGainTimeBg = 0;
            s_myGainTimeEd = 0;
        });

        if(!_scope.reviewReasons || _scope.reviewReasons.length==0){
            getReviewReasons();
        }
        if(!_scope.panoUrl){
            getPanoUrlPrefix();
        }
    }

    function initEvent() {
        inner('#backHome').on('click', function() {
            backHome();
        });
        inner('#btn-search').on('click', search);
    }
    function backHome() {
        inner('#vodAuditTitle').html('<div id="vodAuditTitle" onclick="changeTitle()"><i class="fa"></i><h2 class="inline">点播审核</h2></div>');

        initScope();
        try {
            _flowPlayer.shutdown();
        }catch (err){}
        
    }
    var v2sMap = {
        statusMap: {
            100: "未审核",
            200: "不通过",
            300: "已通过"
        },
        categoryMap: [
            {
                id: "industry_video",
                value: "工业视频"
            },
            {
                id: "adult_video",
                value: "A片"
            },
            {
                id: "private_video",
                value: "私人视频"
            },
            {
                id: "political_sensitive_video",
                value: "政治敏感"
            }
        ],
        encodeTmpMap: {
            1: "流畅360P",
            2: "高清480P",
            3: "超清720P",
            4: "蓝光1080P"
        },
        ftMap: {
            0: "流畅",
            1: "高清",
            2: "超清",
            3: "蓝光"
        },
        ftStrMap: {
            "流畅": 0,
            "高清": 1,
            "超清": 2,
            "蓝光": 3
        },
        cpMap: {
            'pgc': 'pgc',
            'source_media': '媒资',
            '1717wan': '1717玩',
            'ppcloud': 'PP云',
            'aibo': '爱播',
            'private_cloud': '私有云',
        },
    };
    var defaultQuality = "流畅";
    var qualities = ["流畅", "高清", "超清", "蓝光"];

    function hanleSearchResult(result, callback) {
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
            var jsonResult = $.parseJSON(result.data);
            json.recordsTotal = jsonResult.hits.total;
            json.recordsFiltered = json.recordsTotal; 
            var dataList = [];
            for (var i = 0; i < jsonResult.hits.hits.length; i++) {
                dataList.push(jsonResult.hits.hits[i]._source);
            }


            json.data = dataList;
            getReviewInfos(json, callback);
        }
    }
    
    function showNewDetail(userName/*,begin,end*/){
        initScopeSearch();
        _scope.search.statuses.not_review = true;
        _scope.search.statuses.illegal = true;
        _scope.search.statuses.passed = true;
        _scope.search.reviewer = userName;
    	window.location.assign( "#vod-audit");
    }
    
    function showDetail(fid, reviewFlag) {
        var vodInfo;
        var _tmpLiveList = _dt.data();
        for (var i = 0; i < _tmpLiveList.length; i++) {
            if (_tmpLiveList[i].fid == fid) {
                vodInfo = _tmpLiveList[i];
                break;
            }
        }
        if(reviewFlag == -1){
        	$("#submitReview").hide();
        }else{
        	$("#submitReview").show();
        }
                
        inner('#vodAuditTitle').html('<div id="vodAuditTitle" onclick="changeTitle()"><i class="fa"></i><h2 class="inline">返回点播审核</h2></div>');
       
        // console.log('open vod:');
        // console.log(vodInfo);
        _scope.vodInfo = vodInfo;
        inner('#vodsPlayerCon').html('<div id="vodsPlayer"  style="margin-top: 10px;margin-bottom: 10px;"></div>');
        if (_scope.vodInfo.cid) {
            $.getJSON('vods/' + _scope.vodInfo.cid, function(result) {
                // console.log('channel info:');
                // console.log(result);
                if (result.err != 0) {
                    $.smkAlert({
                        text: '获取视频频道信息失败。' + result.msg,
                        type: 'warnning'
                    })
                    return;
                }
                if (!result.data || !result.data.list || result.data.list.length == 0) {
                    $.smkAlert({
                        text: '未获取到视频频道信息。' + result.msg,
                        type: 'warning'
                    })
                    return;
                }
                _scope.channelInfo = result.data.list[0];
                var coverImg = window.vodCoverUrl + _scope.channelInfo.default_img;
                inner('#vodsPlayer').css('background-image', 'url(' + coverImg + ')');
                if (_scope.channelInfo.duration) {
                    // 全景图每6秒一张
                    var imgCount = Math.ceil(_scope.channelInfo.duration / (6 * 10 * 10));
                    imgCount = imgCount <= 0 ? 1 : (imgCount > 30 ? 30 : imgCount); //最多30张，至少一张
                    var imgArr = [];
                    for (var i = 0 ; i < imgCount; i++) {
                        imgArr.push(_scope.panoUrl + _scope.vodInfo.cid + '_6_10x10_' + i + '_720.jpg'); //线上
                        // imgArr.push("http://10.200.11.165:8065/get_image.php?vid="+_scope.vodInfo.cid+"&interval=6&cell=10x10&no="+i+"&h=720");
                    }
                    _scope.panoImgs = imgArr;
                }
            });
            getReviewUrl(_scope.vodInfo.cid, 0, function(result) {
                // console.log('review url:');
                // console.log(result);
                if (result) {
                    _scope.videoUrl = result;
                } else {
                    _scope.videoUrl = '';
                    console.log(cid + '无播放地址');
                }
                _flowPlayer = flowplayer('#vodsPlayer', {
                    clip: {
                        sources: [{
                            type: "video/mp4",
                            src: _scope.videoUrl
                        }],
                        speedEnable: true,
                        speeds: ['1', '2', '4'],
                        seekDeltaEnable: true,
                        seekDeltas: [2,5, 10, 30, 60],
                        qualities: qualities,
                        defaultQuality: defaultQuality,
                    }
                });
                onQualityChange(_flowPlayer);
                _flowPlayer.on('shutdown', function(e, api) {
                    inner('#vodsPlayer video').attr('src', ''); // 避免原生的html5播放继续下载视频文件
                    inner('#vodsPlayer').remove(); // 清空页面元素， 好下次切回该页面时重新创建播放器
                });
            });
        } else {
            $.smkAlert({
                text: '视频无对应的CID',
                type: 'warning'
            });
        }
        getReviewInfo(fid);
        getReviewLogs(fid);
        _scope.showList = false;
    }
    

    function fillSearchVars() {
        // console.log(_scope.search);
        s_status = '';
        if (_scope.search.statuses.not_review) {
            s_status += '100,';
        }
        if (_scope.search.statuses.illegal) {
            s_status += '200,';
        }
        if (_scope.search.statuses.passed) {
            s_status += '300,';
        }
        if (s_status.length > 2) {
            s_status = s_status.substr(0, s_status.length - 1);
        }
        
    }

    function onQualityChange(flowPlayerApi) {
        flowPlayerApi.on('quality-change', function(ev, api, quality) {
            var currentTime = api.finished ? 0 : api.video.time;
            var ft = v2sMap.ftStrMap[quality];
            getReviewUrl(_scope.vodInfo.cid, ft, function(result) {
                reloadViedo(flowPlayerApi, result, currentTime);
            });
        })
    }
    
    
    function getReviewUrl(cid, ft, callback) {
        $.getJSON('vods/' + cid + '/reviewurl?ft=' + ft, function(urlResult) {
            if (urlResult.err != 0) {
                if (urlResult.err == 404) $.smkAlert({
                    text: '该视频无【' + v2sMap.ftMap[ft] + '】码率播放地址'
                });
                else $.smkAlert({
                    text: '未获取到码率【' + v2sMap.ftMap[ft] + '】的播放地址'
                });
                return;
            }
            _scope.videoUrl = urlResult.data;
            callback(_scope.videoUrl);
        });
    }

    // 由于全文检索的审核信息更新不及时， 需要从公有云获取审核信息
    function getReviewInfos(res, callback) {
        var list = res.data;
        if(list.length == 0) {
            prgEnd();
            callback(res);
            return;
        }

        var fids = '';
        for(var i=0; i<list.length; i++) {
            fids += list[i].fid + ',';
        }
        if(fids != ''){
            fids = fids.substr(0, fids.length-1);
        }
        
        $.getJSON('audit/file/review', {fids:fids}, function(result) {
            prgEnd();
            if (result.err != 0) {
                $.smkAlert({
                    text: '获取审核信息失败:' + result.msg,
                    type: 'warning'
                });
                return;
            }
            var resultJson;
            try {
                resultJson = $.parseJSON(result.data);
            } catch (err) {
                $.smkAlert({
                    text: '获取审核信息失败',
                    type: 'warning'
                });
                return;
            }
            if (!resultJson || resultJson.length == 0) {
                log.info(fid + '未获取到审核信息');
                return;
            }
            var rList = resultJson;
            // 公有云的结果组合到全文检索的结果里
            for(var i=0; i<list.length; i++) {
                for(var j=0; j<rList.length; j++) {
                    if(list[i].fid == rList[j].fid) {
                        list[i].public_cloud_review = rList[j];
                        if(rList[j].reviewResult == 'passed'){
                            list[i].reviewStatus = 300; // 审核通过
                        }
                        else if (rList[j].reviewResult) {
                            list[i].reviewStatus = 200; // 审核未通过
                        }
                        else {
                            list[i].reviewStatus = 100; // 未审核
                        }
                        list[i].avScanResult = rList[j].avScanResult;
                        
                        list[i].category=rList[j].taskType;
                        
                        break;
                    }
                }
                
            
            }

            res.data = list;
            callback(res);
        });
    }


    function getReviewInfo(fid) {
        $.getJSON('audit/file/' + fid + '/review', function(result) {
            if (result.err != 0) {
                $.smkAlert({
                    text: '获取审核信息失败:' + result.msg,
                    type: 'warning'
                });
                return;
            }
            var resultJson;
            try {
                resultJson = $.parseJSON(result.data);
            } catch (err) {
                $.smkAlert({
                    text: '获取审核信息失败',
                    type: 'warning'
                });
                return;
            }
            if (!resultJson.data || !resultJson.data.list || resultJson.data.list.length == 0) {
                log.info(fid + '未获取到审核信息');
                return;
            }
            _scope.reviewInfo = resultJson.data.list[0];
            if (_scope.reviewInfo.reviewResult == 'passed') {
                _scope.reviewPassed = 'passed';
            } else if (_scope.reviewInfo.reviewResult) {
                _scope.reviewPassed = 'notPassed';
                inner('#reasonSel').attr('title', '原审核结果：' + _scope.reviewInfo.reviewResult)
            } else {
                _scope.reviewInfo.reviewResult = 'prompt';
            }
        });
    }

    function postReviewInfo() {
        var reviewResult = _scope.reviewPassed == 'passed' ? 'passed' : _scope.reviewInfo.reviewResult;
        if (!reviewResult || reviewResult == 'prompt') {
            $.smkAlert({
                text: '请选择审核结果后再提交！'
            });
            return;
        }
        if (!_scope.reviewInfo.category) {
            $.smkAlert({
                text: '请选择视频类别后再提交！'
            });
            return;
        }
        var categoryStr = '';
        $.each(v2sMap.categoryMap, function(i, item) {
            if (item.id == _scope.reviewInfo.category) {
                categoryStr = item.value;
            }
        });
        $.post('audit/file/' + _scope.vodInfo.fid + '/review', {
            category: _scope.reviewInfo.category,
            reviewResult: reviewResult,
            categoryStr: categoryStr
        }, function(result) {
            if (result.err != 0) {
                $.smkAlert({
                    text: '提交审核信息失败' + result.msg,
                    type: 'danger'
                });
            } else {
                $.smkAlert({
                    text: '提交审核成功！'
                });

                updateTableRow(_scope.vodInfo.fid, reviewResult);
                backHome();
            }
        });
    }



    function batchAudit() {
        _scope.selBatchItems = [];
        $('#auditTable tbody>tr>td:first-child input[type="checkbox"]').each(function (i, item) {
            if (item.checked) {
                _scope.selBatchItems.push($(item).data('fid'));
            }
        });
        if(_scope.selBatchItems.length == 0) {
            $.smkAlert({text:'请选择视频后再批量审核。'});
            return;
        }
        if(_scope.selBatchItems.length > 15) {
            $.smkAlert({text:'选择视频过多！'});
        }

        _scope.batchReview.category = '';
        _scope.batchReview.passed = '';
        _scope.batchReview.reviewResult = 'prompt';
        $('#batchModal').modal('show')
    }

/*    function searchMyFile(){
//    	initScope();
    	 inner('#btn-search').on('click', search);
    }*/
    
    function batchAuditSubmit() {
        var reviewResult = _scope.batchReview.passed == 'passed' ? 'passed' : _scope.batchReview.reviewResult;
        if (!reviewResult || reviewResult == 'prompt') {
            $.smkAlert({
                text: '请选择审核结果后再提交！'
            });
            return;
        }
        if (!_scope.batchReview.category) {
            $.smkAlert({
                text: '请选择视频类别后再提交！'
            });
            return;
        }
        var categoryStr = '';
        $.each(v2sMap.categoryMap, function(i, item) {
            if (item.id == _scope.batchReview.category) {
                categoryStr = item.value;
            }
        });
        var fids = '';
        $.each(_scope.selBatchItems, function (i, fid) {
            fids += fid + ',';
        });
        if(fids != '') {
            fids = fids.substr(0, fids.length-1);
        }
        else{
            $.smkAlert({text:'无选中的视频', type:'warning'});
            return;
        }

        $('#batchModal').modal('hide');
        prg('提交中...');
        $.post('audit/file/review', {
            fids: fids,
            category: _scope.batchReview.category,
            reviewResult: reviewResult,
            categoryStr: categoryStr,
        }, function(result) {
            prgEnd();
            if (result.err != 0) {
                $.smkAlert({
                    text: '提交审核信息失败' + result.msg,
                    type: 'danger'
                });
            } else {
                $.smkAlert({
                    text: '提交审核成功！'
                });
                updateTableRows(_scope.selBatchItems, reviewResult)
            }
        });
    }
    
    
    function batchGainTask() {
	   _scope.selBatchItems = [];
       $('#auditTable tbody>tr>td:first-child input[type="checkbox"]').each(function (i, item) {
           if (item.checked) {
               _scope.selBatchItems.push($(item).data('fid'));
           }
       });
       if(_scope.selBatchItems.length == 0) {
           $.smkAlert({text:'请选择视频后再批量领取任务。'});
           return;
       }
       if(_scope.selBatchItems.length > 15) {
           $.smkAlert({text:'选择视频过多！'});
       }
 
       var fids=_scope.selBatchItems.toString(); 
      
       prg('提交中...');
      
       $.post('audit/file/gainTask', {
          fids: fids
       }, function(result) {
    	  prgEnd(); 
    	  if (result.err != 0) {
              $.smkAlert({
                  text: '批量领取任务失败' + result.msg,
                  type: 'danger'
              });
          } else {
              $.smkAlert({
                  text: '成功批量领取了' + result.data+'任务',
              });

          }
       });
       
       search();
     
    }

    // 更新table数据
    function updateTableRows(fidArr, reviewResult) {
        for(var i=0; i<fidArr.length; i++) {
            updateTableRow(fidArr[i], reviewResult);
        }
    }
    function updateTableRow(fid, reviewResult) {
        var reviewStatus = reviewResult=='passed'?300:200;
        var dtDatas = _dt.data();
        for(var i=0; i<dtDatas.length; i++) {
            if(dtDatas[i].fid == fid) {
                var d = _dt.row(i).data();
                d.reviewStatus = reviewStatus;
                _dt.row(i).data(d);
                break;
            }
        }
    }

    function getReviewReasons(fid) {
        $.getJSON('audit/reasons', function(result) {
            if (result.err != 0) {
                $.smkAlert({
                    text: '获取审核原因列表错误:' + result.msg,
                    type: 'danger'
                });
                return;
            }
            _scope.reviewReasons = result.data;
        });
    }

    function getReviewLogs(fid) {
        $.getJSON('audit/file/' + fid + '/reviewLogs', function(result) {
            if (result.err != 0) {
                $.smkAlert({
                    text: '获取审核错误:' + result.msg,
                    type: 'danger'
                });
                return;
            }
            _scope.reviewLogs = result.data;
        });
    }

    function getPanoUrlPrefix() {
        $.getJSON('audit/panoUrl', function(result) {
            if (result.err != 0) {
                $.smkAlert({
                    text: '获取全景图地址错误:' + result.msg,
                    type: 'danger'
                });
                return;
            }
            _scope.panoUrl = result.data;
        });
    }

    function reloadViedo(api, videoUrl, resumTime) {
    	
        api.load({
            autoplay: true,
            speeds: ['1', '2', '4'],
            defaultQuality: defaultQuality,
            qualities: qualities,
            sources: [{
                type: "video/mp4",
                src: videoUrl
            }]
        }, function() {
            api.finished = false;
            if (resumTime && !api.live) {
                api.seek(resumTime, function() {
                    api.resume();
                });
            }
        });
    }

    function search() {
        _dt.ajax.reload();
    }
    
    function changeGainTaskStatus(){
    	var gainTaskVal = $("input[name='c_gainTaskstatus']:checked").val();
    	if(gainTaskVal == -1){io 
    		$("#batchAuditDiv").hide();
    	}else{
    		$("#batchAuditDiv").show();
    	}
    	search();
    }

    function toggleAll(event) {
        var checked = event.target.checked;
        $('#auditTable tbody>tr>td:first-child input[type="checkbox"]').each(function (i, item) {
            item.checked = checked;
        });
    }
    
}(window, jQuery));

