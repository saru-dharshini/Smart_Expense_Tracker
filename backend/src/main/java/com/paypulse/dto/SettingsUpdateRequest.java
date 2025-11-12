package com.paypulse.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class SettingsUpdateRequest {

    @NotBlank
    private String baseCurrency;

    @Pattern(regexp = "^$|^[0-9]{4,6}$", message = "PIN must be 4-6 digits")
    private String newPin;

    public String getBaseCurrency() {
        return baseCurrency;
    }

    public void setBaseCurrency(String baseCurrency) {
        this.baseCurrency = baseCurrency;
    }

    public String getNewPin() {
        return newPin;
    }

    public void setNewPin(String newPin) {
        this.newPin = newPin;
    }
}

