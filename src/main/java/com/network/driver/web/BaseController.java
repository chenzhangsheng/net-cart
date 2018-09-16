package com.network.driver.web;

import com.alibaba.fastjson.JSONObject;
import com.network.driver.common.domain.SysUser;
import com.network.driver.common.result.ResponseData;
import com.network.driver.persistence.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.InputStreamReader;

@RestController
@RequestMapping(value = "/user/")
public class BaseController {

    @Autowired
    private UserService userService;

    @RequestMapping(value = "/", method = RequestMethod.GET)
    public String index(HttpServletRequest req, HttpServletResponse resp) {
        return "index.html";
    }

//    @RequestMapping(value = "login", method = RequestMethod.POST)
//    public ResponseData<String> login(@AuthenticationPrincipal User user) {
//        System.out.println("user="+user.getUsername());
//        return new ResponseData<String>(HttpStatus.OK.value(), "Login success","");
//    }

    @RequestMapping(value = "signup", method = RequestMethod.POST)
    public ResponseData<String> signUp(@RequestBody SysUser user) {
        System.out.println("user"+ user.getUsername());
        System.out.println("user"+ user.getPassword());
        if (userService.createUser(user) == 0) {
            return new ResponseData<String>(HttpStatus.EXPECTATION_FAILED.value(),"save fail","");
        }
        return new ResponseData<String>(HttpStatus.OK.value(), "ok","");
    }

    /**
     * 创建日期:2018年4月6日<br/>
     * 代码创建:陈涨胜<br/>
     * 功能描述:通过request来获取到json数据<br/>
     * @param request
     * @return
     */
    public JSONObject getJSONParam(HttpServletRequest request){
        JSONObject jsonParam = null;
        try {
            // 获取输入流
            BufferedReader streamReader = new BufferedReader(new InputStreamReader(request.getInputStream(), "UTF-8"));
            // 写入数据到Stringbuilder
            StringBuilder sb = new StringBuilder();
            String line = null;
            while ((line = streamReader.readLine()) != null) {
                sb.append(line);
            }
            jsonParam = JSONObject.parseObject(sb.toString());
        } catch (Exception e) {
            e.printStackTrace();
        }
        return jsonParam;
    }


}
