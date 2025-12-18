<?php
$conn = new mysqli("localhost","DB_USER","DB_PASS","DB_NAME");
$res = $conn->query(
  "SELECT nom, montant, date_don
   FROM donateurs
   ORDER BY date_don DESC
   LIMIT 50"
);
?>
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Mur des donateurs</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{font-family:system-ui;background:#f5f5f5}
.container{max-width:700px;margin:40px auto}
.card{
  background:#fff;
  padding:16px;
  border-radius:14px;
  margin-bottom:12px;
}
.name{font-weight:800}
.amount{color:#e63939}
.date{font-size:12px;color:#777}
</style>
</head>

<body>
<div class="container">
<h1>❤️ Mur des donateurs</h1>

<?php while($d=$res->fetch_assoc()): ?>
<div class="card">
  <div class="name"><?= htmlspecialchars($d["nom"]) ?></div>
  <div class="amount"><?= $d["montant"] ?> FCFA</div>
  <div class="date"><?= date("d/m/Y",strtotime($d["date_don"])) ?></div>
</div>
<?php endwhile; ?>

</div>
</body>
</html>
