package com.example.demo.modules.account.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String name;
	private String email;
	private String password;
	private String phone;
	private String avatar;

	@Enumerated(EnumType.STRING)
	private Role role;

	@Enumerated(EnumType.STRING)
	private Status status;

	@Column(name = "social_provider")
	@Enumerated(EnumType.STRING)
	private SocialProvider socialProvider;

	@Column(name = "social_id")
	private String socialId;

	@Column(name = "created_at")
	private LocalDateTime createdAt;

	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	@Column(name = "otp_code")
	private String otpCode;

	@Column(name = "otp_expiry")
	private LocalDateTime otpExpiry;


	// Getters and setters
	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public String getName() { return name; }
	public void setName(String name) { this.name = name; }

	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }

	public String getPassword() { return password; }
	public void setPassword(String password) { this.password = password; }

	public String getPhone() { return phone; }
	public void setPhone(String phone) { this.phone = phone; }

	public String getAvatar() { return avatar; }
	public void setAvatar(String avatar) { this.avatar = avatar; }

	public Role getRole() { return role; }
	public void setRole(Role role) { this.role = role; }

	public Status getStatus() { return status; }
	public void setStatus(Status status) { this.status = status; }

	public SocialProvider getSocialProvider() { return socialProvider; }
	public void setSocialProvider(SocialProvider socialProvider) { this.socialProvider = socialProvider; }

	public String getSocialId() { return socialId; }
	public void setSocialId(String socialId) { this.socialId = socialId; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public LocalDateTime getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

	public String getOtpCode() { return otpCode; }
	public void setOtpCode(String otpCode) { this.otpCode = otpCode; }

	public LocalDateTime getOtpExpiry() { return otpExpiry; }
	public void setOtpExpiry(LocalDateTime otpExpiry) { this.otpExpiry = otpExpiry; }

	public enum Role { EMPLOYEE, ADMIN, USER, employee, admin, user }
	public enum Status { ACTIVE, INACTIVE, active, inactive }
	public enum SocialProvider { LOCAL, GOOGLE, FACEBOOK, local, google, facebook }
}
