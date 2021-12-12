package com.drawvid.onlinelounge.model.game;

public enum Key {
    W  (0),
    A (1),
    S  (2),
    D (3)
    ;


    private final int keyCode;

    Key(int keyCode) {
        this.keyCode = keyCode;
    }

    public int getkeyCode() {
        return this.keyCode;
    }
}
