package com.example.todoapp.dto.request;

import com.example.todoapp.constant.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class TaskRequestDTO {

    @NotBlank(message = "Title không được để trống")
    @Size(max = 200, message = "Title tối đa 200 ký tự")
    private String title;

    @Size(max = 1000, message = "Description tối đa 1000 ký tự")
    private String description;

    // Nullable — service sẽ set MEDIUM nếu null
    private Priority priority;

    /**
     * Ngày dự kiến hoàn thành. Nullable — để trống = không có deadline.
     * Cho phép ngày quá khứ có chủ đích.
     * Nếu sai định dạng, GlobalExceptionHandler bắt HttpMessageNotReadableException → 400.
     */
    private LocalDate dueDate;
}
