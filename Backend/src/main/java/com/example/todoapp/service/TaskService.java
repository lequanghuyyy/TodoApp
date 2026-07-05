package com.example.todoapp.service;

import com.example.todoapp.constant.TaskSortField;
import com.example.todoapp.constant.TaskStatus;
import com.example.todoapp.dto.response.PageResponseDTO;
import com.example.todoapp.dto.response.TaskResponseDTO;
import org.springframework.data.domain.Sort;

import com.example.todoapp.dto.request.TaskRequestDTO;

public interface TaskService {

    /**
     * Lấy danh sách task có search, filter, sort và phân trang.
     *
     * @param search   chuỗi tìm kiếm trong title/description (null = không filter)
     * @param status   lọc theo status (null = tất cả)
     * @param sortBy   field sắp xếp (whitelist)
     * @param sortDir  chiều sắp xếp ASC/DESC
     * @param page     số trang (0-indexed)
     * @param size     kích thước trang (tối đa 100)
     */
    PageResponseDTO<TaskResponseDTO> getTasks(
            String search,
            TaskStatus status,
            TaskSortField sortBy,
            Sort.Direction sortDir,
            int page,
            int size
    );

    /**
     * Tạo task mới.
     *
     * @param dto request body đã qua @Valid — title đã được kiểm tra @NotBlank
     * @return TaskResponseDTO của task vừa persist
     */
    TaskResponseDTO createTask(TaskRequestDTO dto);

    /**
     * Cập nhật thông tin task hiện có.
     * Áp dụng optimistic locking để chống race condition.
     *
     * @param id id của task cần cập nhật
     * @param dto dữ liệu mới
     * @return TaskResponseDTO sau khi cập nhật
     */
    TaskResponseDTO updateTask(Long id, TaskRequestDTO dto);

    /**
     * Xóa mềm task.
     * Trả về 204 qua Controller.
     * Nếu không tìm thấy, throw ResourceNotFoundException.
     *
     * @param id id của task cần xóa.
     */
    void deleteTask(Long id);
}

