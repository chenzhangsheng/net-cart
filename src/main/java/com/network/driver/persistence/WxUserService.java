package com.network.driver.persistence;

import com.network.driver.common.domain.common.WxUser;

import java.util.List;

/**
 * Created by ChenZhangsheng on 2018/9/2.
 */
public interface WxUserService {

    void saveOrUpateUser (WxUser wxUser);
    WxUser getByOpenId(String openId);
    List<WxUser> getUserList();

}
