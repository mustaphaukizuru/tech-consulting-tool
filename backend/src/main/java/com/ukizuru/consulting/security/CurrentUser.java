package com.ukizuru.consulting.security;

import com.ukizuru.consulting.exception.ForbiddenException;
import com.ukizuru.consulting.models.User;
import com.ukizuru.consulting.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrentUser {

    private final UserRepository userRepository;

    public User get() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ForbiddenException("Not authenticated");
        }
        String email = (auth.getPrincipal() instanceof UserDetails ud)
                ? ud.getUsername()
                : auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ForbiddenException("Current user not found"));
    }

    public Long id() {
        return get().getId();
    }

    public boolean hasRole(User.Role role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(role.authority()));
    }
}
