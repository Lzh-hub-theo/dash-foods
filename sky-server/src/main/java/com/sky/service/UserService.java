package com.sky.service;

import com.sky.dto.UserLoginDTO;
import com.sky.dto.UserRegisterDTO;
import com.sky.entity.User;

public interface UserService {

    /**
     * C端用户账号密码登录
     *
     * @param userLoginDTO
     * @return
     */
    User login(UserLoginDTO userLoginDTO);

    /**
     * C端用户账号密码注册
     *
     * @param userRegisterDTO
     * @return
     */
    User register(UserRegisterDTO userRegisterDTO);

    /**
     * 旧版微信登录（已停用，保留入口以便回滚）
     *
     * @param userLoginDTO
     * @return
     */
    @Deprecated
    User wxLogin(UserLoginDTO userLoginDTO);
}