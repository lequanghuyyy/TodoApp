-- ============================================================
-- V3 — Thêm cột due_date vào bảng tasks đang chạy
-- ============================================================
-- Dùng ALTER TABLE thay vì CREATE TABLE vì bảng đã có dữ liệu thật.
-- Các dòng cũ sẽ có due_date = NULL (không có deadline) — hoàn toàn ổn.
-- ============================================================

ALTER TABLE tasks
    ADD COLUMN due_date DATE NULL DEFAULT NULL AFTER priority;

ALTER TABLE tasks
    ADD INDEX idx_due_date (due_date);
