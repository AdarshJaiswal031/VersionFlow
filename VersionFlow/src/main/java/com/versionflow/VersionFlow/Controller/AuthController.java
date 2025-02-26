package com.versionflow.VersionFlow.Controller;

import com.versionflow.VersionFlow.service.JWTService;
import com.versionflow.VersionFlow.service.MyUserDetailsService;
import com.versionflow.VersionFlow.service.RefreshTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")

public class AuthController {

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private MyUserDetailsService myUserDetailsService;

    @Autowired
    private JWTService jwtService;

    @PostMapping("/refresh")
    private ResponseEntity<Map<String,String>> getNewToken(@RequestBody Map<String,String> request){
        String refreshToken=request.get("refreshToken");
        System.out.println("Refresh token : "+refreshToken);
        String username=refreshTokenService.extractUserName(refreshToken);
        UserDetails userDetails=myUserDetailsService.loadUserByUsername(username);
        if(refreshTokenService.isValidToken(refreshToken,userDetails)){
            String accessToken=jwtService.generateToken(userDetails.getUsername());
//          String refreshToken=jwtService.generateToken(userDetails.getUsername());
            Map<String, String> response = new HashMap<>();
            response.put("accessToken",accessToken);
            response.put("refreshToken",refreshToken);

            return ResponseEntity.ok(response);
        }
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", "Invalid or expired refresh token");
        return ResponseEntity.status(401).body(errorResponse);

    }

}
