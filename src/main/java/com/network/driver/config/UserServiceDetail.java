package com.network.driver.config;

import com.network.driver.common.domain.SysUser;
import com.network.driver.enums.SysRoleEnum;
import com.network.driver.persistence.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.network.driver.common.domain.common.User;
import java.util.ArrayList;
import java.util.List;


/**
 * Author GreedyStar
 * Date  2018-07-11
 */
@Service
@Transactional(readOnly = true)
public class UserServiceDetail implements UserDetailsService {

    @Autowired
    private UserService userService;

    public List<SysUser> findUserList(SysUser user) {

        return userService.findUserList(user);
    }

    public SysUser getUserByName(String username) {
        return userService.getByUsername(username);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        List<GrantedAuthority> grantedAuthorities = new ArrayList<>();

        SysUser sysUser = userService.getByUsername(username);
        // 若不是系统用户，则默认给予普通用户权限；若是系统用户，则根据用户角色添加所有低级别角色
        if (sysUser == null) {
            grantedAuthorities.add(new SimpleGrantedAuthority(SysRoleEnum.NORMAL_USER.getRole()));
        } else {
            List<String> roleList = getOwnRoles(sysUser.getRoleId());
            for (String role : roleList) {
                grantedAuthorities.add(new SimpleGrantedAuthority(role));
            }
        }
        return new User(sysUser.getUsername(),sysUser.getPassword(),grantedAuthorities);
    }

    private List<String> getOwnRoles(int roleId) {
        List<String> roleList = new ArrayList<>();
        if (SysRoleEnum.isVaildRoleId(roleId)) {
            roleList.addAll(SysRoleEnum.getAllBelowRoleById(roleId));
        } else {
            roleList.add(SysRoleEnum.NORMAL_USER.getRole());
        }
        return roleList;
    }

}
