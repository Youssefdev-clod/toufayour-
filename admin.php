<?php
// ================== CONFIG ==================
session_start();

// غيّر كلمة السر هنا
const ADMIN_PASSWORD = 'youssef@123';

// مسارات ملفات JSON
$contentFile = __DIR__ . '/data/content.json';
$galleryFile = __DIR__ . '/data/gallery.json';

// ----------------- LOGIN --------------------
$loginError = '';
if (isset($_POST['action']) && $_POST['action'] === 'login') {
    $pass = $_POST['password'] ?? '';
    if ($pass === ADMIN_PASSWORD) {
        $_SESSION['is_admin'] = true;
        header('Location: admin.php');
        exit;
    } else {
        $loginError = 'Mot de passe incorrect.';
    }
}

if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: admin.php');
    exit;
}

// ----------------- LOAD JSON ----------------
$content = [
    'product' => ['price' => 120],
    'contact' => [
        'phone' => '+212 6X XXX XXXX',
        'phone_raw' => '2126XXXXXXXX',
        'email' => 'contact@toufayour.ma',
        'fr' => ['intro' => '', 'address' => 'Marrakech, Maroc'],
        'ar' => ['intro' => '', 'address' => 'مراكش، المغرب']
    ],
    'about' => [
        'fr' => 'Toufayour Chocolate est une maison artisanale marocaine...',
        'ar' => 'توفايور شوكولات علامة مغربية حرفية...'
    ]
];

if (file_exists($contentFile)) {
    $json = json_decode(file_get_contents($contentFile), true);
    if (is_array($json)) {
        $content = array_replace_recursive($content, $json);
    }
}

$gallery = [
    'hero' => 'images/1.jpg',
    'images' => [
        'images/1.jpg',
        'images/2.jpg',
        'images/3.jpg',
        'images/4.jpg',
        'images/5.jpg'
    ]
];

if (file_exists($galleryFile)) {
    $g = json_decode(file_get_contents($galleryFile), true);
    if (is_array($g)) {
        $gallery = array_replace_recursive($gallery, $g);
    }
}

// ----------------- SAVE HANDLERS ------------
$successMsg = '';
$errorMsg   = '';

