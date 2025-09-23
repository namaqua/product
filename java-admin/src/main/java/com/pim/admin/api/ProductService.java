package com.pim.admin.api;

import retrofit2.Call;
import retrofit2.http.*;
import com.pim.admin.models.ApiResponse;
import com.pim.admin.models.Product;
import java.util.List;
import java.util.Map;

public interface ProductService {
    
    @GET("products")
    Call<ApiResponse<List<Product>>> getProducts();
    
    @GET("products/{id}")
    Call<ApiResponse<Product>> getProduct(@Path("id") String id);
    
    @POST("products")
    Call<ApiResponse<Product>> createProduct(@Body Product product);
    
    @PUT("products/{id}")
    Call<ApiResponse<Product>> updateProduct(@Path("id") String id, @Body Product product);
    
    @DELETE("products/{id}")
    Call<ApiResponse<Void>> deleteProduct(@Path("id") String id);
    
    @PATCH("products/{id}/status")
    Call<ApiResponse<Product>> updateStatus(@Path("id") String id, @Body Map<String, String> status);
}
