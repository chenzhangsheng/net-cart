package com.network.driver.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

public class UserUtil {

    public static UserDetails getUser() {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        Authentication authentication = securityContext.getAuthentication();
        UserDetails springSecurityUser;

        if (authentication != null) {
            if (authentication.getPrincipal() instanceof UserDetails) {
                springSecurityUser = (UserDetails) authentication.getPrincipal();
                return springSecurityUser;
            }
        }
        return null;
    }

    public static String getUserName() {
        UserDetails user = getUser();
        String userName = user == null ? "unknown" : user.getUsername();

        // 去掉邮箱后缀
        if (userName.contains("@pptv.com")) {
            userName = userName.substring(0, userName.length() - "@pptv.com".length());
        }
        return userName;
    }


}
