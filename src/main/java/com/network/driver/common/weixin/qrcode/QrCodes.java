package com.network.driver.common.weixin.qrcode;

import com.network.driver.common.weixin.WxEndpoint;
import com.network.driver.config.AppWxClientFactory;
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
    public File create(String path) throws Exception{
        return create(path, 430);
    }

    /**
     * 获取小程序页面二维码
     * @param path, path 需要在 app.json 的 pages 中定义
     * @param size
     * @return
     */
    public File create(String path, int size) throws Exception {
        String url = WxEndpoint.get("url.qrcode.create");
        String json = "{\"path\": \"%s\", \"width\": %s}";
        String fileName = UUID.randomUUID().toString();
        InputStream inputStream = wxClient.copyStream(url, String.format(json, path, size));
        File tempFile = new File(FileUtils.getTempDirectory(), fileName);
        FileUtils.copyInputStreamToFile(inputStream, tempFile);
        return tempFile;
    }
}
