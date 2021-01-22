package com.drawvid.onlinelounge.model.message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StateUpdateMessage {
    List<PlayerUpdateMessage> playerUpdates;
}
