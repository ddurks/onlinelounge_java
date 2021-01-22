package com.drawvid.onlinelounge.model.game;

import lombok.Getter;
import lombok.Setter;

import java.awt.geom.Point2D;

@Getter
@Setter
public class Bullet {
    private String id;
    private Point2D position;
    private Vector2D velocity;
    private String shotBy;
    private int size = 16;
    private boolean hit = false;

    public void update(double delta) {
        this.position.setLocation(this.position.getX() + this.velocity.getX() * delta,
                this.position.getY() + this.velocity.getY() * delta);
    }
}
