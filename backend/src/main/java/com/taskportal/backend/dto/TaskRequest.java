package com.taskportal.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class TaskRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String priority = "MEDIUM";

    private String status = "TODO";

    private LocalDate dueDate;
}