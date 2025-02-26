package com.versionflow.VersionFlow.Controller;

import com.versionflow.VersionFlow.model.UserPrinciple;
import com.versionflow.VersionFlow.model.Users;
import com.versionflow.VersionFlow.repository.UserRepo;
import com.versionflow.VersionFlow.service.JWTService;
import com.versionflow.VersionFlow.service.MyUserDetailsService;
import com.versionflow.VersionFlow.service.RefreshTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth/google")
public class OAuthController {

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String client_id;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String client_secret;

    @Value("${spring.security.oauth2.client.registration.google.redirect-uri}")
    private String redirect_uri;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private MyUserDetailsService myUserDetailsService;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/callback")
    public ResponseEntity<Map<String,String>> getUserDetails(@RequestParam("code") String code) {
        try {
            String tokenEndPoint = "https://oauth2.googleapis.com/token";

            // Prepare parameters for token exchange
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("code", code);
            params.add("client_id", client_id);
            params.add("client_secret", client_secret);
            params.add("redirect_uri", redirect_uri);
            params.add("grant_type", "authorization_code");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

            // Exchange code for token
            ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(tokenEndPoint, request, Map.class);

            if (tokenResponse.getStatusCode() != HttpStatus.OK || tokenResponse.getBody() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }

            String idToken = (String) tokenResponse.getBody().get("id_token");

            // Get user info using idToken
            String userInfoUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
            ResponseEntity<Map> userInfoResponse = restTemplate.getForEntity(userInfoUrl, Map.class);
            String jwtToken=null;
            String refreshJwtToken=null;
            if (userInfoResponse.getStatusCode() == HttpStatus.OK && userInfoResponse.getBody() != null) {
                String email = (String) userInfoResponse.getBody().get("email");
                String username=email.split("@")[0];
                UserDetails userDetails=myUserDetailsService.loadUserByUsername(username);
                if(userDetails==null){
                    String password=passwordEncoder.encode(UUID.randomUUID().toString());
                    Users user=new Users(email,username,password);
                    userRepo.save(user);
                    userDetails=myUserDetailsService.loadUserByUsername(username);


                }
                if(userDetails!=null){
                    jwtToken=jwtService.generateToken(userDetails.getUsername());
                    refreshJwtToken=refreshTokenService.generateToken(userDetails.getUsername());

                }
                Map<String, String> response = new HashMap<>();
                response.put("accessToken",jwtToken);
                response.put("refreshToken",refreshJwtToken);
                return ResponseEntity.ok(response);
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);

        } catch (Exception e) {
            e.printStackTrace(); // Log the actual error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
