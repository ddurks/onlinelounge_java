package com.drawvid.onlinelounge.controller;

import com.drawvid.onlinelounge.model.util.ConnectedUser;
import com.drawvid.onlinelounge.model.util.enums.Topic;
import com.drawvid.onlinelounge.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

@Controller
public class GameController {
	@Autowired
	private GameService gameService;

	@Autowired
	private SimpMessagingTemplate messagingTemplate;

	@MessageMapping("/chat")
	@SendTo(Topic.CHAT)
	public String chatMessage(String message, ConnectedUser user) throws Exception {
		return user.getUsername() + ": " + message;
	}

	@MessageMapping("/join")
	@SendToUser(Topic.ACCESS)
	public String joinServer(String username, ConnectedUser user) throws Exception {
		user.setUsername(username);
		if (this.gameService.joinServer(user)) {
			System.out.println("ACCESS GRANTED: " + user.getUsername() + " - " + user.getName());
			return "ACCESSGRANTED:" + user.getUsername();
		}
		System.out.println("ACCESS DENIED: " + username);
		return "ACCESS DENIED";
	}

	@MessageMapping("/update/player")
	@SendTo(Topic.STATE)
	public String updateplayer(String keyState, ConnectedUser user) throws Exception {
		//System.out.println(user.getUsername() + keyState);
		return gameService.updatePlayer(user, keyState);
	}
}
