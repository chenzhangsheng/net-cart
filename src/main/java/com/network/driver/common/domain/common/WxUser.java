package com.network.driver.common.domain.common;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.network.driver.common.domain.weixin.SessionKey;
import lombok.Data;
import java.util.Date;
import javax.persistence.*;

/**
 * Created by ChenZhangsheng on 2018/9/2.
 */
@Data
@Table(name = "user")
public class WxUser {
    @Id
    @GeneratedValue
    private long id;
    private String wxId;
    private String wxName;
    private String wxAvatarUrl;
    private String wxGender;
    private String wxPhone;
    private String wxCity;
    private String wxProvince;
    private String cartName;
    private String cartIdNumber;
    private String cartCreateLicense;
    private String cartNumber;
    private String cartBrand;
    private String cartOwner;
    private String cartApprove;
    private String cartCreateTime;
    private String cartLicenseImageFront;
    private String cartLicenseImageBack;
    private String cartDriveLicenseImageFront;
    private String cartDriveLicenseImageBack;
    private int shareCount;
    private String qrcodeUrl;
    private SessionKey sessionKey;
    @JsonIgnore
    private Date createTime;
    @JsonIgnore
    private Date lastModifiedTime;
    

}
