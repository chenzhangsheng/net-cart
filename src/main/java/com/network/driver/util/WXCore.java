package com.network.driver.util;

import org.apache.commons.codec.binary.Base64;

import net.sf.json.JSONObject;


/**
 * 封装对外访问方法
 * @author liuyazhuang
 *
 */
public class WXCore {

    private static final String WATERMARK = "watermark";
    private static final String APPID = "appid";
    /**
     * 解密数据
     * @return
     * @throws Exception
     */
    public static String decrypt(String appId, String encryptedData, String sessionKey, String iv){
        String result = "";
        try {
            AES aes = new AES();
            byte[] resultByte = aes.decrypt(Base64.decodeBase64(encryptedData), Base64.decodeBase64(sessionKey), Base64.decodeBase64(iv));
            if(null != resultByte && resultByte.length > 0){
                result = new String(WxPKCS7Encoder.decode(resultByte));
                JSONObject jsonObject = JSONObject.fromObject(result);
                String decryptAppid = jsonObject.getJSONObject(WATERMARK).getString(APPID);
                if(!appId.equals(decryptAppid)){
                    result = "";
                }
            }
        } catch (Exception e) {
            result = "";
            e.printStackTrace();
        }
        return result;
    }


    public static void main(String[] args) throws Exception{
        String appId = "wxeb78b3b925ff9dd8";
        String encryptedData = "XFHGrLRVkUmJivfvo/8WJsRTl5zwAfd9hw+jd72cv76h9SxPDO9bb/tNepvzxyRZUqRbujM997IJ0EIjmcV2OTyQX0OrywVhgOw2t8Q9g8w9t0nrKg8KbkZ1KR3udoRy1rVZz5QkQ3WiWWMXuKrtZwH2IqgTsN7gfGpbfY9M6+KxrmMGwEPLMFi9ESA3Y9zn1gPn9r1I3OFQup7C8XzkMQ==";
        String sessionKey = "FSTgLF7+3TLuOeBUI6pFQQ==";
        String iv = "C+Gdecfg0EfnwnHO2EF2EA==";
        System.out.println(decrypt(appId, encryptedData, sessionKey, iv));
    }
}
