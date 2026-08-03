package com.sky.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ApiModel(description = "C端用户登录返回的数据格式")
public class UserLoginVO implements Serializable {

    @ApiModelProperty("主键值")
    private Long id;

    @ApiModelProperty("登录账号")
    private String username;

    @ApiModelProperty("昵称")
    private String name;

    @ApiModelProperty("微信用户唯一标识")
    private String openid;

    @ApiModelProperty("jwt令牌")
    private String token;

}