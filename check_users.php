<?php
// Database connection
$conn = new mysqli("localhost", "root", "", "ecommerce_db");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "<h2>Users in Database:</h2>";

// Get all users
$result = $conn->query("SELECT id, firstName, lastName, email, role FROM users ORDER BY id");

if ($result->num_rows > 0) {
    echo "<table border='1'>";
    echo "<tr><th>ID</th><th>First Name</th><th>Last Name</th><th>Email</th><th>Role</th></tr>";
    
    while($row = $result->fetch_assoc()) {
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
    echo "No users found in database.";
}

$conn->close();
?>