<?php
// Exemple simple pour redirection PayPal Sandbox
// Remplace les valeurs par ton client_id et sandbox URL PayPal

$montant = $_GET['montant'] ?? 1000;
$nom = $_GET['nom'] ?? 'Anonyme';

$paypal_sandbox_url = "https://www.sandbox.paypal.com/cgi-bin/webscr";
$business_email = "votre-email-facilitateur@paypal.com";

$query = http_build_query([
    'cmd' => '_xclick',
    'business' => $business_email,
    'item_name' => "Don GAYA INFO TV par $nom",
    'amount' => $montant,
    'currency_code' => 'XOF',
    'return' => 'https://votre-site.com/success.html',
    'cancel_return' => 'https://votre-site.com/cancel.html',
]);

header("Location: $paypal_sandbox_url?$query");
exit;
