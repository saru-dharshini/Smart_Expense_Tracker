package com.paypulse.service;

import com.paypulse.dto.SettingsResponse;
import com.paypulse.dto.SettingsUpdateRequest;
import com.paypulse.entity.User;
import com.paypulse.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public SettingsService(CurrentUserService currentUserService,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.currentUserService = currentUserService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public SettingsResponse getSettings() {
        User user = currentUserService.getCurrentUser();
        return new SettingsResponse(user.getBaseCurrency(), user.getSecurityPinHash() != null);
    }

    @Transactional
    public SettingsResponse updateSettings(SettingsUpdateRequest request) {
        User user = currentUserService.getCurrentUser();
        user.setBaseCurrency(request.getBaseCurrency());
        if (request.getNewPin() != null && !request.getNewPin().isEmpty()) {
            user.setSecurityPinHash(passwordEncoder.encode(request.getNewPin()));
        }
        userRepository.save(user);
        return new SettingsResponse(user.getBaseCurrency(), user.getSecurityPinHash() != null);
    }
}

