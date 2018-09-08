package com.network.driver.common.weixin.user;

import com.network.driver.common.domain.weixin.SessionKey;
import com.network.driver.common.weixin.WxEndpoint;
import com.network.driver.common.weixin.qrcode.QrCodes;
import com.network.driver.config.AppWxClientFactory;
import com.riversoft.weixin.common.WxClient;
import com.riversoft.weixin.common.util.JsonMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Created by ChenZhangsheng on 2018/9/2.
 */
@Component
public class User {
    private static Logger logger = LoggerFactory.getLogger(QrCodes.class);

    private static WxClient wxClient;

    static {
        wxClient = AppWxClientFactory.getInstance().defaultWxClient();
    }

    public SessionKey code2Session(String code) {
        String url = WxEndpoint.get("url.user.code2session");
        String sessionKey = wxClient.get(String.format(url, wxClient.getClientId(), wxClient.getClientSecret(), code));
        logger.debug("code to session key: {}", sessionKey);
        return JsonMapper.nonEmptyMapper().fromJson(sessionKey, SessionKey.class);
    }

}
