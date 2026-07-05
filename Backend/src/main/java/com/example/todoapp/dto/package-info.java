/**
 * DTO (Data Transfer Object) layer.
 *
 * <p>Sub-packages:
 * <ul>
 *   <li>{@code request} – objects received from clients (inbound payloads)</li>
 *   <li>{@code response} – objects sent back to clients (outbound payloads)</li>
 * </ul>
 *
 * <p>DTOs are immutable-by-intent (use Lombok {@code @Value} or record types
 * where appropriate) and carry validation annotations for request objects.
 */
package com.example.todoapp.dto;
