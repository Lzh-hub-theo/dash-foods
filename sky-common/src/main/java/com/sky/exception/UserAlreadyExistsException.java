package com.sky.exception;

/**
 * 账号已存在异常
 */
public class UserAlreadyExistsException extends BaseException {

    public UserAlreadyExistsException() {
    }

    public UserAlreadyExistsException(String msg) {
        super(msg);
    }

}