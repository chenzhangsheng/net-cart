package com.network.driver.common.result;

public enum ResponseMsg {
    OK(200, "OK"),
    UNAUTHORIZED(401, "Unauthorized"),
    NOT_FOUND(404,"NotFound"),
    UNPROCESSABLE_ENTITY(422, "Unprocessable Entity"),
    INTERNAL_SERVER_ERROR(500, "Internal Server Error"),
    ITEM_ALREADY_EXISTS(600, "The item already exists"),
    ITEM_NOT_EXIST(601, "The item does not exist");


    private final int code;
    private final String msg;

    ResponseMsg(int code, String msg) {
        this.code = code;
        this.msg = msg;
    }

    public int getCode(){
        return code;
    }

    public String getMsg() {
        return msg;
    }

}
