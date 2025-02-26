package com.versionflow.VersionFlow.model;

import jakarta.persistence.*;
import lombok.*;

import javax.management.ConstructorParameters;

@Entity
@Table(name="users")
@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NonNull
    private String email;
    @NonNull
    private String username;
    @NonNull
    private String password;


    @Override
    public String toString() {
        return "Users{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                '}';
    }
}
