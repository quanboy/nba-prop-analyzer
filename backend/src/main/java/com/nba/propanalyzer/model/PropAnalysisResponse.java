package com.nba.propanalyzer.model;

import lombok.Data;
import java.util.List;

@Data
public class PropAnalysisResponse {
    private String playerName;
    private String team;
    private List<GameLog> games;
    private double seasonAvg;
    private double lastNAvg;
    private int overCount;
    private int underCount;
    private double inputLine;
    private int lookback;
    private String position;
    private String jersey;
    private String teamName;
    private String teamAbbreviation;
    private String photoUrl;

}