/**
 * Created by yancongliu on 2016/10/17.
 */


(function ($) {
    var _view;
    var _scope;
    // 所有条件设置为true后调用callback
    var readyDo = function (callback) {
        var modelReady = false;
        var userReady = false;
        var coverPrefixReady = false;

        function invovCallback() {
            if (userReady && coverPrefixReady && modelReady) {
            	setTimeout(callback, 0);
            }
        }

        return {
            user: function (isReady) {
                userReady = isReady;
                invovCallback();
            },
            coverPrefix: function (isReady) {
                coverPrefixReady = isReady;
                invovCallback();
            },
            model: function (isReady) {
                modelReady = isReady;
                invovCallback();
            }
        }
    };
    var readyShow = readyDo(showView);
    Date.prototype.format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };

    window.prg = function (text) {
        $.smkProgressBar({
            element: '#content',
            status: 'start',
            bgColor: 'rgba(250, 250, 250,.6)',
            barColor: '#3c763d',
            content: text
        });
    };

    window.prgEnd = function () {
        $.smkProgressBar({
            element: '#content',
            status: 'end',
        });
    };

    window.timeLongHuman = timeLongHuman;

    window.dataRangeConf = {
        startDate: moment().startOf('day'),
        endDate: moment(),
        //minDate: '01/01/2012',    //最小时间
        autoApply: true,
        // maxDate: moment(), //最大时间
        // dateLimit: {
        //     days: 7 //起止时间的最大间隔
        // },
        // showDropdowns: true,
        // showWeekNumbers: true, //是否显示第几周
        // timePicker: true, //是否显示小时和分钟
        // timePickerIncrement: 60, //时间的增量，单位为分钟
        // timePicker12Hour: false, //是否使用12小时制来显示时间
        ranges: {
            //'最近1小时': [moment().subtract('hours',1), moment()],
            '今日': [moment().startOf('day'), moment()],
            '昨日': [moment().subtract('days', 1), moment()],
            '最近7日': [moment().subtract('days', 6), moment()],
            // '最近30日': [moment().subtract('days', 29), moment()]
        },
        opens: 'center', //日期选择框的弹出位置
        // buttonClasses: ['btn btn-default'],
        applyClass: 'btn-small btn-primary',
        cancelClass: 'btn-small',
        ranges:{
        	'今日':[moment(), moment()],
        	'昨日': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            '最近七日': [moment().subtract(6, 'days'), moment()]
        },
        locale: {
            format: 'YYYY-MM-DD',
            separator: ' 至 ',
            applyLabel: '确定',
            cancelLabel: '取消',
            fromLabel: '起始时间',
            toLabel: '结束时间',
            customRangeLabel: '自定义',
            daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月',
                '七月', '八月', '九月', '十月', '十一月', '十二月'],
            firstDay: 1
        }
    };

    window.jqTableLange = {
        'sEmptyTable': '没有数据',
        'sLoadingRecords': '数据加载中，请您稍候...',
        'sProcessing': '数据处理中，请您稍候...',
        'sSearch': '在结果中查找:',
        'sLengthMenu': '每页显示：_MENU_条',
        'sZeroRecords': '未找到匹配的记录',
        'paginate': {
            'sFirst': '首页',
            'sLast': '末页',
            'sNext': '下一页',
            'sPrevious': '上一页'
        },
        'sInfo': '第_START_-_END_条，共_TOTAL_条记录',
        'sInfoEmpty': '第0-0条，共0条',
        'sInfoFiltered': '(从共_MAX_条记录中查找)'
    };

    $.ajaxSetup({
        error: function (jqXHR, statusText, errorThrown) {
            prgEnd();

            var rspJson = jqXHR.responseJSON;
            if(rspJson) {
                console.log('ajax error: ' + JSON.stringify(rspJson, null, 4));
                if(rspJson.status == 403){
                    $.smkAlert({
                        text: '您没有权限访问这部分数据， 请尝试重新登录或联系管理员开通权限。',
                        type: 'warning',
                    });
                }
                else {
                    $.smkAlert({
                        text: '请求错误：' + rspJson.status + ' ' + rspJson.error,
                        type: 'danger',
                    });
                }
            }
            else if (statusText == 'error' && jqXHR.status == 0 && errorThrown == '') {
                // 访问服务时，若CAS登录重定并发生跨域访问错误， 则刷新页面以便重新登录
                console.log('ajax error: ' + statusText + " http code: " + jqXHR.status);
                if (jqXHR.status == 0) {
                    $.smkConfirm({
                        text: '登录过期，重新登录?',
                        accept: '确定',
                        cancel: '取消'
                    }, function (res) {
                        if (res) window.location.reload();
                    });
                }
            }
            else {
                console.log(statusText);
                console.log(errorThrown);
                var msg = statusText;
                // CC在出错时可能返回html报错信息，非JSON格式的
                if(statusText == 'parsererror'){
                    msg = '请求Chanel Center接口出错，且返回非JSON数据';
                }
                $.smkAlert({
                    text: '请求错误：' + msg,
                    type: 'danger',
                });
            }
        },
        headers:{
            "X-CSRF-TOKEN": getCsrfCookie(),
        }
    });

    function iniHashEvent() {
        if (!("onhashchange" in window)) {
            alert("your browser is not support onhashchange event!")
        }
        else {
            // url hash 改变时使用$SPA切换页面显示
            window.addEventListener("hashchange", $SPA.changeUrl);
        }
    }
    
    function initView() {
        _scope = {};
        _scope.user = {loginName: '', roles: []};
        _view = new Vue({
            el: '.sidebar-menu',
            data: _scope,
            computed: {
                isAdmin: function () {
                    return $.inArray('ADMIN', this.user.roles) != -1;
                },
                isOps: function () {
                    return $.inArray('OPS', this.user.roles) != -1;
                },
                isSingleAudit: function () {
                    return $.inArray('SINGLE_AUDIT', this.user.roles) != -1;
                },
                isBatchAudit: function () {
                    return $.inArray('BATCH_AUDIT', this.user.roles) != -1;
                },
            },
        });
    }

    function getVodCoverUrlPrefix() {
        $.get('vods/cover/url', function (result) {
            window.vodCoverUrl = result;
            readyShow.coverPrefix(true);
        });
    }
    
    function getUser() {
        $.get('user', function (user) {
            if(!user||!user.userid){
                $.smkAlert({text:'获取用户信息失败', type: 'warning'});
                console.log('获取用户信息失败：');
                console.log(user);
                return;
            }
            _scope.user = user;
            window.user = user;
            readyShow.user(true);

            var userName = user.userid;
            var userId = userName.indexOf("@")>0 ? userName.substr(0, userName.indexOf("@")): userName;

            var sidePhoto = "http://oa.pptv.com/Content/uploads/avatar/"+userId+".jpg?width=120&height=120&mode=crop&quality=90&format=png";
            var topPhoto = "http://oa.pptv.com/Content/uploads/avatar/"+userId+".jpg?width=100&height=100&mode=crop&quality=90&format=png";
            $('#sidePhoto').attr("src", sidePhoto);
            /*$('#topPhoto').attr("src", topPhoto);
            $('#topPhoto').attr('title', userName);
            $('#topPhoto').attr('alt', userName);*/
            $('#accountinfo a').text(user.name + "(" + user.userid + ")");
        })
    }

    
   // jQuery(document).ready(function ($) { if (window.history && window.history.pushState) { $(window).on('popstate', function () { var hashLocation = location.hash; var hashSplit = hashLocation.split("#!/"); var hashName = hashSplit[1]; if (hashName !== '') { var hash = window.location.hash; if (hash === '') { alert("Back button isn't supported. You are leaving this application on next clicking the back button"); } } }); window.history.pushState('forward', null, './#forward'); } }); 
    $(document).ready(function() {

        window.history.forward(1);

        //OR

       // window.history.forward(-1);

   });

    
    function initViewsModel() {
        $SPA.setMainNode("content");

        $SPA.addModule('vods', {
            view: "static/view/vods.html",
            init: function () {
                window.vodsCtrl.init('#vodsView');
            }
        });
        $SPA.addModule('lives', {
            view: "static/view/lives.html",
            init: function () {
                window.livesCtrl.init('#livesView');
            }
        });
        // $SPA.addModule('vodaudit', {
        //     view: "static/view/vodaudit.html",
        //     init: function () {
        //         $("#vodaudit").attr("height", ($(".content-wrapper").height() - 36) + "px");
        //     }
        // });

        $SPA.addModule('vod-audit', {
            view: "static/view/audit.html",
            init: function () {
                window.auditCtrl.init('#auditView');
            }
        });

        $SPA.addModule('admin-users', {
            view: "static/view/users.html",
            init: function () {
                window.usersCtrl.init('#usersView');
            }
        });

        $SPA.addModule('review-conf', {
            view: "static/view/reviewconf.html",
            init: function () {
                window.reviewCofCtrl.init();
            }
        });

        $SPA.addModule('logs', {
            view: "static/view/logs.html",
            init: function () {
                window.logsCtrl.init();
            }
        });

        $SPA.addModule('aduit-statistics',{
        	view: "static/view/auditStatistics.html",
        	init: function(){
        		window.auditStatisCtrl.init('#auditStatisticsView');
        	}
        });
        
/*        $SPA.addModule('myaudit',{
        	view: "static/view/myaudit.html",
        	init: function(){
        		window.myauditCtrl.init('#myauditView');
        	}
        });*/
        
        readyShow.model(true);
    }

    function getCsrfCookie() {
        var cookies = document.cookie ? document.cookie.split('; ') : [];
        for(var i=0; i<cookies.length; i++){
            var parts = cookies[i].split('=');
            if(parts[0] == "CSRF-TOKEN"){
                return parts[1];
            }
        }
    }

    flowplayer.conf = {
        swf: 'static/plugins/flowplayer/flowplayer.swf',
        embed: false,
    };

    Vue.filter('timeStr', function (value) {
        if(!value)return '';
        return new Date(parseInt(value)).format('yyyy-MM-dd hh:mm:ss');
    });

    Vue.filter('timeLongHuman',timeLongHuman);

    function timeLongHuman(sec) {
        if(!sec){
            return '';
        }
        var r = '';
        if (sec / 3600 >= 1)
            r += Math.floor(sec / 3600) + '时';
        if ((sec % 3600) / 60 >= 1)
            r += Math.floor(((sec % 3600) / 60)) + '分';
        if (r == '' || sec % 60 >= 1)
            r += sec % 60 + '秒';
        return r;
    }

    $(document).ready(function() {
        initViewsModel();
        iniHashEvent();
        getVodCoverUrlPrefix();
        getUser();
        $('#hideCsrfVal').val(getCsrfCookie());
        $('#logoutLnk').on('click', function () {
            document.getElementById('logoutForm').submit();
        });

        initView();
    });

    function showView() {
        $('.sidebar-menu').removeClass('hidden');
        // 默认打开第一个导航
        $('.sidebar-menu > li a')[0].click();
        $SPA.changeUrl();//强制触发一次，避免刷新当前页时， hash未变不触发页面展现
    }

}(jQuery));