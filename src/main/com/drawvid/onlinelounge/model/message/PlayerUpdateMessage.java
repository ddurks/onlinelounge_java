package com.drawvid.onlinelounge.model.message;

import com.drawvid.onlinelounge.model.game.Vector2D;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PlayerUpdateMessage {
    String msg;
    boolean typing;
    int[] keysPressed;
    Vector2D position;
    Vector2D velocity;
}
