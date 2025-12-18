<?php
$db = new PDO('mysql:host=localhost;dbname=donateurs','user','pass');
$stmt = $db->query("SELECT nom,montant FROM dons ORDER BY date DESC LIMIT 10");
$dons = $stmt->fetchAll(PDO::FETCH_ASSOC);
header('Content-Type: application/json');
echo json_encode($dons);
