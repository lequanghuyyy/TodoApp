package com.example.todoapp.constant;

/**
 * Application-wide API constants.
 *
 * <p>Centralises URL prefixes and header names to keep controllers DRY.
 */
public final class ApiConstants {

    private ApiConstants() {
        // Utility class – prevent instantiation
    }

    /** Base path for all Todo-related endpoints. */
    public static final String TODO_BASE_PATH = "/v1/todos";

    /** Default page size for paginated responses. */
    public static final int DEFAULT_PAGE_SIZE = 10;

    /** Maximum allowed page size to prevent abuse. */
    public static final int MAX_PAGE_SIZE = 100;
}
