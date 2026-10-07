package com.example.demo.modules.account.controller;

import com.example.demo.modules.account.entity.ActivityLog;
import com.example.demo.modules.account.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity-logs")
@CrossOrigin(origins = "*")
public class ActivityLogController {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @GetMapping
    public List<ActivityLog> getLogs() {
        return activityLogRepository.findAllByOrderByTimestampDesc();
    }
}
