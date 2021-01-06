package com.drawvid.onlinelounge.service;

import com.drawvid.onlinelounge.model.util.ConnectedUser;
import com.drawvid.onlinelounge.model.game.Lounge;
import com.drawvid.onlinelounge.model.game.Player;
import com.drawvid.onlinelounge.model.util.enums.Topic;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.Setter;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.awt.geom.Point2D;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Getter
@Setter
public class GameService {
    private Lounge lounge;
    private Map<String, ConnectedUser> users;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private boolean running = false;

    ObjectMapper mapper = new ObjectMapper();

    public GameService(SimpMessagingTemplate simpMessagingTemplate) {
        this.users = new HashMap<>();
        this.lounge = new Lounge();
        this.simpMessagingTemplate = simpMessagingTemplate;
    }
    private void updatePlayers(double delta) {
        this.lounge.getPlayers().forEach((id, player) -> {
            player.update(delta);
        });
    }

    private boolean joinable() {
        return this.getLounge().getPlayers().size() < 10;
    }

    public boolean joinServer(ConnectedUser user) {
        if (this.joinable()) {
            this.addPlayer(user);
            if (!this.isRunning()) {
                this.run();
            }
            return true;
        }
        return false;
    }

    public void messageUser(ConnectedUser user, String topicString) {
        simpMessagingTemplate.convertAndSendToUser(user.getName(), topicString, "Hello " + user.getUsername() + " at " + new Date().toString());
    }

    public String updatePlayer(ConnectedUser user, String keyState) {
        Player player = this.lounge.getPlayers().get(user.getName());
        String response = "";
        try {
            List<String> keyStateList = this.mapper.readValue(keyState, ArrayList.class);
            System.out.println(keyStateList);
            response = this.mapper.writeValueAsString(this.lounge.getPlayers());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return response;
    }

    private void addPlayer(ConnectedUser user) {
        this.users.put(user.getName(), user);
        this.lounge.spawnPlayer(user.getName(), user.getUsername());
    }

    private void updateBullets(double delta) {
        this.lounge.getBullets().forEach(bullet -> {
            bullet.update(delta);
        });
    }

    private void checkBulletCollisions() {
        this.lounge.getBullets().forEach(bullet -> {
            this.lounge.getPlayers().forEach((id, player) -> {
                if (!player.getId().equals(bullet.getShotBy())) {
                    if ( player.getPosition().getX() < bullet.getPosition().getX() + bullet.getSize() &&
                            player.getPosition().getX() + player.getSize() > bullet.getPosition().getX() &&
                            player.getPosition().getY() + 2.0*player.getSize()/3.0 < bullet.getPosition().getY() + bullet.getSize() &&
                            player.getPosition().getY() + player.getSize() > bullet.getPosition().getY()) {
                        Player killer = this.lounge.getPlayers().get(bullet.getShotBy());
                        if (killer != null) {
                            bullet.setHit(true);
                            player.setAlive(false);
                        }
                    }
                }
            });
        });
        this.lounge.setBullets(this.lounge.getBullets().stream().filter(bullet -> !bullet.isHit()).collect(Collectors.toList()));
        this.lounge.getPlayers().entrySet().removeIf(player -> !player.getValue().isAlive());
    }

    private void updateGameState(double delta) {
        this.updatePlayers(delta);
        this.updateBullets(delta);
        this.checkBulletCollisions();
    }

    public void run() {
        this.setRunning(true);
        long lastLoopTime = System.nanoTime();
        final int TARGET_FPS = 60;
        final long OPTIMAL_TIME = 1000000000 / TARGET_FPS;
        long lastFpsTime = 0;
        int MESSAGE_INTERVAL = 1000000000;
        while (true) {
            long now = System.nanoTime();
            long updateLength = now - lastLoopTime;
            lastLoopTime = now;
            double delta = updateLength / ((double) OPTIMAL_TIME);

            lastFpsTime += updateLength;
            if (lastFpsTime >= 1000000000) {
                lastFpsTime = 0;
            }

            //todo: update game state here
            //this.updateGameState(delta);

            try {
                long gameTime = (lastLoopTime - System.nanoTime() + OPTIMAL_TIME) / 1000000;
                //System.out.println(gameTime);
                Thread.sleep(gameTime);
            } catch (Exception e) {
            }
        }
    }
}
