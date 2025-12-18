<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  exit;
}

$nom = strip_tags($_POST['nom'] ?? 'Anonyme');
$montant = strip_tags($_POST['montant'] ?? '');
$message = strip_tags($_POST['message'] ?? '');

if ($montant === '') {
  exit;
}

$file = 'donateurs.json';
$data = json_decode(file_get_contents($file), true);

$data[] = [
  "nom" => $nom,
  "montant" => $montant,
  "message" => $message,
  "time" => time()
];

file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));

echo json_encode(["status"=>"ok"]);
