package com.demo.oauth.repository;

import com.demo.oauth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByExternalId(String externalId);
    
    boolean existsByEmail(String email);
    
    Optional<User> findByEmailAndAuthProvider(String email, String authProvider);
} 