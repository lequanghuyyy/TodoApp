package com.example.todoapp.service;

import com.example.todoapp.entity.Task;

import com.example.todoapp.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
public class TaskOptimisticLockingTest {

    @Autowired
    private TaskRepository taskRepository;

    @Test
    public void testOptimisticLocking() {
        // 1. Tạo task ban đầu
        Task task = new Task();
        task.setTitle("Test Locking");
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        Task savedTask = taskRepository.save(task);

        Long taskId = savedTask.getId();

        // 2. Load cùng một task thành 2 instance khác nhau
        // (Trong cùng 1 test không có @Transactional ở cấp class, gọi findById 2 lần 
        // có thể vẫn dùng cùng instance trong L1 cache nếu chung session. 
        // Tuy nhiên Spring Boot Data JPA không cấu hình Open-in-view trên Test 
        // hoặc chúng ta ép đọc lại).
        // Tốt nhất là dùng 2 phiên bản độc lập:
        Task instance1 = taskRepository.findById(taskId).orElseThrow();
        Task instance2 = taskRepository.findById(taskId).orElseThrow();

        // 3. User 1 sửa instance 1
        instance1.setTitle("Title by User 1");
        taskRepository.save(instance1);
        taskRepository.flush(); // Cập nhật DB, version tăng lên

        // 4. User 2 sửa instance 2 (mang version cũ) và cố gắng lưu -> Phải lỗi 409
        instance2.setTitle("Title by User 2");
        
        Exception ex = assertThrows(ObjectOptimisticLockingFailureException.class, () -> {
            taskRepository.save(instance2);
            taskRepository.flush(); // Flush để trigger hibernate chạy UPDATE query và phát hiện lỗi version
        });

        assertTrue(ex.getMessage().contains("Task"));
    }
}
