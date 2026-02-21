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
}