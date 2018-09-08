package com.network.driver.common;

import org.springframework.core.NestedRuntimeException;

public class BaseException extends NestedRuntimeException {

    public BaseException(String msg) {
        super(msg);
    }

//    public BaseException(Object... msgs) {
//        super(StringUtil.concatByDelimit(" ", msgs));
//    }

    public BaseException(String msg, Throwable cause) {
        super(msg, cause);
    }

//    public BaseException(Throwable cause, Object... msgs) {
//        super(StringUtil.concatByDelimit(" ", msgs), cause);
//    }
}
