package com.sky.constant;

/**
 * redis缓存键相关常量
 */
public class RedisKeyConstant {
    public static final String DISH_STOCK_KEY = "DISH_STOCK";
    public static final String DISH_CATEGORY_PREFIX_KEY = "DISH:category_";
    public static final String SHOP_STATUS_KEY = "SHOP_STATUS";
    public static final String ORDER_TASK_RESULT_PREFIX_KEY = "order_task_result:";
    public static final String DEDUPLICATE_PREFIX_KEY = "deduplicate:";
    public static final String EXCEPTION_MESSAGE_KEY = "exception_message";
    public static final String DLQ_DEDUPLICATE_PREFIX_KEY = "dlq:deduplicate:";
    public static final String DLQ_RETRY_KEY = "dlq:retry:";
    public static final String ORDER_QUEUE_RETRY_KEY = "order_queue:retry:";

    /**
     * C端用户登录态黑名单（按 token 摘要存放，TTL 与 jwt 剩余寿命一致）
     */
    public static final String USER_TOKEN_BLACKLIST_PREFIX_KEY = "user:token:blacklist:";
}
