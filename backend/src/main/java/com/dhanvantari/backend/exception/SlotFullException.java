package com.dhanvantari.backend.exception;

public class SlotFullException extends RuntimeException {
    public SlotFullException(String message) {
        super(message);
    }
}
