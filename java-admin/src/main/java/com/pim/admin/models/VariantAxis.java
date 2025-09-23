package com.pim.admin.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class VariantAxis {
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("values")
    private List<String> values;
    
    // Getters and Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public List<String> getValues() {
        return values;
    }
    
    public void setValues(List<String> values) {
        this.values = values;
    }
}
