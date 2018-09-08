package com.network.driver.common.domain.common;


import java.io.Serializable;

/**
 * Author GreedyStar
 * Date  2018-07-23
 */
public class Role implements Serializable {
    private static final long serialVersionUID = 1L;
    private String name;

    public Role() {
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

}