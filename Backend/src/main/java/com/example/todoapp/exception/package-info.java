/**
 * Exception handling layer.
 *
 * <p>Contains:
 * <ul>
 *   <li>Custom domain exceptions (e.g., {@code ResourceNotFoundException})</li>
 *   <li>A global exception handler annotated with
 *       {@link org.springframework.web.bind.annotation.RestControllerAdvice}</li>
 * </ul>
 *
 * <p>All uncaught exceptions are intercepted here and transformed
 * into a consistent {@code ErrorResponse} JSON structure.
 */
package com.example.todoapp.exception;
