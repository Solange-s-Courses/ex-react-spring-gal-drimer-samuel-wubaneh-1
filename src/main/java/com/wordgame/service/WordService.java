package com.wordgame.service;

import com.wordgame.model.WordEntry;
import org.springframework.stereotype.Service;
import java.io.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WordService {
    private static final String WORDS_FILE = "words.ser";
    private Set<WordEntry> words = new HashSet<>();

    public WordService() {
        loadWords();
    }

    /**
     * Load words from serialized file
     */
    private void loadWords() {
        File file = new File(WORDS_FILE);
        if (file.exists()) {
            try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(file))) {
                words = (Set<WordEntry>) ois.readObject();
            } catch (IOException | ClassNotFoundException e) {
                System.err.println("Error loading words: " + e.getMessage());
                words = new HashSet<>();
            }
        }
    }

    /**
     * Save words to serialized file
     */
    private void saveWords() {
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(WORDS_FILE))) {
            oos.writeObject(words);
        } catch (IOException e) {
            System.err.println("Error saving words: " + e.getMessage());
        }
    }

    /**
     * Get all categories
     * @return Set of unique categories
     */
    public Set<String> getCategories() {
        return words.stream()
                .map(WordEntry::getCategory)
                .collect(Collectors.toSet());
    }

    /**
     * Get a random word from a specific category
     * @param category The category to choose from
     * @return Random word from the category, or null if category is empty
     */
    public WordEntry getRandomWord(String category) {
        List<WordEntry> categoryWords = words.stream()
                .filter(w -> w.getCategory().equalsIgnoreCase(category))
                .collect(Collectors.toList());

        if (categoryWords.isEmpty()) {
            return null;
        }

        Random random = new Random();
        return categoryWords.get(random.nextInt(categoryWords.size()));
    }

    /**
     * Get all words
     * @return List of all words
     */
    public List<WordEntry> getAllWords() {
        return new ArrayList<>(words);
    }

    /**
     * Add a new word
     * @param word The word to add
     * @return true if added successfully, false if word already exists
     */
    public boolean addWord(WordEntry word) {
        if (validateWord(word)) {
            boolean added = words.add(word);
            if (added) {
                saveWords();
            }
            return added;
        }
        return false;
    }

    /**
     * Update an existing word
     * @param oldWord The word to update
     * @param newWord The new word data
     * @return true if updated successfully
     */
    public boolean updateWord(String oldWord, WordEntry newWord) {
        if (validateWord(newWord)) {
            words.removeIf(w -> w.getWord().equalsIgnoreCase(oldWord));
            boolean added = words.add(newWord);
            if (added) {
                saveWords();
            }
            return added;
        }
        return false;
    }

    /**
     * Delete a word
     * @param word The word to delete
     * @return true if deleted successfully
     */
    public boolean deleteWord(String word) {
        boolean removed = words.removeIf(w -> w.getWord().equalsIgnoreCase(word));
        if (removed) {
            saveWords();
        }
        return removed;
    }

    /**
     * Validate word entry
     * @param word The word to validate
     * @return true if valid
     */
    private boolean validateWord(WordEntry word) {
        if (word == null || word.getCategory() == null || word.getWord() == null || word.getHint() == null) {
            return false;
        }

        // Check if category and word contain only a-z letters
        String categoryPattern = "^[a-z]+$";
        String wordPattern = "^[a-z]+$";

        return word.getCategory().matches(categoryPattern) &&
                word.getWord().matches(wordPattern) &&
                !word.getHint().trim().isEmpty();
    }
}