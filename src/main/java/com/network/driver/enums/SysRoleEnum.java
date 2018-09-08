package com.network.driver.enums;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public enum SysRoleEnum {
    SUPER_ADMIN(1, "ADMIN", "管理员，可管理用户等"),
    OPS(2, "OPS", "运维， 可触发视频重新压制、分发等"),
    NORMAL_USER(0, "USER", "普通用户"),
    BATCH_AUDIT(4,"BATCH_AUDIT","批量审核"),
    SINGLE_AUDIT(5,"SINGLE_AUDIT","单视频审核");


    SysRoleEnum(int id, String role, String name) {
        this.id = id;
        this.role = role;
        this.name = name;
    }

    private int id;
    private String role;
    private String name;

    public int getId() {
        return id;
    }

    public String getRole() {
        return role;
    }

    public String getName() {
        return name;
    }

    public static SysRoleEnum value2SysRoleEnum(int value) {
        for (SysRoleEnum sysRole : SysRoleEnum.values()) {
            if (sysRole.getId() == value) {
                return sysRole;
            }
        }
        return null;
    }

    public static Map<Integer, String> getAllSysRoleMap() {
        return Arrays.stream(SysRoleEnum.values())
                .collect(Collectors.toMap(SysRoleEnum::getId, SysRoleEnum::getName));
    }

    public static List<String> getAllBelowRoleById(int value) {
        return Arrays.stream(SysRoleEnum.values())
                .filter(sysRoleEnum -> sysRoleEnum.getId() >= value)
                .map(SysRoleEnum::getRole)
                .collect(Collectors.toList());
    }

    public static boolean isVaildRoleId(int roleId) {
        for (SysRoleEnum sysRoleEnum : SysRoleEnum.values()) {
            if (sysRoleEnum.getId() == roleId) {
                return true;
            }
        }
        return false;
    }
}
