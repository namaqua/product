package com.pim.admin.controllers;

import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.application.Platform;
import com.pim.admin.MainApp;
import com.pim.admin.config.ApiConfig;
import com.pim.admin.api.AuthService;
import com.pim.admin.models.ApiResponse;
import com.pim.admin.models.AuthResponse;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.HashMap;
import java.util.Map;

public class LoginController {
    
    @FXML private TextField emailField;
    @FXML private PasswordField passwordField;
    @FXML private Button loginButton;
    @FXML private Label errorLabel;
    
    @FXML
    public void initialize() {
        // Set default credentials for demo
        emailField.setText("admin@test.com");
        passwordField.setText("Admin123!");
        errorLabel.setVisible(false);
    }
    
    @FXML
    public void handleLogin() {
        String email = emailField.getText();
        String password = passwordField.getText();
        
        if (email.isEmpty() || password.isEmpty()) {
            showError("Please enter email and password");
            return;
        }
        
        loginButton.setDisable(true);
        errorLabel.setVisible(false);
        
        Map<String, String> credentials = new HashMap<>();
        credentials.put("email", email);
        credentials.put("password", password);
        
        System.out.println("[Login] Attempting login with: " + email);
        
        AuthService authService = ApiConfig.createService(AuthService.class);
        authService.login(credentials).enqueue(new Callback<ApiResponse<AuthResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<AuthResponse>> call, 
                                 Response<ApiResponse<AuthResponse>> response) {
                Platform.runLater(() -> {
                    if (response.isSuccessful() && response.body() != null) {
                        ApiResponse<AuthResponse> apiResponse = response.body();
                        if (apiResponse.isSuccess() && apiResponse.getData() != null) {
                            AuthResponse authData = apiResponse.getData();
                            String token = authData.getAccessToken();
                            
                            if (token != null) {
                                System.out.println("[Login] Success! Token received");
                                ApiConfig.setAuthToken(token);
                                MainApp.showMainDashboard();
                            } else {
                                showError("No access token in response");
                            }
                        } else {
                            String message = apiResponse != null ? apiResponse.getMessage() : "Login failed";
                            showError(message);
                        }
                    } else {
                        showError("Login failed. Status: " + response.code());
                    }
                    loginButton.setDisable(false);
                });
            }
            
            @Override
            public void onFailure(Call<ApiResponse<AuthResponse>> call, Throwable t) {
                Platform.runLater(() -> {
                    System.err.println("[Login] Error: " + t.getMessage());
                    t.printStackTrace();
                    showError("Connection error. Check console for details.");
                    loginButton.setDisable(false);
                });
            }
        });
    }
    
    private void showError(String message) {
        errorLabel.setText(message);
        errorLabel.setVisible(true);
    }
}
