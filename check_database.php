<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Database Connection Test</h1>";

// Test database connection
try {
    $conn = new mysqli("localhost", "root", "", "ecommerce_db");
    
    if ($conn->connect_error) {
        echo "<p style='color: red;'>❌ Database connection failed: " . $conn->connect_error . "</p>";
        exit();
    }
    
    echo "<p style='color: green;'>✅ Database connection successful!</p>";
    
    // Check if users table exists
    $result = $conn->query("SHOW TABLES LIKE 'users'");
    if ($result->num_rows === 0) {
        echo "<p style='color: red;'>❌ Users table does not exist!</p>";
        exit();
    }
    
    echo "<p style='color: green;'>✅ Users table exists!</p>";
    
    // Show table structure
    echo "<h2>Users Table Structure:</h2>";
    $result = $conn->query("DESCRIBE users");
    if ($result) {
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $row['Field'] . "</td>";
            echo "<td>" . $row['Type'] . "</td>";
            echo "<td>" . $row['Null'] . "</td>";
            echo "<td>" . $row['Key'] . "</td>";
            echo "<td>" . $row['Default'] . "</td>";
            echo "<td>" . $row['Extra'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
    
    // Show all users (without passwords)
    echo "<h2>All Users in Database:</h2>";
    $result = $conn->query("SELECT id, firstName, lastName, email, role FROM users ORDER BY id");
    
    if ($result->num_rows > 0) {
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>ID</th><th>First Name</th><th>Last Name</th><th>Email</th><th>Role</th></tr>";
        
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $row['id'] . "</td>";
            echo "<td>" . $row['firstName'] . "</td>";
            echo "<td>" . $row['lastName'] . "</td>";
            echo "<td>" . $row['email'] . "</td>";
            echo "<td>" . ($row['role'] ?? 'null') . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p style='color: orange;'>⚠️ No users found in database.</p>";
    }
    
    // Test password hashing
    echo "<h2>Password Hashing Test:</h2>";
    $testPassword = "test123";
    $hashedPassword = password_hash($testPassword, PASSWORD_DEFAULT);
    $verifyResult = password_verify($testPassword, $hashedPassword);
    
    echo "<p>Test password: " . $testPassword . "</p>";
    echo "<p>Hashed password: " . $hashedPassword . "</p>";
    echo "<p>Verification result: " . ($verifyResult ? "✅ Success" : "❌ Failed") . "</p>";
    
    $conn->close();
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>