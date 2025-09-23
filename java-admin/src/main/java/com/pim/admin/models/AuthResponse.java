package com.pim.admin.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AuthResponse {
    
    @JsonProperty("accessToken")
    private String accessToken;
    
    @JsonProperty("access_token") 
    private String access_token;
    
    @JsonProperty("refreshToken")
    private String refreshToken;
    
    @JsonProperty("refresh_token")
    private String refresh_token;
    
    @JsonProperty("user")
    private Object user;
    
    // Get token from either field
    public String getAccessToken() {
        return accessToken != null ? accessToken : access_token;
    }
    
    public String getRefreshToken() {
        return refreshToken != null ? refreshToken : refresh_token;
    }
    
    public void setAccessToken(String token) {
        this.accessToken = token;
        this.access_token = token;
    }
    
    public void setRefreshToken(String token) {
        this.refreshToken = token;
        this.refresh_token = token;
    }
    
    public Object getUser() {
        return user;
    }
    
    public void setUser(Object user) {
        this.user = user;
    }
}
