package com.example.demo.modules.account.service;

import com.example.demo.modules.account.entity.User;
import com.example.demo.modules.account.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.time.LocalDateTime;
import java.util.Random;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;

@Service
public class UserService {
	@Autowired
	private UserRepository userRepository;

	@Autowired
	private JavaMailSender mailSender;

	private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	public User register(User user) {
		if (userRepository.findByEmail(user.getEmail()).isPresent()) {
			throw new RuntimeException("Email đã tồn tại trong hệ thống");
		}
		user.setPassword(passwordEncoder.encode(user.getPassword()));
		user.setRole(User.Role.USER);
		user.setStatus(User.Status.ACTIVE);
		return userRepository.save(user);
	}

	public Optional<User> login(String email, String password) {
		Optional<User> userOpt = userRepository.findByEmail(email);
		if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
			return userOpt;
		}
		return Optional.empty();
	}

	public User googleLogin(String email, String name, String socialId, String avatar) {
		Optional<User> userOpt = userRepository.findByEmail(email);
		if (userOpt.isPresent()) {
			return userOpt.get();
		}
		User user = new User();
		user.setEmail(email);
		user.setName(name);
		user.setPassword(passwordEncoder.encode(socialId)); 
		user.setRole(User.Role.USER);
		user.setStatus(User.Status.ACTIVE);
		user.setSocialProvider(User.SocialProvider.GOOGLE);
		user.setSocialId(socialId);
		user.setAvatar(avatar);
		return userRepository.save(user);
	}

	public User facebookLogin(String email, String name, String socialId, String avatar) {
		Optional<User> userOpt = userRepository.findByEmail(email);
		if (userOpt.isPresent()) {
			return userOpt.get();
		}
		User user = new User();
		user.setEmail(email);
		user.setName(name);
		user.setPassword(passwordEncoder.encode(socialId));
		user.setRole(User.Role.USER);
		user.setStatus(User.Status.ACTIVE);
		user.setSocialProvider(User.SocialProvider.FACEBOOK);
		user.setSocialId(socialId);
		user.setAvatar(avatar);
		return userRepository.save(user);
	}

	public User updateProfile(Long userId, String name, String phone, String avatar) {
		Optional<User> userOpt = userRepository.findById(userId);
		if (userOpt.isPresent()) {
			User user = userOpt.get();
			if (name != null && !name.isEmpty()) user.setName(name);
			if (phone != null && !phone.isEmpty()) user.setPhone(phone);
			if (avatar != null && !avatar.isEmpty()) user.setAvatar(avatar);
			return userRepository.save(user);
		}
		throw new RuntimeException("Tài khoản không tồn tại");
	}

	public void updatePassword(Long userId, String oldPassword, String newPassword) {
		Optional<User> userOpt = userRepository.findById(userId);
		if (userOpt.isPresent()) {
			User user = userOpt.get();
			if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
				throw new RuntimeException("Mật khẩu cũ không chính xác");
			}
			user.setPassword(passwordEncoder.encode(newPassword));
			userRepository.save(user);
		} else {
			throw new RuntimeException("Tài khoản không tồn tại");
		}
	}

	public String generateOtp(String email) {
		Optional<User> userOpt = userRepository.findByEmail(email);
		if (!userOpt.isPresent()) {
			throw new RuntimeException("Email không tồn tại trong hệ thống");
		}
		User user = userOpt.get();
		String otp = String.format("%06d", new Random().nextInt(1000000));
		user.setOtpCode(otp);
		user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
		userRepository.save(user);

		try {
			SimpleMailMessage message = new SimpleMailMessage();
			message.setTo(email);
			message.setSubject("Mã xác minh khôi phục mật khẩu - BN Store");
			message.setText("Xin chào,\n\nMã OTP khôi phục mật khẩu của bạn là: " + otp + "\nMã này có hiệu lực trong vòng 5 phút.\n\nTrân trọng,\nBN Store");
			mailSender.send(message);
			System.out.println("Email sent successfully to " + email);
		} catch (Exception e) {
			System.err.println("[MAIL ERROR] Không thể gửi mail: " + e.getMessage());
			System.out.println("\n========================================================");
			System.out.println("====== [FALLBACK OTP LOG] OTP FOR " + email + " IS: " + otp + " ======");
			System.out.println("========================================================\n");
		}

		return otp;
	}

	public void resetPassword(String email, String otp, String newPassword) {
		Optional<User> userOpt = userRepository.findByEmail(email);
		if (!userOpt.isPresent()) {
			throw new RuntimeException("Email không tồn tại trong hệ thống");
		}
		User user = userOpt.get();
		if (user.getOtpCode() == null || !user.getOtpCode().equals(otp)) {
			throw new RuntimeException("Mã OTP không chính xác");
		}
		if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
			throw new RuntimeException("Mã OTP đã hết hạn");
		}

		user.setPassword(passwordEncoder.encode(newPassword));
		user.setOtpCode(null);
		user.setOtpExpiry(null);
		userRepository.save(user);
	}
}
