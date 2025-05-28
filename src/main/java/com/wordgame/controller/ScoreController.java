package com.wordgame.controller;

import com.wordgame.model.ScoreEntry;
import com.wordgame.service.ScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scores")
@CrossOrigin(origins = "*")
public class ScoreController {

    @Autowired
    private ScoreService scoreService;

    /**
     * Get leaderboard (top 10 scores)
     * @return List of top scores
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<List<ScoreEntry>> getLeaderboard() {
        return ResponseEntity.ok(scoreService.getTopScores(10));
    }

    /**
     * Add a new score
     * @param scoreEntry The score to add
     * @return Success response
     */
    @PostMapping
    public ResponseEntity<String> addScore(@RequestBody ScoreEntry scoreEntry) {
        // Calculate the score
        int calculatedScore = scoreService.calculateScore(
                scoreEntry.getTimeInSeconds(),
                scoreEntry.getAttempts(),
                scoreEntry.isUsedHint()
        );
        scoreEntry.setScore(calculatedScore);

        scoreService.addScore(scoreEntry);
        return ResponseEntity.ok("Score added successfully");
    }

    /**
     * Check if nickname is unique
     * @param nickname The nickname to check
     * @return true if unique, false otherwise
     */
    @GetMapping("/check-nickname/{nickname}")
    public ResponseEntity<Map<String, Boolean>> checkNickname(@PathVariable String nickname) {
        boolean isUnique = scoreService.isNicknameUnique(nickname);
        return ResponseEntity.ok(Map.of("unique", isUnique));
    }

    /**
     * Calculate score without saving
     * @param params Game parameters
     * @return Calculated score
     */
    @PostMapping("/calculate")
    public ResponseEntity<Map<String, Integer>> calculateScore(@RequestBody Map<String, Object> params) {
        int timeInSeconds = (int) params.get("timeInSeconds");
        int attempts = (int) params.get("attempts");
        boolean usedHint = (boolean) params.get("usedHint");

        int score = scoreService.calculateScore(timeInSeconds, attempts, usedHint);
        return ResponseEntity.ok(Map.of("score", score));
    }
}