package com.network.driver.common.domain.weixin;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;

/**
 * Created by ChenZhangsheng on 2018/9/2.
 */
public class SessionKey implements Serializable {

    @JsonProperty("openid")
    private String openId;

    @JsonProperty("session_key")
    private String sessionKey;

    @JsonProperty("expires_in")
    private long expiresIn;

    private long expiresTill;

    public String getOpenId() {
        return openId;
    }

    public void setOpenId(String openId) {
        this.openId = openId;
    }

    public String getSessionKey() {
        return sessionKey;
    }

    public void setSessionKey(String sessionKey) {
        this.sessionKey = sessionKey;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
        this.expiresTill = System.currentTimeMillis() + (expiresIn * 1000) - 60000;
    }

    public long getExpiresTill() {
        return expiresTill;
    }

    public boolean expired() {
        return System.currentTimeMillis() > expiresTill;
    }
}
