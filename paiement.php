<?php
require 'vendor/autoload.php';
\Stripe\Stripe::setApiKey('sk_test_VOTRE_CLE_SECRET');

$data = json_decode(file_get_contents('php://input'), true);
$nom = $data['nom'] ?? 'Anonyme';
$montant = (int)$data['montant'];
$methode = $data['methode'] ?? '';

try{
  switch($methode){
    case 'carte':
      $session = \Stripe\Checkout\Session::create([
        'payment_method_types'=>['card'],
        'line_items'=>[[
          'price_data'=>[
            'currency'=>'xof',
            'product_data'=>['name'=>"Don GAYA INFO TV par $nom"],
            'unit_amount'=>$montant*100,
          ],
          'quantity'=>1
        ]],
        'mode'=>'payment',
        'success_url'=>'https://votre-site.com/success.html',
        'cancel_url'=>'https://votre-site.com/cancel.html',
      ]);
      echo json_encode(['url'=>$session->url]);
      break;
    case 'paypal':
      header("Location: paiement_paypal.php?montant=$montant&nom=$nom");
      break;
    case 'wave':
      header("Location: webhook_wave.php?montant=$montant&nom=$nom");
      break;
    case 'orange_money':
      header("Location: webhook_orange.php?montant=$montant&nom=$nom");
      break;
    default:
      echo json_encode(['error'=>'Méthode non reconnue']);
  }
}catch(Exception $e){
  echo json_encode(['error'=>$e->getMessage()]);
}
