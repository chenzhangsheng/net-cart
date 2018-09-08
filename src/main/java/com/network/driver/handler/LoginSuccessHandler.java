package com.network.driver.handler;

import com.alibaba.fastjson.JSON;
import com.network.driver.common.JwtProperty;
import com.network.driver.common.result.ResponseData;
import com.network.driver.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * 登录成功Handler
 * <p>
 * Author GreedyStar
 * Date   2018/7/20
 */
@Component
public class LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    @Autowired
    private JwtProperty jwtProperty;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Authentication authentication) throws IOException, ServletException {
        String username = httpServletRequest.getParameter("username");
        String token = JwtUtil.createToken(username, jwtProperty);
        Map<String, String> map = new HashMap<>();
        map.put("token", token);
        httpServletResponse.setContentType("application/json;charset=UTF-8");
        httpServletResponse.getWriter().write(JSON.toJSONString(
                new ResponseData<String>(HttpStatus.OK.value(), "Login success",token)));
    }
}
