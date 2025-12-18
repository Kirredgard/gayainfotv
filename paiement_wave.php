<?php
// Exemple Wave Money (test)
$montant = $_GET['montant'] ?? 1000;
$nom = $_GET['nom'] ?? 'Anonyme';

// URL de test / documentation Wave API
$wave_test_url = "https://sandbox.wave.com/v1/payments";

echo "<h2>Paiement Wave simulé</h2>";
echo "<p>Montant: $montant FCFA</p>";
echo "<p>Donateur: $nom</p>";
echo "<p><a href='https://votre-site.com/success.html'>Simuler paiement réussi</a></p>";
echo "<p><a href='https://votre-site.com/cancel.html'>Simuler paiement annulé</a></p>";
