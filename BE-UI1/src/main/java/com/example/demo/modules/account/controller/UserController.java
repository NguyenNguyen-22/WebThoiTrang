package com.example.demo.modules.account.controller;

import com.example.demo.modules.account.entity.User;
import com.example.demo.modules.account.repository.UserRepository;
import com.example.demo.modules.account.entity.ActivityLog;
import com.example.demo.modules.account.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email là bắt buộc"));
        }
        Optional<User> existing = userRepository.findByEmail(user.getEmail());
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email đã tồn tại"));
        }
        if (user.getRole() == null) {
            user.setRole(User.Role.USER);
        }
        if (user.getStatus() == null) {
            user.setStatus(User.Status.ACTIVE);
        }
        if (user.getSocialProvider() == null) {
            user.setSocialProvider(User.SocialProvider.LOCAL);
        }
        user.setCreatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails, @RequestHeader(value = "X-User-Name", defaultValue = "Hệ thống") String userName) {
        try {
            Optional<User> optionalUser = userRepository.findById(id);
            if (optionalUser.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            User user = optionalUser.get();
            String oldRole = user.getRole() != null ? user.getRole().name() : "N/A";
            
            if (userDetails.getName() != null) user.setName(userDetails.getName());
            if (userDetails.getPhone() != null) user.setPhone(userDetails.getPhone());
            if (userDetails.getRole() != null) user.setRole(userDetails.getRole());
            if (userDetails.getStatus() != null) user.setStatus(userDetails.getStatus());
            user.setUpdatedAt(LocalDateTime.now());
            
            User saved = userRepository.save(user);
            if (userDetails.getRole() != null) {
                activityLogRepository.save(new ActivityLog(userName, "Cập nhật quyền", "Đổi quyền của " + user.getEmail() + " thành " + userDetails.getRole().name()));
            }
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage(), "cause", e.getCause() != null ? e.getCause().getMessage() : ""));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, @RequestHeader(value = "X-User-Name", defaultValue = "Hệ thống") String userName) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        String email = userOptional.get().getEmail();
        userRepository.deleteById(id);
        activityLogRepository.save(new ActivityLog(userName, "Xóa người dùng", "Đã xóa người dùng: " + email));
        return ResponseEntity.ok().build();
    }
}
