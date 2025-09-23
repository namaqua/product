package com.pim.admin.api;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;
import com.pim.admin.models.ApiResponse;
import com.pim.admin.models.AuthResponse;
import java.util.Map;

public interface AuthService {
    
    @POST("auth/login")
    Call<ApiResponse<AuthResponse>> login(@Body Map<String, String> credentials);
    
    @POST("auth/logout")
    Call<ApiResponse<Void>> logout();
}
