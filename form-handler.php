<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST["email"];

    // Basic email validation
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response = array("success" => false, "message" => "Invalid email address.");
        echo json_encode($response);
        exit;
    }

    // Send email
    $to = "evensoncolin@gmail.com, evenson.jre@gmail.com";
    $subject = "Zoo Legends Waitlist Signup";
    $message = "New signup: " . $email;
    $headers = "From: Zoo Legends Waitlist <no-reply@yourdomain.com>"; // Replace with your domain

    if (mail($to, $subject, $message, $headers)) {
        $response = array("success" => true, "message" => "Thank you for signing up!");
    } else {
        $response = array("success" => false, "message" => "There was an error submitting your request.");
    }

    echo json_encode($response);

} else {
    // Handle direct access to form-handler.php
    header("HTTP/1.1 403 Forbidden");
    echo "Forbidden: You cannot access this page directly.";
}
?>