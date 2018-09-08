package com.network.driver.common.result;

import lombok.Data;
import lombok.experimental.Accessors;

@Accessors(chain = true)
@Data
public class ResponseData<T> {
    private T data;
    private int code;
    private String msg;

    public ResponseData() {
    }

    public ResponseData(T data) {
        this.data = data;
        this.code = ResponseMsg.OK.getCode();
        this.msg = ResponseMsg.OK.getMsg();
    }


    public ResponseData(ResponseMsg responseMsg, T data) {
        this.data = data;
        this.code = responseMsg.getCode();
        this.msg = responseMsg.getMsg();
    }

    public ResponseData(int code, String msg, T data) {
        this.data = data;
        this.code = code;
        this.msg = msg;
    }

    public static ResponseData<String> OK() {
        return new ResponseData<>(null);
    }
    public static <U>  ResponseData<U> OK(U data) {
        return new ResponseData<>(data);
    }


}
