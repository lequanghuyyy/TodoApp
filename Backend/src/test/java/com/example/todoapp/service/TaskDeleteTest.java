package com.example.todoapp.service;

import com.example.todoapp.entity.Task;
import com.example.todoapp.exception.ResourceNotFoundException;
import com.example.todoapp.repository.TaskRepository;
import jakarta.persistence.EntityManager;
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

    @Autowired
    private EntityManager entityManager;

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

        // Xoá L1 cache để ép Hibernate query DB lại, 
        // nhờ đó @SQLRestriction mới được áp dụng.
        entityManager.flush();
        entityManager.clear();

        // 3. Lần xoá thứ hai (mô phỏng double click)
        // Vì Hibernate @SQLRestriction sẽ che các task có deleted_at != null khỏi findById,
        // lần gọi thứ 2 sẽ văng ResourceNotFoundException thay vì 204 hay 500.
        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> {
            taskService.deleteTask(taskId);
        });

        assertTrue(ex.getMessage().contains("Không tìm thấy công việc với id: " + taskId));

        // 4. Verify dữ liệu vẫn còn vật lý trong DB (native query bypass @SQLRestriction)
        Object physicalCount = entityManager.createNativeQuery("SELECT COUNT(*) FROM tasks WHERE id = :id")
                .setParameter("id", taskId)
                .getSingleResult();
        assertEquals(1L, ((Number) physicalCount).longValue(), "Dữ liệu vật lý phải còn tồn tại trong bảng tasks");

        Object deletedAt = entityManager.createNativeQuery("SELECT deleted_at FROM tasks WHERE id = :id")
                .setParameter("id", taskId)
                .getSingleResult();
        assertNotNull(deletedAt, "Trường deleted_at phải được set != null");
    }
}
