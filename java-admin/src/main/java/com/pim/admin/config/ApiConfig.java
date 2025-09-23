package com.pim.admin.config;

import retrofit2.Retrofit;
import retrofit2.converter.jackson.JacksonConverterFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import java.util.concurrent.TimeUnit;

public class ApiConfig {
    
    // Match React admin configuration
    private static final String BASE_URL = "http://localhost:3010/api/";
    private static Retrofit retrofit;
    private static String authToken;
    
    public static void initialize() {
        OkHttpClient client = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .addInterceptor(chain -> {
                Request original = chain.request();
                Request.Builder builder = original.newBuilder()
                    .header("Content-Type", "application/json");
                
                if (authToken != null) {
                    builder.header("Authorization", "Bearer " + authToken);
                }
                
                // Simple console logging
                Request request = builder.build();
                System.out.println("[API] " + request.method() + " " + request.url());
                
                return chain.proceed(request);
            })
            .build();
        
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        // Configure to ignore unknown properties
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        mapper.configure(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY, true);
        
        retrofit = new Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(JacksonConverterFactory.create(mapper))
            .build();
    }
    
    public static <T> T createService(Class<T> serviceClass) {
        return retrofit.create(serviceClass);
    }
    
    public static void setAuthToken(String token) {
        authToken = token;
        initialize(); // Reinitialize with token
    }
}
