package com.sky.controller.user;

import com.sky.constant.JwtClaimsConstant;
import com.sky.constant.RedisKeyConstant;
import com.sky.constant.SessionAttributeConstant;
import com.sky.dto.UserLoginDTO;
import com.sky.dto.UserRegisterDTO;
import com.sky.entity.User;
import com.sky.properties.JwtProperties;
import com.sky.result.Result;
import com.sky.service.UserService;
import com.sky.utils.JwtUtil;
import com.sky.vo.UserLoginVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import static com.sky.constant.RedisKeyConstant.DISH_STOCK_KEY;

@RestController
@RequestMapping("/user/user")
@Api(tags = "C端用户相关接口")
@Slf4j
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private JwtProperties jwtProperties;
    @Autowired
    private RedisTemplate<String, String> strRedisTemplate;

    /**
     * 用户登录接口（账号密码 + JWT）
     *
     * @param userLoginDTO
     * @param session
     * @return
     */
    @PostMapping("/login")
    @ApiOperation("用户登录接口")
    public Result<UserLoginVO> login(@RequestBody UserLoginDTO userLoginDTO, HttpSession session){
        log.info("用户登录接口:{}", userLoginDTO);

        // 1、账号密码登录
        User user = userService.login(userLoginDTO);

        // 2、生成 jwt 令牌
        Map<String,Object> claims=new HashMap<>();
        claims.put(JwtClaimsConstant.USER_ID, user.getId());
        String jwt = JwtUtil.createJWT(jwtProperties.getUserSecretKey(), jwtProperties.getUserTtl(), claims);

        // 3、写入 HttpSession（登录态）
        session.setAttribute(SessionAttributeConstant.USER_ID, user.getId());

        // 4、构造返回
        UserLoginVO userLoginVO = UserLoginVO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .openid(user.getOpenid())
                .token(jwt)
                .build();

        return Result.success(userLoginVO);
    }

    /**
     * 用户注册接口（账号密码，注册成功仅落库，不自动登录）
     *
     * 1、检查账号是否已存在
     * 2、写入 user 表（密码 MD5、状态默认启用）
     * 不签发 jwt、不写 session，前端需跳转登录页走真实登录流程
     *
     * @param userRegisterDTO
     * @return
     */
    @PostMapping("/register")
    @ApiOperation("用户注册接口")
    public Result<String> register(@RequestBody UserRegisterDTO userRegisterDTO){
        log.info("用户注册接口:{}", userRegisterDTO);

        // 1、账号密码注册
        userService.register(userRegisterDTO);

        return Result.success();
    }

    /**
     * 用户退出登录
     *
     * 1、销毁 HttpSession 中的登录态
     * 2、将当前 jwt 写入 Redis 黑名单（TTL 与 token 剩余寿命一致），让 JwtTokenUserInterceptor 拒绝该 token
     *
     * @param request
     * @param session
     * @return
     */
    @PostMapping("/logout")
    @ApiOperation("用户退出登录")
    public Result<String> logout(HttpServletRequest request, HttpSession session) {
        log.info("用户退出登录");

        // 1、销毁 HttpSession 中的登录态
        session.invalidate();

        // 2、把当前 jwt 加入黑名单（兼容已签发 token 的立即失效）
        String token = request.getHeader(jwtProperties.getUserTokenName());
        if (token != null && !token.isEmpty()) {
            try {
                // 黑名单仅作存在性标记，TTL 与 token 剩余寿命一致即可
                long ttl = jwtProperties.getUserTtl() / 1000;
                strRedisTemplate.opsForValue().set(
                        RedisKeyConstant.USER_TOKEN_BLACKLIST_PREFIX_KEY + token,
                        "1",
                        ttl,
                        TimeUnit.SECONDS
                );
            } catch (Exception e) {
                // 黑名单写入失败不影响主流程：session 已失效就足够让前端感知
                log.warn("写入 token 黑名单失败:{}", e.getMessage());
            }
        }

        return Result.success();
    }

    @PostMapping("/test")
    public Result<Integer> testRedisOpsForHash(){
        String key = DISH_STOCK_KEY;
        String hashKey = String.valueOf(1);
        strRedisTemplate.opsForHash().put(key,hashKey,28);
        Integer dishStock = (Integer) strRedisTemplate.opsForHash().get(key, hashKey);
        strRedisTemplate.expire(key, 1, TimeUnit.HOURS);
        return Result.success(dishStock);
    }
}