package com.example.todoapp.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

/**
 * Nhóm task theo ngày, dùng cho endpoint GET /api/tasks/by-date.
 *
 * <p>Mỗi đối tượng đại diện cho 1 ngày trong khoảng fromDate–toDate.
 * Các ngày không có task vẫn xuất hiện với {@code tasks = []}.
 */
@Getter
@Builder
public class TaskByDateGroupDTO {

    /**
     * Ngày của nhóm này, định dạng ISO-8601 "yyyy-MM-dd".
     * Frontend parse trực tiếp không cần thêm bước.
     */
    private LocalDate date;

    /** Danh sách task có dueDate == date. Có thể rỗng. */
    private List<TaskResponseDTO> tasks;
}
