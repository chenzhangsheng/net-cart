package com.network.driver.exception;


/**
 * 此异常一般由于客户端传请求错误引起
 */
public class WrongReqException extends BaseException {

    public WrongReqException(String msg) {
        super(msg);
    }

    public WrongReqException(String msg, Throwable cause) {
        super(msg, cause);
    }

}