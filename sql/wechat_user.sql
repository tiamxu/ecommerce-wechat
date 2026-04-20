-- ============================================
-- 微信小程序电商项目 - 数据库表结构
-- 创建时间: 2026-04-20
-- ============================================

-- 微信用户表
CREATE TABLE IF NOT EXISTS `wechat_user` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    `openid` VARCHAR(64) NOT NULL UNIQUE COMMENT '微信OpenID',
    `unionid` VARCHAR(64) COMMENT '微信UnionID',
    `nickname` VARCHAR(128) DEFAULT '' COMMENT '用户昵称',
    `avatar` VARCHAR(512) DEFAULT '' COMMENT '用户头像',
    `phone` VARCHAR(32) DEFAULT '' COMMENT '手机号',
    `status` INT DEFAULT 1 COMMENT '状态: 1正常, 0禁用',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_openid` (`openid`),
    INDEX `idx_unionid` (`unionid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信用户表';

-- ============================================
-- 地址表（如需）
-- ============================================
CREATE TABLE IF NOT EXISTS `user_address` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '地址ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `name` VARCHAR(32) NOT NULL COMMENT '收货人姓名',
    `phone` VARCHAR(32) NOT NULL COMMENT '手机号',
    `province` VARCHAR(32) NOT NULL COMMENT '省份',
    `city` VARCHAR(32) NOT NULL COMMENT '城市',
    `district` VARCHAR(32) NOT NULL COMMENT '区县',
    `detail` VARCHAR(128) NOT NULL COMMENT '详细地址',
    `is_default` INT DEFAULT 0 COMMENT '是否默认: 1是, 0否',
    `status` INT DEFAULT 1 COMMENT '状态: 1正常, 0禁用',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收货地址表';