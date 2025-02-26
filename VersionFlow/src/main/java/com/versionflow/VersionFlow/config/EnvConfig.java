package com.versionflow.VersionFlow.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EnvConfig {
    @Bean
    public Dotenv dotenv() {
        return Dotenv.configure()
                .directory(System.getProperty("user.dir")) // Set to project root
                .ignoreIfMissing() // Prevent errors if file is missing
                .load();
    }
}
