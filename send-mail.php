<?php
if($_POST){

  // HONEYPOT
  if(!empty($_POST['website'])){
    exit;
  }

  $to = "gayainfotv@gmail.com";
  $subject = "Nouveau message - GAYA INFO TV";

  $message = "
Nom: ".$_POST['name']."
Email: ".$_POST['email']."

Message:
".$_POST['message'];

  $headers = "From: ".$_POST['email'];

  mail($to,$subject,$message,$headers);

  header("Location: contact.html?success=1");
}
?>
