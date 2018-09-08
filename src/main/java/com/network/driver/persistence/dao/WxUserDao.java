package com.network.driver.persistence.dao;

import com.network.driver.common.domain.common.WxUser;
import org.apache.ibatis.annotations.Mapper;

/**
 * Created by ChenZhangsheng on 2018/9/2.
 */
@Mapper
public interface WxUserDao {

    WxUser getByOpenId(String openId);

    void save(WxUser wxUser);

    void update(WxUser wxUser);
}
