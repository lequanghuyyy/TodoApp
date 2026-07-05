package com.example.todoapp.dto.request;

import com.example.todoapp.constant.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

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
}
