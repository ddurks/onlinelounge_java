package com.drawvid.onlinelounge.model.game;

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
    private Vector2D velocity;
    private String id;
    private String msg;
    private int size = 32;
    private boolean alive = true;

    public void update(double delta) {
        this.position.setLocation(this.position.getX() + this.velocity.getX() * delta,
                this.position.getY() + this.velocity.getY() * delta);
    }
}
