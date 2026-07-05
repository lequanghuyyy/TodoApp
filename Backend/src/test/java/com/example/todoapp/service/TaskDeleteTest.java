package com.example.todoapp.service;

import com.example.todoapp.entity.Task;
import com.example.todoapp.exception.ResourceNotFoundException;
import com.example.todoapp.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class TaskDeleteTest {

    @Autowired
    private TaskService taskService;

    @Autowired
    private TaskRepository taskRepository;

    @Test
    @Transactional
    public void testDoubleDelete() {
        // 1. Tạo task ban đầu
        Task task = new Task();
        task.setTitle("Test Delete");
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        Task savedTask = taskRepository.save(task);

        Long taskId = savedTask.getId();

        // 2. Lần xoá đầu tiên (phải thành công)
        assertDoesNotThrow(() -> taskService.deleteTask(taskId));

        // Kiểm tra xem database đã cập nhật deleted_at chưa (tuỳ thuộc vào context, 
        // ở mức độ ServiceTest, ta dùng findByIdIncludeDeleted để xem nếu có native query)
        // Nhưng theo yêu cầu bài, lần gọi xóa thứ 2 phải throw exception.

        // 3. Lần xoá thứ hai (mô phỏng double click)
        // Vì Hibernate @SQLRestriction sẽ che các task có deleted_at != null khỏi findById,
        // lần gọi thứ 2 sẽ văng ResourceNotFoundException thay vì 204 hay 500.
        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> {
            taskService.deleteTask(taskId);
        });

        assertTrue(ex.getMessage().contains("Không tìm thấy công việc với id: " + taskId));
    }
}
