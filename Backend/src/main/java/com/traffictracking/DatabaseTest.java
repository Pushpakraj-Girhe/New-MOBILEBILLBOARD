package com.traffictracking;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DatabaseTest {
    
    public static void testConnection() {
        System.out.println("Testing MySQL Connection...");
        
        String url = "jdbc:mysql://localhost:3306/mydata?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true";
        String user = "root";
        String password = "Mysql@4531";
        
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            System.out.println("Driver loaded successfully");
            
            Connection connection = DriverManager.getConnection(url, user, password);
            System.out.println("Connection established successfully to database: " + connection.getCatalog());
            
            // Try to create a simple test table
            try (Statement stmt = connection.createStatement()) {
                String createTableSQL = "CREATE TABLE IF NOT EXISTS test_table (id INT, name VARCHAR(255))";
                stmt.execute(createTableSQL);
                System.out.println("Test table created successfully");
                
                // Clean up
                stmt.execute("DROP TABLE IF EXISTS test_table");
                System.out.println("Test table dropped");
            } catch (SQLException e) {
                System.err.println("Error creating test table: " + e.getMessage());
                e.printStackTrace();
            }
            
            connection.close();
            System.out.println("Connection closed");
        } catch (ClassNotFoundException e) {
            System.err.println("Driver not found: " + e.getMessage());
        } catch (SQLException e) {
            System.err.println("SQL Exception: " + e.getMessage());
            e.printStackTrace();
        }
    }
} 