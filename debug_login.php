<?php
session_start();

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

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

// Function to log debug information
function debugLog($message) {
    error_log("[DEBUG] " . $message);
}

try {
    debugLog("=== LOGIN DEBUG START ===");
    
    // Check request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        debugLog("Wrong method: " . $_SERVER['REQUEST_METHOD']);
        sendResponse(405, "error", "POST method required");
    }

    debugLog("Request method is POST - OK");

    // Get and parse input
    $rawInput = file_get_contents('php://input');
    debugLog("Raw input: " . $rawInput);
    
    $input = json_decode($rawInput, true);
    
    if (!$input) {
        debugLog("JSON decode failed");
        sendResponse(400, "error", "Invalid JSON input");
    }
    
    debugLog("JSON parsed successfully");
    
    if (!isset($input['email']) || !isset($input['password'])) {
        debugLog("Missing email or password in input");
        sendResponse(400, "error", "Email and password are required");
    }

    $email = trim($input['email']);
    $password = $input['password'];

    debugLog("Email: " . $email);
    debugLog("Password length: " . strlen($password));

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        debugLog("Invalid email format: " . $email);
        sendResponse(400, "error", "Invalid email format");
    }

    debugLog("Email format is valid");

    // Database connection
    debugLog("Attempting database connection...");
    $conn = new mysqli("localhost", "root", "", "ecommerce_db");
    
    if ($conn->connect_error) {
        debugLog("Database connection failed: " . $conn->connect_error);
        sendResponse(500, "error", "Database connection failed: " . $conn->connect_error);
    }

    debugLog("Database connection successful");

    // Check if users table exists
    $tableCheck = $conn->query("SHOW TABLES LIKE 'users'");
    if ($tableCheck->num_rows === 0) {
        debugLog("Users table does not exist");
        sendResponse(500, "error", "Users table does not exist");
    }

    debugLog("Users table exists");

    // Check if user exists
    $checkStmt = $conn->prepare("SELECT COUNT(*) as count FROM users WHERE email = ?");
    if (!$checkStmt) {
        debugLog("Prepare statement failed: " . $conn->error);
        sendResponse(500, "error", "Database query failed");
    }

    $checkStmt->bind_param("s", $email);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    $userCount = $checkResult->fetch_assoc()['count'];
    $checkStmt->close();
    
    debugLog("Users found with email: " . $userCount);

    if ($userCount === 0) {
        debugLog("No user found with email: " . $email);
        sendResponse(401, "error", "Invalid email or password");
    }

    // Get user from database
    $stmt = $conn->prepare("SELECT id, firstName, lastName, email, password, role FROM users WHERE email = ?");
    if (!$stmt) {
        debugLog("Prepare statement failed: " . $conn->error);
        $conn->close();
        sendResponse(500, "error", "Database query failed");
    }

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        debugLog("No user found with email: " . $email);
        $stmt->close();
        $conn->close();
        sendResponse(401, "error", "Invalid email or password");
    }

    $user = $result->fetch_assoc();
    
    debugLog("User found - ID: " . $user['id'] . ", Role: " . ($user['role'] ?? 'null'));
    debugLog("Stored password hash: " . substr($user['password'], 0, 20) . "...");
    
    // Verify password
    $passwordVerified = password_verify($password, $user['password']);
    debugLog("Password verification result: " . ($passwordVerified ? 'true' : 'false'));
    
    if (!$passwordVerified) {
        debugLog("Password verification failed for email: " . $email);
        $stmt->close();
        $conn->close();
        sendResponse(401, "error", "Invalid email or password");
    }

    debugLog("Password verified successfully for user: " . $user['id']);

    // Set session variables
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_firstName'] = $user['firstName'];
    $_SESSION['user_lastName'] = $user['lastName'];
    $_SESSION['user_role'] = $user['role'] ?? 'user';

    debugLog("Session set - User ID: " . $_SESSION['user_id'] . ", Role: " . $_SESSION['user_role']);

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

    debugLog("Login successful - sending response");
    debugLog("=== LOGIN DEBUG END ===");

    sendResponse(200, "success", "Login successful", $userData);

} catch (Exception $e) {
    debugLog("Login exception: " . $e->getMessage());
    debugLog("=== LOGIN DEBUG END WITH ERROR ===");
    sendResponse(500, "error", "An error occurred during login: " . $e->getMessage());
}
?>