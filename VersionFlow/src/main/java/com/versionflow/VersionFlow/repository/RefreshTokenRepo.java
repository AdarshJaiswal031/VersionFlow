package com.versionflow.VersionFlow.repository;

import com.versionflow.VersionFlow.model.RefreshToken;
import com.versionflow.VersionFlow.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepo extends JpaRepository<RefreshToken,Long> {
    RefreshToken findByToken(String token);
    void deleteByUser(Users user);
}
