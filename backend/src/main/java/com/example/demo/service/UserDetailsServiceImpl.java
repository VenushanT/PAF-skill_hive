package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String loginIdentifier) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(loginIdentifier)
            .orElseGet(() -> userRepository.findByEmail(loginIdentifier)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + loginIdentifier)));

        return new org.springframework.security.core.userdetails.User(
            user.getUsername(), // Username is still the principal identifier for Spring Security
            user.getPassword(),
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}