package com.drawvid.onlinelounge.model.game;

import lombok.Getter;
import lombok.Setter;

import java.awt.geom.Point2D;
import java.util.*;

@Getter
@Setter
public class Lounge {
    private Map<String, Player> players = new HashMap<>();
    private List<Obstacle> obstacles = new ArrayList<>();
    private List<Bullet> bullets = new ArrayList<>();

    public Lounge() {

    }

    public void spawnPlayer(String id, String username) {
        this.players.put(id, new Player(new Point2D.Double(50, 50),username, new Vector2D(0.0, 0.0), id, "", false, 32, true));
    }
}
