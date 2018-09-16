package com.network.driver.common;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * @borball on 11/7/2016.
 */
@Component
@ConfigurationProperties(prefix = "weixin")
public class AppSetting {

    private static Logger logger = LoggerFactory.getLogger(AppSetting.class);
    private static AppSetting appSetting = null;
    private static String appId = "wxa13bb45d82a8eca0";
    private static String secret = "319f1daec1eb6148059184337326c5b1";
    private static String token = "wonskd113n";
    private static String aesKey = "lRE3qfnBHxqzBE5i12v6CzU257ERsOIeMKqfDPdFu5c";
    private String tokenHolderClass;

    public AppSetting() {
    }

    public AppSetting(String appId, String secret) {
        this.appId = appId;
        this.secret = secret;
    }
    public static AppSetting defaultSettings() {
        if (appSetting == null) {
            appSetting = new AppSetting(appId,secret);
            return appSetting;
        }
        return appSetting;
    }

    public String getAppId() {
        return appId;
    }

    public void setAppId(String appId) {
        this.appId = appId;
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getAesKey() {
        return aesKey;
    }

    public void setAesKey(String aesKey) {
        this.aesKey = aesKey;
    }

    public String getTokenHolderClass() {
        return tokenHolderClass;
    }

    public void setTokenHolderClass(String tokenHolderClass) {
        this.tokenHolderClass = tokenHolderClass;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        AppSetting that = (AppSetting) o;
        if (!appId.equals(that.appId)) return false;
        return secret.equals(that.secret);

    }

    @Override
    public int hashCode() {
        int result = appId.hashCode();
        result = 31 * result + secret.hashCode();
        return result;
    }
}
