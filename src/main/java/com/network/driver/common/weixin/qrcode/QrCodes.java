package com.network.driver.common.weixin.qrcode;

import com.network.driver.common.weixin.WxEndpoint;
import com.network.driver.config.AppWxClientFactory;
import com.network.driver.util.FileUpload;
import com.riversoft.weixin.common.WxClient;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.InputStream;
import java.util.UUID;

/**
 * 二维码工具
 * @borball on 12/29/2016.
 */
@Component
public class QrCodes {

    private static Logger logger = LoggerFactory.getLogger(QrCodes.class);

    private static WxClient wxClient;

    static {
        wxClient = AppWxClientFactory.getInstance().defaultWxClient();
        logger.info("QrCodes wxClient appid:{},secret:{}",wxClient.getClientId(),wxClient.getClientSecret());
        logger.info("QrCodes wxClient token:{},is expired:{} ",wxClient.getAccessToken().getAccessToken(),wxClient.getAccessToken().expired());
    }

//    public static QrCodes defaultQrCodes() {
//        QrCodes qrCodes = new QrCodes();
//        qrCodes.setWxClient(AppWxClientFactory.getInstance().defaultWxClient());
//        return qrCodes;
//    }

//    public void setWxClient(WxClient wxClient) {
//        this.wxClient = wxClient;
//    }

    /**
     * 获取小程序页面二维码
     * @param path, path 需要在 app.json 的 pages 中定义
     * @return
     */
    public String create(String path,String openId) throws Exception{
        return create(path, 430,openId);
    }

    /**
     * 获取小程序页面二维码
     * @param path, path 需要在 app.json 的 pages 中定义
     * @param size
     * @return
     */
    public String create(String path, int size,String openId) throws Exception {
        String url = WxEndpoint.get("url.qrcode.create");
        String json = "{\"scene\": \"%s\",\"page\": \"%s\", \"width\": %s}";
        logger.info("create qrCode:{}",String.format(json,openId, path, size));
        InputStream inputStream = wxClient.copyStream(url, String.format(json,openId, path, size));
        String qrCodePath = FileUpload.upFileFileInputStream(inputStream);
        logger.info("create File path:{}",qrCodePath);
//        File tempFile = new File(FileUtils.getTempDirectory(), fileName);
//        FileUtils.copyInputStreamToFile(inputStream, tempFile);
        return qrCodePath;
    }
}
