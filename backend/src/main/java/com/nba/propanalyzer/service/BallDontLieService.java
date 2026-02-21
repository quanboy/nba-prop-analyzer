package com.nba.propanalyzer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nba.propanalyzer.model.GameLog;
import com.nba.propanalyzer.model.PropAnalysisResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BallDontLieService {

    @Value("${balldontlie.api.key}")
    private String apiKey;

    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public BallDontLieService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.balldontlie.io/v1")
                .build();
    }

    public PropAnalysisResponse analyze(String playerName, String stat, double line, int lookback) {
        try {
            // 1. Search for player
            String playerRaw = restClient.get()
                    .uri("/players?search={name}&per_page=5", playerName)
                    .header("Authorization", apiKey)
                    .retrieve()
                    .body(String.class);

            System.out.println("DEBUG player response: " + playerRaw);

            JsonNode playerSearch = objectMapper.readTree(playerRaw);
            JsonNode playerData = playerSearch.path("data").get(0);
            if (playerData == null)
                throw new RuntimeException("Player not found: " + playerName);

            long playerId = playerData.path("id").asLong();
            String fullName = playerData.path("first_name").asText() + " " + playerData.path("last_name").asText();
            String team = playerData.path("team").path("abbreviation").asText();
            long playerTeamId = playerData.path("team").path("id").asLong();

            // 2. Fetch recent game stats
            System.out.println("DEBUG calling stats with playerId: " + playerId + " apiKey: " + apiKey);

            String statsRaw = restClient.get()
                    .uri("/stats?player_ids[]={id}&per_page={lookback}&seasons[]=2024", playerId, lookback)
                    .header("Authorization", apiKey)
                    .retrieve()
                    .body(String.class);

            System.out.println("DEBUG stats response: " + statsRaw);

            JsonNode statsResult = objectMapper.readTree(statsRaw);

            List<JsonNode> gameStats = new ArrayList<>();
            statsResult.path("data").forEach(gameStats::add);

            // Sort oldest to newest
            gameStats.sort(Comparator.comparing(g -> g.path("game").path("date").asText()));

            // Take last N
            if (gameStats.size() > lookback) {
                gameStats = gameStats.subList(gameStats.size() - lookback, gameStats.size());
            }

            // 3. Build game logs
            List<GameLog> logs = gameStats.stream().map(g -> {
                String date = g.path("game").path("date").asText();
                if (date.length() > 10)
                    date = date.substring(0, 10);

                long homeTeamId = g.path("game").path("home_team_id").asLong();
                String oppPrefix = (homeTeamId == playerTeamId) ? "vs" : "@";
                String shortDate = date.substring(5);
                double value = extractStat(g, stat);

                GameLog log = new GameLog();
                log.setDate(date);
                log.setOpponent(oppPrefix);
                log.setValue(value);
                log.setLabel(shortDate + " " + oppPrefix);
                return log;
            }).collect(Collectors.toList());

            // 4. Compute aggregates
            double lastNAvg = logs.stream().mapToDouble(GameLog::getValue).average().orElse(0);
            int overCount = (int) logs.stream().filter(g -> g.getValue() > line).count();

            PropAnalysisResponse res = new PropAnalysisResponse();
            res.setPlayerName(fullName);
            res.setTeam(team);
            res.setGames(logs);
            res.setLastNAvg(Math.round(lastNAvg * 10.0) / 10.0);
            res.setSeasonAvg(Math.round(lastNAvg * 10.0) / 10.0);
            res.setOverCount(overCount);
            res.setUnderCount(logs.size() - overCount);
            return res;

        } catch (Exception e) {
            throw new RuntimeException("Failed to analyze props: " + e.getMessage(), e);
        }
    }

    private double extractStat(JsonNode g, String stat) {
        return switch (stat) {
            case "points" -> g.path("pts").asDouble();
            case "rebounds" -> g.path("reb").asDouble();
            case "assists" -> g.path("ast").asDouble();
            case "three_pointers" -> g.path("fg3m").asDouble();
            case "steals" -> g.path("stl").asDouble();
            case "blocks" -> g.path("blk").asDouble();
            case "pra" -> g.path("pts").asDouble() + g.path("reb").asDouble() + g.path("ast").asDouble();
            case "pr" -> g.path("pts").asDouble() + g.path("reb").asDouble();
            case "pa" -> g.path("pts").asDouble() + g.path("ast").asDouble();
            default -> 0;
        };
    }
}