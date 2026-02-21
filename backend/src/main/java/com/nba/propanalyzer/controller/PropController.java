package com.nba.propanalyzer.controller;

import com.nba.propanalyzer.model.PropAnalysisResponse;
import com.nba.propanalyzer.service.BallDontLieService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/props")
@CrossOrigin(origins = "http://localhost:5173")
public class PropController {

    private final BallDontLieService service;

    public PropController(BallDontLieService service) {
        this.service = service;
    }

    @GetMapping("/analyze")
    public PropAnalysisResponse analyze(
            @RequestParam String player,
            @RequestParam String stat,
            @RequestParam double line,
            @RequestParam int lookback) {
        return service.analyze(player, stat, line, lookback);
    }
}