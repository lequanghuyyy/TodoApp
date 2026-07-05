CREATE TABLE IF NOT EXISTS tasks (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200)  NOT NULL,
  description VARCHAR(1000) DEFAULT '',
  status      ENUM('PENDING','COMPLETED') NOT NULL DEFAULT 'PENDING',
  priority    ENUM('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'MEDIUM',
  version     BIGINT        NOT NULL DEFAULT 0,

  -- Soft delete: NULL = chưa xoá, có giá trị = đã xoá lúc đó.
  -- Không xoá vật lý để giữ audit trail và tránh broken FK sau này.
  deleted_at  DATETIME      NULL DEFAULT NULL,

  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Composite index: mọi query thực tế đều filter deleted_at IS NULL + status.
  -- Đặt status trước vì cardinality thấp hơn, MySQL dùng index hiệu quả hơn.
  INDEX idx_status_deleted (status, deleted_at),
  INDEX idx_created_at     (created_at)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
