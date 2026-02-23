package com.nba.propanalyzer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nba.propanalyzer.model.GameLog;
import com.nba.propanalyzer.model.PropAnalysisResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Service
public class BallDontLieService {

    private final ObjectMapper objectMapper;

    public BallDontLieService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public PropAnalysisResponse analyze(String playerName, String stat, double line, int lookback) {
        try {
            // 1. Call Python service for game log
            RestClient restClient = RestClient.create();
            String statsRaw = restClient.get()
                    .uri("http://localhost:5000/gamelog?player={name}&lookback={lookback}", playerName, lookback)
                    .retrieve()
                    .body(String.class);

            System.out.println("DEBUG stats response: " + statsRaw);

            JsonNode root = objectMapper.readTree(statsRaw);
            JsonNode gamesNode = root.path("games");

            // 2. Build game logs
            List<GameLog> logs = new ArrayList<>();
            for (JsonNode g : gamesNode) {
                String date = g.path("GAME_DATE").asText();
                String matchup = g.path("MATCHUP").asText();
                double value = extractStat(g, stat);

                GameLog log = new GameLog();
                log.setDate(date);
                log.setOpponent(matchup);
                log.setValue(value);
                log.setLabel(date + " " + matchup);
                logs.add(log); // add to the list
            }
            // THEN compute aggregates after the loop finishes

            // 3. Compute aggregates
            double lastNAvg = logs.stream().mapToDouble(GameLog::getValue).average().orElse(0);
            int overCount = (int) logs.stream().filter(g -> g.getValue() > line).count();

            // 4. Get player name from first game
            String fullName = playerName;

            PropAnalysisResponse res = new PropAnalysisResponse();
            res.setPlayerName(fullName);
            res.setTeam("");
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
            case "points" -> g.path("PTS").asDouble();
            case "rebounds" -> g.path("REB").asDouble();
            case "assists" -> g.path("AST").asDouble();
            case "three_pointers" -> g.path("FG3M").asDouble();
            case "steals" -> g.path("STL").asDouble();
            case "blocks" -> g.path("BLK").asDouble();
            case "pra" -> g.path("PTS").asDouble() + g.path("REB").asDouble() + g.path("AST").asDouble();
            case "pr" -> g.path("pts").asDouble() + g.path("REB").asDouble();
            case "pa" -> g.path("PTS").asDouble() + g.path("AST").asDouble();
            default -> 0;
        };
    }
}