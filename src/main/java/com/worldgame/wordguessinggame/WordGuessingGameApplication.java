package com.worldgame.wordguessinggame;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import javax.annotation.PostConstruct;

@SpringBootApplication
@ComponentScan(basePackages = {"com.worldgame", "com.wordgame"})
@EnableAutoConfiguration
public class WordGuessingGameApplication {

    public static void main(String[] args) {
        SpringApplication.run(WordGuessingGameApplication.class, args);
    }

    @PostConstruct
    public void checkBeans() {
        System.out.println("Application started, scanning packages: com.worldgame, com.wordgame");
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}