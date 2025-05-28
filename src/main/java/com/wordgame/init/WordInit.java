package com.wordgame.init;

import com.wordgame.model.WordEntry;
import java.io.*;
import java.util.HashSet;
import java.util.Set;

/**
 * Utility class to initialize the words.ser file with sample data
 */
public class WordInit {

    public static void main(String[] args) {
        Set<WordEntry> words = new HashSet<>();

        // Animals category
        words.add(new WordEntry("animals", "elephant", "Large gray mammal with a trunk"));
        words.add(new WordEntry("animals", "giraffe", "Tallest land animal with a long neck"));
        words.add(new WordEntry("animals", "penguin", "Black and white bird that cannot fly"));
        words.add(new WordEntry("animals", "dolphin", "Intelligent marine mammal"));

        // Countries category
        words.add(new WordEntry("countries", "france", "European country famous for the Eiffel Tower"));
        words.add(new WordEntry("countries", "japan", "Island nation known for sushi and technology"));
        words.add(new WordEntry("countries", "brazil", "South American country famous for football"));

        // Food category
        words.add(new WordEntry("food", "pizza", "Italian dish with cheese and toppings"));
        words.add(new WordEntry("food", "sushi", "Japanese dish with rice and fish"));
        words.add(new WordEntry("food", "hummus", "Middle Eastern chickpea spread"));

        // Technology category
        words.add(new WordEntry("technology", "computer", "Electronic device for processing data"));
        words.add(new WordEntry("technology", "internet", "Global network connecting computers"));

        // Save to file
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("words.ser"))) {
            oos.writeObject(words);
            System.out.println("Successfully created words.ser with " + words.size() + " words");
        } catch (IOException e) {
            System.err.println("Error creating words.ser: " + e.getMessage());
        }
    }
}