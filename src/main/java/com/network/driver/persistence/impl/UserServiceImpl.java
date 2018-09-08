package com.network.driver.persistence.impl;

import com.network.driver.common.domain.SysUser;
import com.network.driver.enums.SysRoleEnum;
import com.network.driver.exception.WrongReqException;
import com.network.driver.persistence.UserService;
import com.network.driver.persistence.dao.UserDao;
import com.network.driver.util.CustomPasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Created by ChenZhangsheng on 2018/8/25.
 */
@Component
public class UserServiceImpl implements UserService{
    @Autowired
    private UserDao userDao;

    @Override
    public List<SysUser> findUserList(SysUser user) {
        return null;
    }

    @Override
    public SysUser getByUsername(String username) {
        SysUser sysUser= userDao.getByUsername(username);
        if (sysUser == null) {
            throw new WrongReqException("sysUser user is null");
        } else {
            return convertSysUserDO2SysUser(sysUser);
        }
    }

    @Override
    public int createUser(SysUser user) {
        CustomPasswordEncoder encoder =new CustomPasswordEncoder();
        System.out.println("user.getPassword().trim()="+user.getPassword().trim());
        user.setPassword(encoder.encode(user.getPassword().trim()));
        return userDao.createUser(user);
    }

    private SysUser convertSysUserDO2SysUser(SysUser sysUser) {
        SysRoleEnum sysRole = SysRoleEnum.value2SysRoleEnum(sysUser.getRoleId());
        sysUser.setRoleName(sysRole.getName());
        return sysUser;
    }
}
