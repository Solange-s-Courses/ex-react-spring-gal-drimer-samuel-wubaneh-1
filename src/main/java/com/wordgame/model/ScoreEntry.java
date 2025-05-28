package com.wordgame.model;

import java.io.Serializable;
import java.time.LocalDateTime;

public class ScoreEntry implements Serializable {
    private static final long serialVersionUID = 1L;

    private String nickname;
    private int score;
    private int timeInSeconds;
    private int attempts;
    private boolean usedHint;
    private LocalDateTime timestamp;

    public ScoreEntry() {
        this.timestamp = LocalDateTime.now();
    }

    public ScoreEntry(String nickname, int score, int timeInSeconds, int attempts, boolean usedHint) {
        this.nickname = nickname;
        this.score = score;
        this.timeInSeconds = timeInSeconds;
        this.attempts = attempts;
        this.usedHint = usedHint;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getTimeInSeconds() {
        return timeInSeconds;
    }

    public void setTimeInSeconds(int timeInSeconds) {
        this.timeInSeconds = timeInSeconds;
    }

    public int getAttempts() {
        return attempts;
    }

    public void setAttempts(int attempts) {
        this.attempts = attempts;
    }

    public boolean isUsedHint() {
        return usedHint;
    }

    public void setUsedHint(boolean usedHint) {
        this.usedHint = usedHint;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}