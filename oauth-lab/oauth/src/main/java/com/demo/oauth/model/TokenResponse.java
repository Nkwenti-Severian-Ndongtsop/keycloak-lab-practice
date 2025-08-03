package com.demo.oauth.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TokenResponse {
    @JsonProperty("access_token")
    private String accessToken;
    
    @JsonProperty("refresh_token")
    private String refreshToken;
    
    @JsonProperty("id_token")
    private String idToken;
    
    @JsonProperty("expires_in")
    private Integer expiresIn;
    
    @JsonProperty("token_type")
    private String tokenType;
    
    @JsonProperty("scope")
    private String scope;

    // Default constructor
    public TokenResponse() {}

    // Constructor with all fields
    public TokenResponse(String accessToken, String refreshToken, String idToken, 
                       Integer expiresIn, String tokenType, String scope) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.idToken = idToken;
        this.expiresIn = expiresIn;
        this.tokenType = tokenType;
        this.scope = scope;
    }

    // Getters and Setters
    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }

    public Integer getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(Integer expiresIn) {
        this.expiresIn = expiresIn;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getScope() {
        return scope;
    }

    public void setScope(String scope) {
        this.scope = scope;
    }

    @Override
    public String toString() {
        return "TokenResponse{" +
                "accessToken='" + accessToken + '\'' +
                ", refreshToken='" + refreshToken + '\'' +
                ", idToken='" + idToken + '\'' +
                ", expiresIn=" + expiresIn +
                ", tokenType='" + tokenType + '\'' +
                ", scope='" + scope + '\'' +
                '}';
    }
} 