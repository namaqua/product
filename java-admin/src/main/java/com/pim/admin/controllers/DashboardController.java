package com.pim.admin.controllers;

import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.application.Platform;
import com.pim.admin.models.Product;
import com.pim.admin.models.ApiResponse;
import com.pim.admin.api.ProductService;
import com.pim.admin.config.ApiConfig;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.List;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DashboardController {
    
    @FXML private TableView<Product> productsTable;
    @FXML private TableColumn<Product, String> idColumn;
    @FXML private TableColumn<Product, String> nameColumn;
    @FXML private TableColumn<Product, String> skuColumn;
    @FXML private TableColumn<Product, String> priceColumn;
    @FXML private TableColumn<Product, Integer> quantityColumn;
    @FXML private TableColumn<Product, String> statusColumn;
    @FXML private TableColumn<Product, Boolean> featuredColumn;
    @FXML private TableColumn<Product, Void> actionsColumn;
    @FXML private TextField searchField;
    @FXML private Label statusLabel;
    @FXML private Label timeLabel;
    @FXML private Label pageLabel;
    
    private ObservableList<Product> products = FXCollections.observableArrayList();
    private ProductService productService;
    
    @FXML
    public void initialize() {
        productService = ApiConfig.createService(ProductService.class);
        setupTable();
        loadProducts();
        updateTime();
    }
    
    private void setupTable() {
        idColumn.setCellValueFactory(new PropertyValueFactory<>("id"));
        nameColumn.setCellValueFactory(new PropertyValueFactory<>("name"));
        skuColumn.setCellValueFactory(new PropertyValueFactory<>("sku"));
        priceColumn.setCellValueFactory(new PropertyValueFactory<>("price"));
        quantityColumn.setCellValueFactory(new PropertyValueFactory<>("quantity"));
        statusColumn.setCellValueFactory(new PropertyValueFactory<>("status"));
        featuredColumn.setCellValueFactory(new PropertyValueFactory<>("isFeatured"));
        
        productsTable.setItems(products);
    }
    
    private void loadProducts() {
        statusLabel.setText("Loading products...");
        
        productService.getProducts().enqueue(new Callback<ApiResponse<List<Product>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Product>>> call, 
                                 Response<ApiResponse<List<Product>>> response) {
                Platform.runLater(() -> {
                    if (response.isSuccessful() && response.body() != null) {
                        ApiResponse<List<Product>> apiResponse = response.body();
                        if (apiResponse.isSuccess()) {
                            products.clear();
                            products.addAll(apiResponse.getData());
                            statusLabel.setText("Loaded " + products.size() + " products");
                        } else {
                            showAlert("Error", apiResponse.getMessage());
                        }
                    }
                });
            }
            
            @Override
            public void onFailure(Call<ApiResponse<List<Product>>> call, Throwable t) {
                Platform.runLater(() -> {
                    showAlert("Connection Error", t.getMessage());
                    statusLabel.setText("Failed to load products");
                });
            }
        });
    }
    
    @FXML
    public void handleRefresh() {
        loadProducts();
    }
    
    @FXML
    public void handleSearch() {
        // Implement search functionality
    }
    
    @FXML
    public void handleAddProduct() {
        // Open add product dialog
    }
    
    @FXML
    public void handleViewProducts() {
        loadProducts();
    }
    
    @FXML
    public void handleLogout() {
        Platform.exit();
    }
    
    @FXML
    public void handleExit() {
        Platform.exit();
    }
    
    @FXML
    public void handleAbout() {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle("About");
        alert.setHeaderText("PIM Admin Desktop");
        alert.setContentText("JavaFX Admin Interface for PIM System\nVersion 1.0.0");
        alert.showAndWait();
    }
    
    @FXML
    public void handlePrevPage() {
        // Implement pagination
    }
    
    @FXML
    public void handleNextPage() {
        // Implement pagination
    }
    
    private void updateTime() {
        Thread thread = new Thread(() -> {
            while (true) {
                Platform.runLater(() -> {
                    timeLabel.setText(LocalDateTime.now()
                        .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
                });
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    break;
                }
            }
        });
        thread.setDaemon(true);
        thread.start();
    }
    
    private void showAlert(String title, String content) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle(title);
        alert.setContentText(content);
        alert.showAndWait();
    }
}
