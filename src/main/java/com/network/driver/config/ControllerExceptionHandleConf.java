package com.network.driver.config;

import com.network.driver.common.BaseException;
import com.network.driver.common.result.ResponseData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import javax.servlet.http.HttpServletRequest;

/**
 * 定义需要横切处理的异常
 */

@ControllerAdvice  // 可定义 basePackages  或 basePackageClasses
public class ControllerExceptionHandleConf extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ControllerExceptionHandleConf.class);

    @ExceptionHandler(BaseException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseData<?> handleHttpReqException(HttpServletRequest request, Throwable ex) {
        log.error("admin web http request error: {}", ex.getMessage());
        return new ResponseData<String>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "请求 admin web 接口失败!", "");
    }



    private HttpStatus getStatus(HttpServletRequest request) {
        Integer statusCode = (Integer) request.getAttribute("javax.servlet.error.status_code");
        if (statusCode == null) {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
        return HttpStatus.valueOf(statusCode);
    }

}