package com.network.driver.handler;

import com.alibaba.fastjson.JSON;
import com.network.driver.common.result.ResponseData;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.ExceptionTranslationFilter;
import org.springframework.stereotype.Component;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * 供 {@link ExceptionTranslationFilter} 使用，处理AuthenticationException异常，即：未登录状态下访问受保护资源
 * Security默认实现 {@link org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint}
 * <p>
 * Author GreedyStar
 * Date   2018/7/23
 */
@Component
public class AuthEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(JSON.toJSONString(
                new ResponseData<String>(HttpStatus.UNAUTHORIZED.value(), "Please login","")));
    }
}
