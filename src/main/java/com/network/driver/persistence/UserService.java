package com.network.driver.persistence;

import com.network.driver.common.domain.SysUser;

import java.util.List;

/**
 * Author GreedyStar
 * Date  2018-07-11
 */
public interface UserService {

    List<SysUser> findUserList(SysUser user);

    SysUser getByUsername(String username);

    int createUser(SysUser user);


}