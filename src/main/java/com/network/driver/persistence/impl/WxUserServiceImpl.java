package com.network.driver.persistence.impl;

import com.alibaba.druid.util.StringUtils;
import com.network.driver.common.domain.common.WxUser;
import com.network.driver.exception.WrongReqException;
import com.network.driver.persistence.WxUserService;
import com.network.driver.persistence.dao.WxUserDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Created by ChenZhangsheng on 2018/9/2.
 */
@Component
public class WxUserServiceImpl implements WxUserService {

    @Autowired
    private WxUserDao wxUserDao;

    @Override
    public void saveOrUpateUser (WxUser wxUser) {

        if( wxUser != null || !StringUtils.isEmpty(wxUser.getWxId())){
            WxUser user = wxUserDao.getByOpenId(wxUser.getWxId());
            if(user == null){
                wxUserDao.save(wxUser);
            }else{
                wxUserDao.update(wxUser);
            }
        }else{
            throw new WrongReqException("wxUser user is null");
        }
    }
}
