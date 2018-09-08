/**
 * Created by yancongliu on 2016/10/20.
 */
// 原则上该Controller里只操作此view下的DOM
(function (window, $) {
    var viewName = "#usersView";
    var _view;
    var _app;
    var _scope;
    // 露出的Controller对象提供init初始化
    // 接收其控制范围的view, 可以是CSS选择器字符串、DOM或jQuery对象
    window.usersCtrl = {
        init: function () {
            _view = $(viewName);
            initView();
            initEvent();
        },
    };
    Vue.filter('userRolesStr', function (v) {
        if (!v) return '';
        var rolesStr = '';
        for (var i = 0; i < v.length; i++) {
            rolesStr += v[i].name + ' ';
        }
        return rolesStr;
    });
    //只查找作用范围内的DOM
    function inner(sel) {
        return _view.find(sel);
    }
    function initScope() {
        if (!_scope) {
            _scope = {};
        }
        _scope.users = [];
        _scope.roles = [];
        _scope.newLoginName = '';
        _scope.newUserName = '';
        _scope.selUser = {};
        _scope.checkedRoles = [];
    }
    function initView() {
        initScope();
        _app = new Vue({
            el: viewName,
            data: _scope,
            computed: {},
            methods: {
                addUser: addUser,
                modifyUserName:function(u){
                	var url = 'admin/users/' + u.id +'/username';
                    $.post(url, {
                    	userName: u.userName
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
                    u.modify = false;
                },
                showModifyUsers:function(item){
                	$.each(_scope.users, function(i, u) {
                        u.modify = false;
                    })
                    item.oldUserName = item.userName;
                    item.modify = true;
                },
                cancelUserModify:function(item) {
                    item.userName = item.oldUserName;
                    item.modify = false;
                },
                showModifyRole: showModifyRole,
                delUser: delUser,
                modifyUserRole:modifyUserRole,
            }
        });

        $('#tableCon').slimScroll({height: '600px', disableFadeOut: true, railVisible: true});
    }
    function initEvent() {
        loadRoles();
        loadUsers();
    }
    function showModifyRole (selUser) {
        _scope.selUser = selUser;
        _scope.checkedRoles = [];
        for (var i = 0; i < _scope.roles.length; i++) {
            for (var j = 0; j < selUser.roles.length; j++) {
                if (_scope.roles[i].id == selUser.roles[j].id) {
                    _scope.checkedRoles.push(selUser.roles[j].id + '');
                    break;
                }
            }
        }
    }
    function modifyUserRole() {
        if(!_scope.selUser || !_scope.selUser.id) return;
        var roleIds = [];
        $.each(_scope.checkedRoles, function (i, roleId) {
            roleIds[i] = roleId;
        });
        $.ajax({
            url: 'admin/users/' + _scope.selUser.id + '/roles',
            type: 'POST',
            dataType: 'json',
            data : {
                'roleIds': roleIds.join(',')
            },
            success: function (result) {
                if (result.err != 0) {
                    $.smkAlert({text: '出错了：' + result.msg, type: 'danger'});
                }
                else {
                    $.smkAlert({text: '修改成功！'});
                    loadUsers();
                }
            },
            error: function (xhr, textStatus, err) {
                $.smkAlert({text: '出错了：' + err, type: 'danger'});
                console.log('modify user role error, uid:' + _scope.selUser.id + ' role ids: ' + roleIds);
                console.log(err);
            }
        });
    }
    function addUser() {
        var loginName = _scope.newLoginName;
        var userName = _scope.newUserName;
        var roleIds = [];
        $.each(_scope.checkedRoles, function (i, roleId) {
            roleIds[i] = roleId;
        });
        if (!loginName) {
            $.smkAlert({text: '登录名不能为空！'});
            return;
        }
        if (!userName) {
            $.smkAlert({text: '请填写备注名！'});
            return;
        }
        $.ajax({
            url: 'admin/users',
            type: 'POST',
            dataType: 'json',
            data: {
                'loginName': loginName,
                'userName': userName,
                'roleIds': roleIds.join(',')
            },
            success: function (result) {
                inner('#loginNameInput').val('')
                if (result.err != 0) {
                    $.smkAlert({text: '出错了：' + result.msg, type: 'danger'});
                }
                else {
                    $.smkAlert({text: '添加成功！'});
                    _scope.newLoginName = '';
                    _scope.newUserName = '';
                    _scope.checkedRoles = [];
                    loadUsers();
                }
            },
            error: function (xhr, textStatus, err) {
                $.smkAlert({text: '出错了:' + err, type: 'danger'});
                console.log('add user error, uid:' + _scope.selUser.id + ' loginName:' + loginName);
                console.log(err);
            }
        });
    }
    function delUser() {
        if(!_scope.selUser || !_scope.selUser.id) {
            $.smkAlert({text:'未选择用户'});
            return;
        }
        $.smkConfirm({text: '确认删除？', accept: '确定', cancel: '取消'}, function (res) {
            if (!res)return;
            var id = _scope.selUser.id;
            var url = 'admin/users/' + id;
            $.ajax({
                url: url,
                type: 'DELETE',
                dataType: 'json',
                success: function (result) {
                    if (result.err != 0) {
                        $.smkAlert({text: '出错了：' + result.msg, type: 'danger'});
                    }
                    else {
                        _scope.selUser = {};
                        _scope.checkedRoles = [];
                        $.smkAlert({text: '删除成功！'});
                        loadUsers();
                    }
                },
                error: function (xhr, textStatus, err) {
                    $.smkAlert({text: '出错了:' + err, type: 'danger'});
                    console.log('del user error, uid:' + id);
                    console.log(err);
                }
            });
        });
    }
    function loadUsers() {
        $.smkProgressBar({
            element: '#content',
            status: 'start',
            bgColor: 'rgba(250, 250, 250,.6)',
            barColor: '#3c763d',
            content: '加载用户列表中...'
        });
        $.get('admin/users', function (result) {
            $.smkProgressBar({
                status: 'end',
            });
            if (result.err != 0) {
                $.smkAlert({text: '出错了：' + result.msg, type: 'danger'});
            }
            else {
            	var arr = [];
            	for(var i=0;i<result.data.length;i++){
            		var item = $.extend(result.data[i], {
                        modify: false
                    });
                    arr.push(item);
            	}
                /*_scope.users = result.data;*/
            	_scope.users = arr;
            }
        })
    }
    function loadRoles() {
        $.get('admin/roles', function (result) {
            if (result.err != 0) {
                $.smkAlert({text: '出错了：' + result.msg, type: 'danger'});
            }
            else {
                _scope.roles = result.data;
            }
        })
    }
}(window, jQuery));