<?php
// Exemple Orange Money (test)
$montant = $_GET['montant'] ?? 1000;
$nom = $_GET['nom'] ?? 'Anonyme';

// Simuler paiement Orange Money
echo "<h2>Paiement Orange Money simulé</h2>";
echo "<p>Montant: $montant FCFA</p>";
echo "<p>Donateur: $nom</p>";
echo "<p><a href='https://votre-site.com/success.html'>Simuler paiement réussi</a></p>";
echo "<p><a href='https://votre-site.com/cancel.html'>Simuler paiement annulé</a></p>";