if (isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true) {

    // enregistrer contenu
    if (isset($_POST['action']) && $_POST['action'] === 'save_content') {
        $price = floatval($_POST['price'] ?? 120);

        $phone     = trim($_POST['phone'] ?? '');
        $phone_raw = preg_replace('/\D+/', '', $_POST['phone_raw'] ?? '');
        if ($phone_raw === '') {
            $phone_raw = '2126XXXXXXXX';
        }

        $email = trim($_POST['email'] ?? 'contact@toufayour.ma');

        $content['product']['price'] = $price;

        $content['contact']['phone'] = $phone;
        $content['contact']['phone_raw'] = $phone_raw;
        $content['contact']['email'] = $email;

        $content['contact']['fr']['intro']    = $_POST['intro_fr'] ?? '';
        $content['contact']['fr']['address']  = $_POST['address_fr'] ?? '';
        $content['contact']['ar']['intro']    = $_POST['intro_ar'] ?? '';
        $content['contact']['ar']['address']  = $_POST['address_ar'] ?? '';

        $content['about']['fr'] = $_POST['about_fr'] ?? '';
        $content['about']['ar'] = $_POST['about_ar'] ?? '';

        if (file_put_contents($contentFile, json_encode($content, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
            $successMsg = 'Contenu enregistré avec succès ✅';
        } else {
            $errorMsg = 'Erreur lors de l\'enregistrement de content.json';
        }
    }

    // enregistrer galerie
    if (isset($_POST['action']) && $_POST['action'] === 'save_gallery') {
        $hero  = trim($_POST['hero'] ?? 'images/1.jpg');
        $imgs  = trim($_POST['images'] ?? '');
        $list  = array_filter(array_map('trim', explode("\n", $imgs)));

        if (count($list) === 0) {
            $list = [$hero];
        }

        $gallery['hero']   = $hero;
        $gallery['images'] = array_values($list);

        if (file_put_contents($galleryFile, json_encode($gallery, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
            $successMsg = 'Galerie enregistrée avec succès ✅';
        } else {
            $errorMsg = 'Erreur lors de l\'enregistrement de gallery.json';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Admin — Toufayour Chocolate</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    :root{
      --bg:#171311;
      --ink:#EFE7E1;
      --muted:#C6BBB3;
      --primary:#AF7D4A;
      --primary-2:#7B3F00;
      --gold:#D4AF37;
      --card:#201715;
      --border:rgba(255,255,255,.08);
      --error:#ff6b6b;
      --ok:#25D366;
    }
    *{box-sizing:border-box}
    body{
      margin:0;
      font:500 15px/1.6 'Poppins','Segoe UI',sans-serif;
      background:#120E0C;
      color:var(--ink);
    }
    a{color:var(--gold);text-decoration:none}
    .wrap{
      max-width:980px;
      margin:0 auto;
      padding:16px;
    }
    .card{
      background:var(--card);
      border:1px solid var(--border);
      border-radius:14px;
      padding:16px;
      margin-bottom:16px;
      box-shadow:0 18px 40px rgba(0,0,0,.45);
    }
    h1,h2,h3{margin:0 0 10px;font-weight:800}
    h1{font-size:22px}
    h2{font-size:18px;border-bottom:1px solid rgba(255,255,255,.06);padding-bottom:6px;margin-bottom:12px}
    label{display:block;margin:6px 0 2px;font-weight:600;font-size:13px}
    input[type="text"],
    input[type="number"],
    textarea{
      width:100%;
      padding:8px 10px;
      border-radius:8px;
      border:1px solid #3a302d;
      background:#130f0e;
      color:var(--ink);
      font:inherit;
    }
    textarea{min-height:80px;resize:vertical}
    .row{
      display:flex;
      flex-wrap:wrap;
      gap:10px;
    }
    .col{
      flex:1 1 220px;
    }
    .btn{
      border:0;
      border-radius:999px;
      padding:10px 18px;
      font-weight:700;
      cursor:pointer;
      background:linear-gradient(180deg,#AF7D4A,#7B3F00);
      color:#fff;
      box-shadow:0 10px 22px rgba(0,0,0,.4);
      margin-top:10px;
    }
    .btn.secondary{
      background:#333;
      box-shadow:none;
    }
    .topbar{
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:12px;
    }
    .badge{font-size:13px;color:var(--muted)}
    .status{
      margin-bottom:10px;
      padding:8px 10px;
      border-radius:10px;
      font-size:14px;
    }
    .status.ok{background:rgba(37,211,102,.08);border:1px solid rgba(37,211,102,.5);color:#b5ffd1}
    .status.err{background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.6);color:#ffd6d6}
    .hero-preview{
      width:100%;
      max-width:260px;
      border-radius:12px;
      overflow:hidden;
      border:1px solid var(--border);
      margin-top:8px;
    }
    .hero-preview img{width:100%;display:block}
    .login-box{
      max-width:360px;
      margin:60px auto;
      text-align:center;
    }
    .login-box h1{margin-bottom:20px}
    .footer{
      text-align:center;
      margin-top:10px;
      color:var(--muted);
      font-size:13px;
    }
    @media (max-width:600px){
      .wrap{padding:10px}
      .card{padding:12px}
      h1{font-size:20px}
    }
  </style>
</head>
<body>

<?php if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true): ?>
  <!-- *************** LOGIN *************** -->
  <div class="login-box card">
    <h1>Admin Toufayour</h1>
    <p class="badge">Entrer le mot de passe pour gérer le site.</p>
    <?php if ($loginError): ?>
      <div class="status err"><?= htmlspecialchars($loginError) ?></div>
    <?php endif; ?>
    <form method="post">
      <input type="hidden" name="action" value="login">
      <label>Mot de passe</label>
      <input type="password" name="password" required>
      <button class="btn" type="submit">Se connecter</button>
    </form>
    <div class="footer">Pense à changer le mot de passe dans le fichier <code>admin.php</code>.</div>
  </div>

<?php else: ?>
  <!-- *************** DASHBOARD *************** -->
  <div class="wrap">
    <div class="topbar">
      <div>
        <h1>Tableau de bord — Toufayour</h1>
        <div class="badge">Modifier les textes, prix et contact. Compatible mobile 📱</div>
      </div>
      <div>
        <a class="btn secondary" href="?logout=1">Se déconnecter</a>
      </div>
    </div>

    <?php if ($successMsg): ?>
      <div class="status ok"><?= htmlspecialchars($successMsg) ?></div>
    <?php endif; ?>
    <?php if ($errorMsg): ?>
      <div class="status err"><?= htmlspecialchars($errorMsg) ?></div>
    <?php endif; ?>

    <!-- CONTENU PRINCIPAL -->
    <div class="card">
      <h2>Produit principal</h2>
      <form method="post">
        <input type="hidden" name="action" value="save_content">

        <div class="row">
          <div class="col">
            <label>Prix (MAD)</label>
            <input type="number" step="0.01" name="price"
                   value="<?= htmlspecialchars($content['product']['price']) ?>">
          </div>
        </div>

        <h3>Contact global</h3>
        <div class="row">
          <div class="col">
            <label>Téléphone affiché (ex: +212 6 12 34 56 78)</label>
            <input type="text" name="phone"
                   value="<?= htmlspecialchars($content['contact']['phone']) ?>">
          </div>
          <div class="col">
            <label>WhatsApp (phone_raw, ex: 212612345678)</label>
            <input type="text" name="phone_raw"
                   value="<?= htmlspecialchars($content['contact']['phone_raw']) ?>">
          </div>
        </div>
        <div class="row">
          <div class="col">
            <label>Email</label>
            <input type="text" name="email"
                   value="<?= htmlspecialchars($content['contact']['email']) ?>">
          </div>
        </div>

        <h3>Contact / Livraison</h3>
        <div class="row">
          <div class="col">
            <label>Texte intro (FR)</label>
            <textarea name="intro_fr"><?= htmlspecialchars($content['contact']['fr']['intro'] ?? '') ?></textarea>
          </div>
          <div class="col">
            <label>Texte intro (AR)</label>
            <textarea name="intro_ar"><?= htmlspecialchars($content['contact']['ar']['intro'] ?? '') ?></textarea>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <label>Adresse (FR)</label>
            <input type="text" name="address_fr"
                   value="<?= htmlspecialchars($content['contact']['fr']['address'] ?? '') ?>">
          </div>
          <div class="col">
            <label>العنوان (AR)</label>
            <input type="text" name="address_ar"
                   value="<?= htmlspecialchars($content['contact']['ar']['address'] ?? '') ?>">
          </div>
        </div>

        <h3>À propos / من نحن</h3>
        <div class="row">
          <div class="col">
            <label>À propos (FR)</label>
            <textarea name="about_fr"><?= htmlspecialchars($content['about']['fr'] ?? '') ?></textarea>
          </div>
          <div class="col">
            <label>من نحن (AR)</label>
            <textarea name="about_ar"><?= htmlspecialchars($content['about']['ar'] ?? '') ?></textarea>
          </div>
        </div>

        <button class="btn" type="submit">💾 Enregistrer le contenu</button>
      </form>
    </div>

    <!-- GALERIE -->
    <div class="card">
      <h2>Galerie des images</h2>
      <form method="post">
        <input type="hidden" name="action" value="save_gallery">

        <div class="row">
          <div class="col">
            <label>Image principale (hero)</label>
            <input type="text" name="hero" value="<?= htmlspecialchars($gallery['hero']) ?>">
            <div class="hero-preview">
              <img src="<?= htmlspecialchars($gallery['hero']) ?>" alt="Hero preview">
            </div>
            <small style="color:var(--muted)">Chemin relatif depuis la racine (ex: <code>images/1.jpg</code>).</small>
          </div>
          <div class="col">
            <label>Liste des images (une par ligne)</label>
            <textarea name="images"><?=
              htmlspecialchars(implode("\n", $gallery['images']))
            ?></textarea>
          </div>
        </div>

        <button class="btn" type="submit">💾 Enregistrer la galerie</button>
      </form>
    </div>

    <div class="footer">
      Panel admin simple · Tu peux l'ouvrir aussi depuis ton téléphone 🙂  
      (Même réseau Wi-Fi que le PC)
    </div>
  </div>
<?php endif; ?>

</body>
</html>
