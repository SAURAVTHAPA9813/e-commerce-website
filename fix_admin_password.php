<?php
// Database connection
$conn = new mysqli("localhost", "root", "", "ecommerce_db");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Replace 'admin@example.com' with your actual admin email
$adminEmail = "admin@example.com"; // CHANGE THIS TO YOUR ADMIN EMAIL
$newPassword = "admin123"; // CHANGE THIS TO YOUR DESIRED PASSWORD

// Hash the password
$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

// Update the admin user's password
$stmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
$stmt->bind_param("ss", $hashedPassword, $adminEmail);

if ($stmt->execute()) {
    echo "Admin password updated successfully!<br>";
    echo "Email: " . $adminEmail . "<br>";
    echo "New password: " . $newPassword . "<br>";
    echo "Hashed password: " . $hashedPassword;
} else {
    echo "Error updating password: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>