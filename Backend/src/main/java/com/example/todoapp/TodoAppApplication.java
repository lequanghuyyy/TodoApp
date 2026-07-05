package com.example.todoapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Todo List Management Application.
 *
 * <p>This application provides RESTful APIs to manage tasks,
 * including CRUD operations, status filtering, and search capabilities.
 *
 * <p>Run with an active Spring profile (dev | test | prod):
 * <pre>
 *   java -jar todoapp.jar --spring.profiles.active=dev
 * </pre>
 */
@SpringBootApplication
public class TodoAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(TodoAppApplication.class, args);
    }
}
