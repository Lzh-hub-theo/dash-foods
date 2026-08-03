package com.sky.service.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.sky.constant.MessageConstant;
import com.sky.constant.StatusConstant;
import com.sky.dto.UserLoginDTO;
import com.sky.dto.UserRegisterDTO;
import com.sky.entity.User;
import com.sky.exception.AccountLockedException;
import com.sky.exception.AccountNotFoundException;
import com.sky.exception.LoginFailedException;
import com.sky.exception.PasswordErrorException;
import com.sky.exception.UserAlreadyExistsException;
import com.sky.mapper.UserMapper;
import com.sky.properties.WeChatProperties;
import com.sky.service.UserService;
import com.sky.utils.HttpClientUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {

    public static final String WX_LOGIN = "https://api.weixin.qq.com/sns/jscode2session";
    public static final String GRANT_TYPE = "authorization_code";

    @Autowired
    HttpClientUtil httpClientUtil;
    @Autowired
    WeChatProperties weChatProperties;
    @Autowired
    UserMapper userMapper;

    /**
     * C端账号密码登录
     *
     * @param userLoginDTO
     * @return
     */
    @Override
    public User login(UserLoginDTO userLoginDTO) {
        String username = userLoginDTO.getUsername();
        String password = userLoginDTO.getPassword();

        //1、根据账号查询数据库中的数据
        User user = userMapper.getByUsername(username);

        //2、处理各种异常情况（账号不存在、密码不对、账号被禁用）
        if (user == null) {
            //账号不存在
            throw new AccountNotFoundException(MessageConstant.ACCOUNT_NOT_FOUND);
        }

        //密码比对
        password = DigestUtils.md5DigestAsHex(password.getBytes());
        if (!password.equals(user.getPassword())) {
            //密码错误
            throw new PasswordErrorException(MessageConstant.PASSWORD_ERROR);
        }

        if (user.getStatus() == StatusConstant.DISABLE) {
            //账号被锁定
            throw new AccountLockedException(MessageConstant.ACCOUNT_LOCKED);
        }

        //3、返回实体对象
        return user;
    }

    /**
     * C端账号密码注册
     *
     * @param userRegisterDTO
     * @return
     */
    @Override
    public User register(UserRegisterDTO userRegisterDTO) {
        String username = userRegisterDTO.getUsername();
        String password = userRegisterDTO.getPassword();
        String name = userRegisterDTO.getName();

        //1、根据账号查询数据库中是否已存在
        User existing = userMapper.getByUsername(username);
        if (existing != null) {
            //账号已存在
            throw new UserAlreadyExistsException(MessageConstant.USER_NAME_EXISTS);
        }

        //2、构造实体，密码 MD5 加密，默认启用
        User user = new User();
        user.setUsername(username);
        user.setPassword(DigestUtils.md5DigestAsHex(password.getBytes()));
        user.setName(name);
        user.setStatus(StatusConstant.ENABLE);
        user.setCreateTime(LocalDateTime.now());

        userMapper.insert(user);

        return user;
    }

    /**
     * 微信登录处理逻辑（已停用，仅做兜底保留）
     *
     * 历史逻辑：通过 HttpClient 调 https://api.weixin.qq.com/sns/jscode2session
     * 把 jscode2session 返回的 openid 写入 user 表；UserLoginDTO 改为 username/password 后
     * 此实现不再适用，留作接口占位并直接抛出异常。
     *
     * @param userLoginDTO
     * @return
     */
    @Override
    @Deprecated
    public User wxLogin(UserLoginDTO userLoginDTO) {
        // 微信小程序登录已下线，请改用账号密码登录接口
        throw new LoginFailedException(MessageConstant.LOGIN_FAILED);
        /*
        //利用HttpClient请求微信得到用户唯一标识openid
        String openid = getOpenid(userLoginDTO.getCode());

        //判断openid是否为空，代表用户是否登录成功
        if(openid==null||"".equals(openid)){
            throw new LoginFailedException(MessageConstant.LOGIN_FAILED);
        }

        //判断用户是否是小程序的新用户，是的话添加到用户表中
        User user = userMapper.selectUserByOpenId(openid);
        if(user==null){
            user=new User();
            user.setOpenid(openid);
            user.setCreateTime(LocalDateTime.now());
            userMapper.insert(user);
        }

        return user;
        */
    }

    //利用HttpClient请求微信得到用户唯一标识openid
    private String getOpenid(String code){
        Map<String,String> map=new HashMap<>();
        map.put("appid", weChatProperties.getAppid());
        map.put("secret", weChatProperties.getSecret());
        map.put("js_code", code);
        map.put("grant_type", GRANT_TYPE);
        String json = httpClientUtil.doGet(WX_LOGIN, map);

        JSONObject jsonObject = JSON.parseObject(json);
        String openid = jsonObject.getString("openid");

        return openid;
    }
}