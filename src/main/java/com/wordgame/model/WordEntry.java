package com.wordgame.model;

import java.io.Serializable;

public class WordEntry implements Serializable {
    private static final long serialVersionUID = 1L;

    private String category; // mandatory (a-z letters only)
    private String word;     // mandatory (a-z letters only)
    private String hint;     // mandatory (any text)

    public WordEntry() {}

    public WordEntry(String category, String word, String hint) {
        this.category = category.toLowerCase();
        this.word = word.toLowerCase();
        this.hint = hint;
    }

    // Getters and Setters
    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category != null ? category.toLowerCase() : null;
    }

    public String getWord() {
        return word;
    }

    public void setWord(String word) {
        this.word = word != null ? word.toLowerCase() : null;
    }

    public String getHint() {
        return hint;
    }

    public void setHint(String hint) {
        this.hint = hint;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        WordEntry wordEntry = (WordEntry) o;
        return word != null && word.equals(wordEntry.word);
    }

    @Override
    public int hashCode() {
        return word != null ? word.hashCode() : 0;
    }
}