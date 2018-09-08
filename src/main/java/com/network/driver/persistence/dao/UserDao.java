package com.network.driver.persistence.dao;

import com.network.driver.common.domain.SysUser;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * Created by ChenZhangsheng on 2018/8/25.
 */
@Mapper
public interface UserDao {

    List<SysUser> findUserList(SysUser user);

    SysUser getByUsername(String username);

    int createUser(SysUser user);

}
