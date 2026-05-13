package com.ukizuru.consulting.services;

import com.ukizuru.consulting.config.JwtUtil;
import com.ukizuru.consulting.dto.AuthDTO;
import com.ukizuru.consulting.exception.ConflictException;
import com.ukizuru.consulting.models.User;
import com.ukizuru.consulting.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new ConflictException("Email already registered");
        }

        // SECURITY: role is NEVER taken from the request. New users are always CLIENT.
        User user = User.builder()
                .fullName(req.fullName().trim())
                .email(req.email().toLowerCase().trim())
                .password(passwordEncoder.encode(req.password()))
                .role(User.Role.CLIENT)
                .build();

        userRepository.save(user);
        return issueTokens(user);
    }

    @Transactional(readOnly = true)
    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest req) {
        // Lets AuthenticationException bubble up — GlobalExceptionHandler maps to a generic
        // "Invalid credentials" response to avoid leaking which half was wrong.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email().toLowerCase(), req.password())
        );

        User user = userRepository.findByEmail(req.email().toLowerCase())
                .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException("Invalid credentials"));

        return issueTokens(user);
    }

    @Transactional(readOnly = true)
    public AuthDTO.AuthResponse refresh(AuthDTO.RefreshRequest req) {
        String email;
        try {
            email = jwtUtil.extractUsername(req.refreshToken());
        } catch (Exception e) {
            throw new org.springframework.security.authentication.BadCredentialsException("Invalid refresh token");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException("Invalid refresh token"));
        UserDetails ud = userDetailsService.loadUserByUsername(email);
        if (!jwtUtil.isValid(req.refreshToken(), ud)) {
            throw new org.springframework.security.authentication.BadCredentialsException("Invalid refresh token");
        }
        return issueTokens(user);
    }

    private AuthDTO.AuthResponse issueTokens(User user) {
        UserDetails ud = userDetailsService.loadUserByUsername(user.getEmail());
        String access = jwtUtil.generateAccessToken(ud);
        String refresh = jwtUtil.generateRefreshToken(ud);
        return new AuthDTO.AuthResponse(
                access,
                refresh,
                new AuthDTO.UserSummary(user.getId(), user.getEmail(), user.getFullName(), user.getRole().name())
        );
    }
}
