package com.drawvid.onlinelounge.model.game;

import com.drawvid.onlinelounge.model.game.Speed2D;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.awt.geom.Point2D;

@Getter
@Setter
@AllArgsConstructor
public class Player {
    private Point2D position;
    private String username;
    private Speed2D speed;
    private String id;
    private int size = 32;
    private boolean alive = true;

    public void update(double delta) {
        this.position.setLocation(this.position.getX() + this.speed.getSpeedX() * delta,
                this.position.getY() + this.speed.getSpeedY() * delta);
    }
}
