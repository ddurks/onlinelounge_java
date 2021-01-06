package com.drawvid.onlinelounge.model.util;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.security.Principal;

@AllArgsConstructor
@Setter
@Getter
public class ConnectedUser implements Principal {
    String name;
    String username;

    public ConnectedUser(String name) {this.name = name;}

    @Override
    public String getName() {
        return name;
    }
}
