package com.example.todoapp.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * Generic pagination wrapper — che giấu cấu trúc {@code Page} nội bộ của Spring
 * khỏi API response, giúp giữ contract ổn định khi nâng cấp Spring version.
 *
 * @param <T> kiểu dữ liệu của từng phần tử trong danh sách.
 */
@Getter
@Builder
public class PageResponseDTO<T> {

    private List<T> content;

    /** Số trang hiện tại (0-indexed). */
    private int pageNumber;

    /** Số phần tử tối đa mỗi trang. */
    private int pageSize;

    /** Tổng số phần tử trên toàn bộ dataset (sau khi filter). */
    private long totalElements;

    /** Tổng số trang. */
    private int totalPages;

    /** {@code true} nếu đây là trang cuối cùng. */
    private boolean isLast;
}
