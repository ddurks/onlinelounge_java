package com.drawvid.onlinelounge.controller;

import com.drawvid.onlinelounge.model.message.ConnectionResultMessage;
import com.drawvid.onlinelounge.model.util.ConnectedUser;
import com.drawvid.onlinelounge.model.util.enums.Topic;
import com.drawvid.onlinelounge.service.GameService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Controller
public class GameController {
	@Autowired
	private GameService gameService;

	@Autowired
	private SimpMessagingTemplate messagingTemplate;

	private ObjectMapper mapper = new ObjectMapper();

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
			gameService.broadcastGameState();
			return "ACCESS GRANTED: " + user.getUsername() + " - " + user.getName();
		}
		System.out.println("ACCESS DENIED: " + username);
		return "ACCESS DENIED: " + user.getUsername() + " - " + user.getName();
	}

	@MessageMapping("/update/player")
	@SendTo(Topic.STATE)
	public void updateplayer(String keyState, ConnectedUser user) throws Exception {
		//System.out.println(user.getUsername() + keyState);
		gameService.updatePlayer(user, keyState);
	}

	@EventListener
	public void onDisconnectEvent(SessionDisconnectEvent event) {
		try {
			String userId = event.getUser().getName();
			System.out.println(userId + " has disconnected");
			this.gameService.leaveServer(userId);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}