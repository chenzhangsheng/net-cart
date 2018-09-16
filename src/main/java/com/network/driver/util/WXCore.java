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
        String encryptedData = "bo8H0L5XUzYQOQYmr3wWscVFR/EKVaa/ffLc7tlfhUFQoevpWcgIL8N7xvlUd9A8l6t5SFqIclZOWH4xNKBxDZUE0V86EeqbPnSuwNtKmaGoqhrG5T7pDkRpn1ZefAs+jKXSWQFwRvEpk3AmZTYume/C4aXOU7xmK5N6OUFshol8rEwrF4tA46z4j3B1jy6kM6WkESUm9gbfn48v2JqINQ==";
        String sessionKey = "Ut2uT+zb9p/VivE8fM5wPw==";
        String iv = "AJDgxisc12UaK1E8FcLlew==";
        System.out.println(decrypt(appId, encryptedData, sessionKey, iv));
    }
}
