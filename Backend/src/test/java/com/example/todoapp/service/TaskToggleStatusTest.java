package com.example.todoapp.service;

import com.example.todoapp.constant.TaskStatus;
import com.example.todoapp.entity.Task;
import com.example.todoapp.exception.ResourceNotFoundException;
import com.example.todoapp.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class TaskToggleStatusTest {

    @Autowired
    private TaskService taskService;

    @Autowired
    private TaskRepository taskRepository;

    @Test
    public void testToggleStatusSuccess() {
        // 1. Tạo task ban đầu
        Task task = new Task();
        task.setTitle("Test Toggle");
        task.setStatus(TaskStatus.PENDING);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        Task savedTask = taskRepository.save(task);

        // 2. Lần 1: PENDING -> COMPLETED
        var dto = taskService.toggleStatus(savedTask.getId());
        assertEquals(TaskStatus.COMPLETED, dto.getStatus());

        // 3. Lần 2: COMPLETED -> PENDING
        var dto2 = taskService.toggleStatus(savedTask.getId());
        assertEquals(TaskStatus.PENDING, dto2.getStatus());
    }

    @Test
    public void testToggleStatusNotFound() {
        assertThrows(ResourceNotFoundException.class, () -> taskService.toggleStatus(99999L));
    }

    @Test
    public void testToggleStatusConcurrentRaceCondition() throws InterruptedException {
        // Tạo task ban đầu
        Task task = new Task();
        task.setTitle("Concurrent Toggle");
        task.setStatus(TaskStatus.PENDING);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        Task savedTask = taskRepository.save(task);
        Long taskId = savedTask.getId();

        int threadCount = 2;
        ExecutorService executorService = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger lockFailureCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            executorService.submit(() -> {
                try {
                    latch.await();
                    taskService.toggleStatus(taskId);
                    successCount.incrementAndGet();
                } catch (ObjectOptimisticLockingFailureException e) {
                    lockFailureCount.incrementAndGet();
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        // Kích hoạt tất cả thread cùng chạy
        latch.countDown();
        doneLatch.await();
        executorService.shutdown();

        // Trong trường hợp hoàn hảo (2 request chạy song song), 1 thành công, 1 thất bại (LockingFailure).
        // Tuy nhiên do môi trường test, các thread có thể chạy tuần tự.
        // Dù thế nào, tổng số request được xử lý (thành công hoặc văng lỗi version) phải bằng threadCount.
        assertTrue(successCount.get() >= 1, "Phải có ít nhất 1 request thành công");
        assertEquals(threadCount, successCount.get() + lockFailureCount.get(), 
                "Mọi request phải hoặc thành công hoặc gặp lỗi Optimistic Locking");
    }
}
