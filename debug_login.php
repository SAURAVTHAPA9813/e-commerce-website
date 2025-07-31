<?php
session_start();

// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Function to send JSON response
function sendResponse($statusCode, $status, $message, $data = null) {
    http_response_code($statusCode);
    $response = ["status" => $status, "message" => $message];
    if ($data !== null) {
        $response["data"] = $data;
    }
    echo json_encode($response);
    exit();
}

try {
    // Check request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse(405, "error", "POST method required");
    }

    // Get and parse input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['email']) || !isset($input['password'])) {
        sendResponse(400, "error", "Email and password are required");
    }

    $email = trim($input['email']);
    $password = $input['password'];

    // Debug: Log the received data
    error_log("Login attempt - Email: " . $email);

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendResponse(400, "error", "Invalid email format");
    }

    // Database connection
    $conn = new mysqli("localhost", "root", "", "ecommerce_db");
    if ($conn->connect_error) {
        error_log("Database connection failed: " . $conn->connect_error);
        sendResponse(500, "error", "Database connection failed");
    }

    // Debug: Check if user exists
    $checkStmt = $conn->prepare("SELECT COUNT(*) as count FROM users WHERE email = ?");
    $checkStmt->bind_param("s", $email);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    $userCount = $checkResult->fetch_assoc()['count'];
    $checkStmt->close();
    
    error_log("Users found with email: " . $userCount);

    // Get user from database
    $stmt = $conn->prepare("SELECT id, firstName, lastName, email, password, role FROM users WHERE email = ?");
    if (!$stmt) {
        error_log("Prepare statement failed: " . $conn->error);
        $conn->close();
        sendResponse(500, "error", "Database query failed");
    }

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        error_log("No user found with email: " . $email);
        $stmt->close();
        $conn->close();
        sendResponse(401, "error", "Invalid email or password");
    }

    $user = $result->fetch_assoc();
    
    // Debug: Log user data (without password)
    error_log("User found - ID: " . $user['id'] . ", Role: " . ($user['role'] ?? 'null'));
    
    // Verify password
    if (!password_verify($password, $user['password'])) {
        error_log("Password verification failed for email: " . $email);
        $stmt->close();
        $conn->close();
        sendResponse(401, "error", "Invalid email or password");
    }

    error_log("Password verified successfully for user: " . $user['id']);

    // Set session variables
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_firstName'] = $user['firstName'];
    $_SESSION['user_lastName'] = $user['lastName'];
    $_SESSION['user_role'] = $user['role'] ?? 'user'; // Default to 'user' if role is null

    // Debug: Log session data
    error_log("Session set - User ID: " . $_SESSION['user_id'] . ", Role: " . $_SESSION['user_role']);

    // Prepare response data
    $userData = [
        "id" => $user['id'],
        "firstName" => $user['firstName'],
        "lastName" => $user['lastName'],
        "email" => $user['email'],
        "role" => $user['role'] ?? 'user'
    ];

    $stmt->close();
    $conn->close();

    sendResponse(200, "success", "Login successful", $userData);

} catch (Exception $e) {
    error_log("Login exception: " . $e->getMessage());
    sendResponse(500, "error", "An error occurred during login");
}
?>