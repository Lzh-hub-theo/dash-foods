package com.sky.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

/**
 * C端用户注册
 */
@Data
@ApiModel(description = "C端用户注册时传递的数据模型")
public class UserRegisterDTO implements Serializable {

    @ApiModelProperty("登录账号")
    private String username;

    @ApiModelProperty("登录密码")
    private String password;

    @ApiModelProperty("昵称")
    private String name;

}