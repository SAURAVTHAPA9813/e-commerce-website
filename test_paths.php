<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Server and Path Test</h1>";

// Check PHP version
echo "<h2>PHP Information:</h2>";
echo "<p>PHP Version: " . phpversion() . "</p>";
echo "<p>Server Software: " . $_SERVER['SERVER_SOFTWARE'] . "</p>";

// Check if we can access the login file
echo "<h2>File Access Test:</h2>";
$loginFile = __DIR__ . '/login.php';
if (file_exists($loginFile)) {
    echo "<p style='color: green;'>✅ login.php exists at: " . $loginFile . "</p>";
} else {
    echo "<p style='color: red;'>❌ login.php not found at: " . $loginFile . "</p>";
}

// Check current directory
echo "<p>Current directory: " . __DIR__ . "</p>";

// Test if we can read the login file
if (file_exists($loginFile)) {
    $fileSize = filesize($loginFile);
    echo "<p>login.php file size: " . $fileSize . " bytes</p>";
    
    if (is_readable($loginFile)) {
        echo "<p style='color: green;'>✅ login.php is readable</p>";
    } else {
        echo "<p style='color: red;'>❌ login.php is not readable</p>";
    }
}

// Check if sessions are working
echo "<h2>Session Test:</h2>";
session_start();
$_SESSION['test'] = 'test_value';
if (isset($_SESSION['test']) && $_SESSION['test'] === 'test_value') {
    echo "<p style='color: green;'>✅ Sessions are working</p>";
} else {
    echo "<p style='color: red;'>❌ Sessions are not working</p>";
}

// Check if JSON functions are available
echo "<h2>JSON Functions Test:</h2>";
if (function_exists('json_encode') && function_exists('json_decode')) {
    echo "<p style='color: green;'>✅ JSON functions are available</p>";
    
    $testData = ['test' => 'value'];
    $jsonString = json_encode($testData);
    $decodedData = json_decode($jsonString, true);
    
    if ($decodedData === $testData) {
        echo "<p style='color: green;'>✅ JSON encode/decode working correctly</p>";
    } else {
        echo "<p style='color: red;'>❌ JSON encode/decode not working correctly</p>";
    }
} else {
    echo "<p style='color: red;'>❌ JSON functions are not available</p>";
}

// Check if password functions are available
echo "<h2>Password Functions Test:</h2>";
if (function_exists('password_hash') && function_exists('password_verify')) {
    echo "<p style='color: green;'>✅ Password functions are available</p>";
    
    $testPassword = 'test123';
    $hash = password_hash($testPassword, PASSWORD_DEFAULT);
    $verify = password_verify($testPassword, $hash);
    
    if ($verify) {
        echo "<p style='color: green;'>✅ Password hashing working correctly</p>";
    } else {
        echo "<p style='color: red;'>❌ Password hashing not working correctly</p>";
    }
} else {
    echo "<p style='color: red;'>❌ Password functions are not available</p>";
}

echo "<h2>Request Method Test:</h2>";
echo "<p>Current request method: " . $_SERVER['REQUEST_METHOD'] . "</p>";
echo "<p>Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'Not set') . "</p>";

echo "<h2>Headers Test:</h2>";
$headers = getallheaders();
if ($headers) {
    echo "<ul>";
    foreach ($headers as $name => $value) {
        echo "<li><strong>$name:</strong> $value</li>";
    }
    echo "</ul>";
} else {
    echo "<p>No headers found</p>";
}
?>