package com.wordgame.controller;

import com.wordgame.model.WordEntry;
import com.wordgame.service.WordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;



import org.springframework.web.bind.annotation.*;
import javax.annotation.PostConstruct;



@RestController
@RequestMapping("/api/words")
@CrossOrigin(origins = "*")



public class WordController {

    @PostConstruct
    public void init() {
        System.out.println("WordController loaded!");
    }

    @Autowired
    private WordService wordService;

    /**
     * Get all categories
     * @return Set of categories
     */
    @GetMapping("/categories")
    public ResponseEntity<Set<String>> getCategories() {
        Set<String> categories = wordService.getCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * Get a random word from a category
     * @param category The category to choose from
     * @return Random word or 404 if category is empty
     */
    @GetMapping("/random/{category}")
    public ResponseEntity<WordEntry> getRandomWord(@PathVariable String category) {
        WordEntry word = wordService.getRandomWord(category);
        if (word != null) {
            return ResponseEntity.ok(word);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
        }
    }

    /**
     * Get all words (for admin panel)
     * @return List of all words
     */
    @GetMapping
    public ResponseEntity<List<WordEntry>> getAllWords() {
        return ResponseEntity.ok(wordService.getAllWords());
    }

    /**
     * Add a new word
     * @param word The word to add
     * @return Success or conflict response
     */
    @PostMapping
    public ResponseEntity<String> addWord(@RequestBody WordEntry word) {
        if (wordService.addWord(word)) {
            return ResponseEntity.ok("Word added successfully");
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Word already exists or invalid format");
        }
    }

    /**
     * Update an existing word
     * @param oldWord The word to update
     * @param newWord The new word data
     * @return Success or error response
     */
    @PutMapping("/{word}")
    public ResponseEntity<String> updateWord(@PathVariable String word, @RequestBody WordEntry newWord) {
        if (wordService.updateWord(word, newWord)) {
            return ResponseEntity.ok("Word updated successfully");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to update word");
        }
    }

    /**
     * Delete a word
     * @param word The word to delete
     * @return Success or not found response
     */
    @DeleteMapping("/{word}")
    public ResponseEntity<String> deleteWord(@PathVariable String word) {
        if (wordService.deleteWord(word)) {
            return ResponseEntity.ok("Word deleted successfully");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Word not found");
        }
    }
}