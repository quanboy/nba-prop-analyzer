package com.nba.propanalyzer.client;

import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;

@HttpExchange("https://api.balldontlie.io/v1")
public interface BallDontLieClient {

        @GetExchange("/players")
        String searchPlayers(
                        @RequestParam("search") String name,
                        @RequestParam("per_page") int perPage);

        @GetExchange("/stats")
        String getStats(
                        @RequestParam("player_ids[]") long playerId,
                        @RequestParam("per_page") int perPage,
                        @RequestParam("seasons[]") int season);
}