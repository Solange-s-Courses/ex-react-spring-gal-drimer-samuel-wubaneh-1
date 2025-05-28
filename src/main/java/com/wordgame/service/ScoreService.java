package com.wordgame.service;

import com.wordgame.model.ScoreEntry;
import org.springframework.stereotype.Service;
import java.io.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ScoreService {
    private static final String SCORES_FILE = "scores.ser";
    private List<ScoreEntry> scores = new ArrayList<>();

    public ScoreService() {
        loadScores();
    }

    /**
     * Load scores from serialized file
     */
    private void loadScores() {
        File file = new File(SCORES_FILE);
        if (file.exists()) {
            try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(file))) {
                scores = (List<ScoreEntry>) ois.readObject();
            } catch (IOException | ClassNotFoundException e) {
                System.err.println("Error loading scores: " + e.getMessage());
                scores = new ArrayList<>();
            }
        }
    }

    /**
     * Save scores to serialized file
     */
    private void saveScores() {
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(SCORES_FILE))) {
            oos.writeObject(scores);
        } catch (IOException e) {
            System.err.println("Error saving scores: " + e.getMessage());
        }
    }

    /**
     * Add a new score
     * @param scoreEntry The score to add
     */
    public void addScore(ScoreEntry scoreEntry) {
        scores.add(scoreEntry);
        saveScores();
    }

    /**
     * Get top scores (leaderboard)
     * @param limit Maximum number of scores to return
     * @return List of top scores sorted by score descending
     */
    public List<ScoreEntry> getTopScores(int limit) {
        return scores.stream()
                .sorted((a, b) -> Integer.compare(b.getScore(), a.getScore()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Calculate score based on game parameters
     * @param timeInSeconds Time taken to complete the game
     * @param attempts Number of attempts made
     * @param usedHint Whether hint was used
     * @return Calculated score
     */
    public int calculateScore(int timeInSeconds, int attempts, boolean usedHint) {
        int baseScore = 1000;

        // Deduct points for time (1 point per second)
        baseScore -= timeInSeconds;

        // Deduct points for attempts (50 points per wrong attempt)
        baseScore -= (attempts * 50);

        // Deduct points for using hint
        if (usedHint) {
            baseScore -= 200;
        }

        // Ensure score doesn't go below 0
        return Math.max(0, baseScore);
    }

    /**
     * Check if nickname is unique in leaderboard
     * @param nickname The nickname to check
     * @return true if nickname is unique
     */
    public boolean isNicknameUnique(String nickname) {
        return scores.stream()
                .noneMatch(score -> score.getNickname().equalsIgnoreCase(nickname));
    }
}