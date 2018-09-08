package com.network.driver.common.domain;

import lombok.Data;

import java.util.Date;

@Data
public class SysUser {
    private int id;
    private String username;
    private int roleId;
    private String password;
    private String email;
    private String phone;
    private String roleName;
    private Date createTime;
    private Date lastModifiedTime;
}
