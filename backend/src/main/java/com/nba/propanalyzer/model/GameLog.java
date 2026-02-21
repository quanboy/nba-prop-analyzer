package com.nba.propanalyzer.model;

import lombok.Data;

@Data
public class GameLog {
    private String date;
    private String opponent;
    private double value;
    private String label;
}