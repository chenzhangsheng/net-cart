package com.network.driver.common;

/**
 * Author GreedyStar
 * Date   2018/7/18
 */
public class JwtProperty {
    private long expiry;
    private String issuer;
    private String base64Security;

    public long getExpiry() {
        return expiry;
    }

    public void setExpiry(long expiry) {
        this.expiry = expiry;
    }

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }

    public String getBase64Security() {
        return base64Security;
    }

    public void setBase64Security(String base64Security) {
        this.base64Security = base64Security;
    }
}
