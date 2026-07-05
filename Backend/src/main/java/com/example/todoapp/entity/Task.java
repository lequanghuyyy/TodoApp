package com.example.todoapp.entity;

import com.example.todoapp.constant.Priority;
import com.example.todoapp.constant.TaskStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;


@Entity
@Table(name = "tasks")
@SQLRestriction("deleted_at IS NULL")  
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "INT UNSIGNED")
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 1000)
    @Builder.Default
    private String description = "";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TaskStatus status = TaskStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    @Version
    @Column(nullable = false)
    @Builder.Default
    private Long version = 0L;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Đánh dấu task là đã xoá (soft delete).
     * Gọi {@code taskRepository.save(task)} sau khi gọi method này.
     */
    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }

    /** Kiểm tra task đã bị soft-delete chưa. */
    public boolean isDeleted() {
        return deletedAt != null;
    }
}
