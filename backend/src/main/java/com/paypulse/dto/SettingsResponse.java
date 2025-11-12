package com.paypulse.dto;

public class SettingsResponse {
    private String baseCurrency;
    private boolean pinSet;

    public SettingsResponse(String baseCurrency, boolean pinSet) {
        this.baseCurrency = baseCurrency;
        this.pinSet = pinSet;
    }

    public String getBaseCurrency() {
        return baseCurrency;
    }

    public boolean isPinSet() {
        return pinSet;
    }
}

