package com.network.driver.web.app;

import com.alibaba.fastjson.JSONObject;
import com.network.driver.common.domain.common.WxUser;
import com.network.driver.common.domain.weixin.SessionKey;
import com.network.driver.common.result.ResponseData;
import com.network.driver.common.weixin.qrcode.QrCodes;
import com.network.driver.common.weixin.user.User;
import com.network.driver.exception.WrongReqException;
import com.network.driver.persistence.WxUserService;
import com.network.driver.util.FileUpload;
import com.network.driver.web.BaseController;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;

/**
 * Created by ChenZhangsheng on 2018/8/25.
 */
@RestController
@RequestMapping(value = "/app")
public class WeixinController extends BaseController{
    private static final Logger log = LoggerFactory.getLogger(WeixinController.class);
    @Autowired
    private QrCodes qrCodes;
    @Autowired
    private User user;
    @Autowired
    private WxUserService wxUserService;

    @RequestMapping(value = "/upload", method = RequestMethod.POST)
    public ResponseData upload(HttpServletRequest request,
                               @RequestParam("file") MultipartFile file) throws Exception {
        try {
            MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) request;
            String openId = multipartRequest.getParameter("openId");
            String imageId = multipartRequest.getParameter("id");
            log.info("/upload openId imageId :"+ openId + " "+ imageId);
            if(StringUtils.isNotEmpty(openId)&&
                    StringUtils.isNotEmpty(imageId)){
                String filepath = FileUpload.uploadFile(file, request);
                log.info("/upload filepath :"+ filepath);
                WxUser wxUser = new WxUser();
                wxUser.setWxId(openId);
                switch (imageId) {
                    case "0":
                        wxUser.setCartLicenseImageFront(filepath);
                        break;
                    case "1":
                        wxUser.setCartLicenseImageBack(filepath);
                        break;
                    case "2":
                        wxUser.setCartDriveLicenseImageFront(filepath);
                        break;
                    case "3":
                        wxUser.setCartDriveLicenseImageBack(filepath);
                        break;
                }
                wxUserService.saveOrUpateUser(wxUser);
            }
            return new ResponseData<String>(HttpStatus.OK.value(), "上传成功","");
        }catch (WrongReqException e){
            log.warn("upload image failure : "+e.getMessage());
            return new ResponseData<String>(HttpStatus.INTERNAL_SERVER_ERROR.value(),e.getMessage(),"");
        }catch (Exception e){
            log.error("upload image failure : "+e.getMessage());
            throw new Exception(e.getMessage());
        }
    }

    @ApiOperation(value = "生成分享二维码")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "openId", dataType = "String", paramType = "query")
    })
    @PostMapping
    @RequestMapping(value = "/qrcode")
    public ResponseData qrcode(HttpServletRequest request) throws Exception{
        try{
            String codePath = qrCodes.create("pages/index/index").getPath();
            log.info("/qrcode codePath:"+ codePath);
            return new ResponseData<String>(HttpStatus.OK.value(), "qrcode success", codePath);
        }catch (WrongReqException e){
            log.warn("getQrcode failure msg: "+e.getMessage());
            return new ResponseData<String>(HttpStatus.INTERNAL_SERVER_ERROR.value(),e.getMessage(),"");
        }catch (Exception e){
            log.error("getQrcode failure msg: "+e.getMessage());
            throw new Exception(e.getMessage());
        }
    }

    @RequestMapping(value = "/login", method = RequestMethod.POST)
    public ResponseData login(HttpServletRequest request) throws Exception{
        try{
            JSONObject jsonParam = this.getJSONParam(request);
            log.info("/login code:"+ jsonParam.getString("code"));
            SessionKey sessionKey = user.code2Session(jsonParam.getString("code"));
            log.info("/login openId:"+ sessionKey.getOpenId());
            if(sessionKey != null && StringUtils.isNotEmpty(sessionKey.getOpenId())){
                WxUser wxUser = new WxUser();
                wxUser.setWxId(sessionKey.getOpenId());
                wxUserService.saveOrUpateUser(wxUser);
                return new ResponseData<SessionKey>(HttpStatus.OK.value(), "get openid success",sessionKey);
            }else{
                return new ResponseData<String>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "get openid fail","");
            }
        }catch (WrongReqException e){
            log.warn("getOpenid failure msg: "+e.getMessage());
            return new ResponseData<String>(HttpStatus.INTERNAL_SERVER_ERROR.value(),e.getMessage(),"");
        }catch (Exception e){
            log.error("getOpenid failure msg: "+e.getMessage());
            throw new Exception(e.getMessage());
        }
    }

    @PostMapping
    @RequestMapping(value = "/updateCart")
    public ResponseData updateCart(HttpServletRequest request) throws Exception{
        try{
            JSONObject jsonParam = this.getJSONParam(request);
            if(jsonParam != null){
                WxUser wxUser = new WxUser();
                JSONObject form = JSONObject.parseObject(jsonParam.getString("form_data"));
                wxUser.setCartBrand(form.getString("vehcleBrand"));
                wxUser.setCartApprove(form.getString("vechileApprovedPerson"));
                wxUser.setCartName(form.getString("name"));
                wxUser.setCartNumber(form.getString("vehicleNumber"));
                wxUser.setCartIdNumber(form.getString("IDnumber"));
                wxUser.setCartOwner(form.getString("vehicleOwner"));
                String address = jsonParam.getString("region");
                if(StringUtils.isNotEmpty(address)){
                   String [] addresslist = address.replaceAll("[\\[\\]]", "").split(",");
                    wxUser.setWxProvince(addresslist[0]);
                    wxUser.setWxCity(addresslist[1]);
                }
                wxUser.setWxId(jsonParam.getString("openId"));
                wxUser.setCartCreateLicense(jsonParam.getString("driverDate"));
                wxUser.setCartCreateTime(jsonParam.getString("vehicleRegisteDate"));
                wxUserService.saveOrUpateUser(wxUser);
            }
            return new ResponseData<String>(HttpStatus.OK.value(), "updateCart success", "");
        }catch (WrongReqException e){
            log.warn("updateCart failure msg: "+e.getMessage());
            return new ResponseData<String>(HttpStatus.INTERNAL_SERVER_ERROR.value(),e.getMessage(),"");
        }catch (Exception e){
            log.error("updateCart failure msg: "+e.getMessage());
            throw new Exception(e.getMessage());
        }
    }


}
