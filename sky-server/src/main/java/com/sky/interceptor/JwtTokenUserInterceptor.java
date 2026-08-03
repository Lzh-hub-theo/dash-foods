package com.sky.interceptor;

import com.sky.constant.JwtClaimsConstant;
import com.sky.constant.RedisKeyConstant;
import com.sky.constant.SessionAttributeConstant;
import com.sky.context.BaseContext;
import com.sky.properties.JwtProperties;
import com.sky.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * C端用户登录态校验拦截器
 *
 * 优先级：HttpSession 中的 userId > JWT 解析 > 401
 * 同时校验 JWT 黑名单：写入黑名单的 token 一律拒绝
 */
@Component
@Slf4j
public class JwtTokenUserInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtProperties jwtProperties;

    @Autowired
    private RedisTemplate<String, String> strRedisTemplate;

    /**
     * 请求到Controller资源之前拦截
     */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 1、优先从 HttpSession 取登录态
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute(SessionAttributeConstant.USER_ID) != null) {
            Long userId = (Long) session.getAttribute(SessionAttributeConstant.USER_ID);
            BaseContext.setCurrentId(userId);
            return true;
        }

        // 2、session 未命中则校验 JWT
        String token = request.getHeader(jwtProperties.getUserTokenName());
        if (token == null || token.isEmpty()) {
            response.setStatus(401);
            return false;
        }

        // 3、黑名单校验（已退出登录的 token 直接拒绝）
        try {
            Boolean blacklisted = strRedisTemplate.hasKey(RedisKeyConstant.USER_TOKEN_BLACKLIST_PREFIX_KEY + token);
            if (Boolean.TRUE.equals(blacklisted)) {
                response.setStatus(401);
                return false;
            }
        } catch (Exception e) {
            // Redis 故障不应阻塞正常请求，降级放行
            log.warn("校验 token 黑名单失败:{}", e.getMessage());
        }

        // 4、解析 JWT
        try {
            Claims claims = JwtUtil.parseJWT(jwtProperties.getUserSecretKey(), token);
            Long userId = Long.valueOf(claims.get(JwtClaimsConstant.USER_ID).toString());
            log.info("当前用户id:{}", userId);
            BaseContext.setCurrentId(userId);
            return true;
        } catch (Exception e) {
            response.setStatus(401);
            return false;
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        BaseContext.removeCurrentId();
    }
}