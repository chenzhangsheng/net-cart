package com.network.driver.exception;

import com.network.driver.common.result.ResponseData;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Author GreedyStar
 * Date   2018/7/23
 */
@RestControllerAdvice
public class CustomExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseData<String> handleException(Exception exception) {
        return new ResponseData<String>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "服务器异常","");
    }

}
