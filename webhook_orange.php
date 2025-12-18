<?php
// Récupère les données JSON envoyées par Orange Money
$data = json_decode(file_get_contents('php://input'), true);

// Vérifie signature pour sécurité
$token = $_SERVER['HTTP_OM_TOKEN'] ?? '';
if($token !== 'VOTRE_SECRET_ORANGE') exit;

$nom = $data['payerName'] ?? 'Anonyme';
$montant = $data['amount'] ?? 0;

// Sauvegarder le donateur dans la base de données
$db = new PDO('mysql:host=localhost;dbname=donateurs','user','pass');
$stmt = $db->prepare("INSERT INTO dons (nom,montant, methode) VALUES (:nom,:montant,'orange_money')");
$stmt->execute(['nom'=>$nom,'montant'=>$montant]);

http_response_code(200);
