package com.versionflow.VersionFlow.service;

import com.versionflow.VersionFlow.model.UserPrinciple;
import com.versionflow.VersionFlow.model.Users;
import com.versionflow.VersionFlow.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepo repo;

    @Override
    public UserDetails loadUserByUsername(String username){
        Users user=repo.findByUsername(username);
        if(user==null){
            System.out.println("User not found!!");
            return null;
        }
        return new UserPrinciple(user);
    }
}
