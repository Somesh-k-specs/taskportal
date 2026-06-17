package com.taskportal.backend.repository;

import com.taskportal.backend.model.Task;
import com.taskportal.backend.model.Task.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserUsername(String username);
    List<Task> findByUserUsernameAndStatus(String username, Status status);
    Optional<Task> findByIdAndUserUsername(Long id, String username);
}