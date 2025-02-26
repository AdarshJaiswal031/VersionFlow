package com.versionflow.VersionFlow.service;

import com.versionflow.VersionFlow.model.RefreshToken;
import com.versionflow.VersionFlow.repository.RefreshTokenRepo;
import com.versionflow.VersionFlow.repository.UserRepo;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.*;

@Service
public class RefreshTokenService {

    @Value("${jwt.refresh.secret}")
    private String secretKey;

    @Autowired
    private RefreshTokenRepo refreshTokenRepo;

    @Autowired
    private UserRepo userRepo;

    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        String token = Jwts.builder()
                .claims()
                .add(claims)
                .id(UUID.randomUUID().toString())
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + (5 * 60 * 60 * 1000)))
                .and()
                .signWith(getKey())
                .compact();

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(token);
        refreshToken.setUser(userRepo.findByUsername(username));
        refreshToken.setExpiryDate(Instant.ofEpochMilli(System.currentTimeMillis() + 20 * 60 * 60 * 1000));
        refreshToken.setIsRevoked(false);
        refreshTokenRepo.save(refreshToken);

        return token;
    }

    private SecretKey getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUserName(String token) {
        return getClaims(token).getSubject();
    }

    public boolean isValidToken(String token, UserDetails userDetails) {
        final String username = extractUserName(token);
        RefreshToken refreshToken = refreshTokenRepo.findByToken(token);

        return refreshToken != null &&
                !refreshToken.getIsRevoked() &&
                refreshToken.getUser().getUsername().equals(username) &&
                !isTokenExpired(token) &&
                refreshToken.getExpiryDate().isAfter(Instant.now()) &&
                username.equals(userDetails.getUsername());
    }

    private Claims getClaims(String token){
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private boolean isTokenExpired(String token) {
        return getClaims(token).getExpiration().before(new Date());
    }
}

