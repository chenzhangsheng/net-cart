package com.network.driver.filter;

import com.alibaba.fastjson.JSON;
import com.network.driver.common.JwtProperty;
import com.network.driver.common.result.ResponseData;
import com.network.driver.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.http.HttpStatus;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Date;

/**
 * Token验证过滤器
 * <p>
 * Author GreedyStar
 * Date   2018/7/20
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter{
    private JwtProperty jwtProperty;

    public JwtAuthenticationFilter(JwtProperty jwtProperty) {
        this.jwtProperty = jwtProperty;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, FilterChain filterChain) throws ServletException, IOException {
        httpServletResponse.setContentType("application/json");
        String authorization = httpServletRequest.getHeader("Authorization");
        // 放行GET请求
        if (httpServletRequest.getMethod().equals(String.valueOf(RequestMethod.GET))) {
            filterChain.doFilter(httpServletRequest, httpServletResponse);
            return;
        }
        if (StringUtils.isEmpty(authorization)) { // 未提供Token
            httpServletResponse.getWriter().write(JSON.toJSONString(new ResponseData<String>(HttpStatus.FORBIDDEN.value(), "Token not provided","")));
            return;
        }
        if (!authorization.startsWith("bearer ")) { // Token格式错误
            httpServletResponse.getWriter().write(JSON.toJSONString(
                    new ResponseData<String>(HttpStatus.FORBIDDEN.value(), "Token format error","")));
            return;
        }
        authorization = authorization.replace("bearer ", "");
        Claims claims = JwtUtil.parseToken(authorization, jwtProperty.getBase64Security());
        if (null == claims) { // Token不可解码
            httpServletResponse.getWriter().write(JSON.toJSONString(
                    new ResponseData<String>(HttpStatus.FORBIDDEN.value(), "Can't parse token","")));
            return;
        }
        if (claims.getExpiration().getTime() >= new Date().getTime()) { // Token超时
            httpServletResponse.getWriter().write(JSON.toJSONString(
                    new ResponseData<String>(HttpStatus.FORBIDDEN.value(), "Token expired","")));
            return;
        }
        // 再进行一些必要的验证
        if (StringUtils.isEmpty(claims.get("username"))) {
//            httpServletResponse.getWriter().write(JSON.toJSONString(new Response.Builder().setStatus(403).setMessage("Invalid token").build()));
            return;
        }
        filterChain.doFilter(httpServletRequest, httpServletResponse);
    }
}
