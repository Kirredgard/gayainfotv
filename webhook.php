<<?php
// Récupère les données JSON envoyées par Wave
$data = json_decode(file_get_contents('php://input'), true);

// Vérifie la signature ou token de Wave pour sécurité
$signature = $_SERVER['HTTP_WAVE_SIGNATURE'] ?? '';
if($signature !== 'VOTRE_SECRET_WAVE') exit;

// Exemple de traitement
$nom = $data['payerName'] ?? 'Anonyme';
$montant = $data['amount'] ?? 0;

// Sauvegarder le donateur dans la base de données
$db = new PDO('mysql:host=localhost;dbname=donateurs','user','pass');
$stmt = $db->prepare("INSERT INTO dons (nom,montant, methode) VALUES (:nom,:montant,'wave')");
$stmt->execute(['nom'=>$nom,'montant'=>$montant]);

http_response_code(200);
