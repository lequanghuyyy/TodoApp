package com.example.todoapp.controller;

import com.example.todoapp.service.TaskService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {TaskController.class, TestExceptionController.class})
public class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TaskService taskService;

    @Test
    public void testMalformedJsonReturns400() throws Exception {
        String malformedJson = "{ \"title\": \"Test\", \"priority\": \"INVALID_PRIORITY\" "; // Missing closing brace

        mockMvc.perform(post("/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(malformedJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").exists())
                .andExpect(jsonPath("$.message").value("Định dạng dữ liệu không hợp lệ hoặc thiếu thông tin"))
                .andExpect(jsonPath("$.path").value("/tasks"));
    }

    @Test
    public void testMissingContentTypeReturns400Or415() throws Exception {
        // According to issue requirement: missing Content-Type or malformed json -> 400 or handled gracefully
        // Spring Boot normally returns 415 Unsupported Media Type for missing content type on @RequestBody.
        // We will test the malformed JSON which triggers HttpMessageNotReadableException.
        
        String invalidEnumJson = "{ \"title\": \"Test\", \"priority\": \"INVALID_ENUM\" }";
        mockMvc.perform(post("/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidEnumJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Định dạng dữ liệu không hợp lệ hoặc thiếu thông tin"));
    }

    @Test
    public void testUncaughtExceptionReturns500() throws Exception {
        mockMvc.perform(get("/test-exception"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.message").value("Đã có lỗi xảy ra, vui lòng thử lại sau"))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("test"))))
                .andExpect(jsonPath("$.error").exists());
    }
}
