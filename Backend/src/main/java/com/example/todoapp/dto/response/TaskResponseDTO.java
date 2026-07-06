package com.example.todoapp.dto.response;

import com.example.todoapp.constant.Priority;
import com.example.todoapp.constant.TaskStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class TaskResponseDTO {

    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private Priority priority;
    private LocalDate dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // "version" bị loại bỏ có chủ ý — đây là chi tiết nội bộ phục vụ
    // optimistic locking, client không cần biết và không nên biết.
}
