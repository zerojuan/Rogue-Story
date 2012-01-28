<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
    <title>Twitter OAuth in PHP</title>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
    <style type="text/css">
      img {border-width: 0}
      * {font-family:'Lucida Grande', sans-serif;}
    </style>
  </head>
  <body>
    <div>
      <h2>Rogue Story</h2>

      <p>This site is a basic showcase of Twitters OAuth authentication method. If you are having issues try <a href='./clearsessions.php'>clearing your session</a>.</p>
      
      <hr />
      <?php if (isset($menu)) { ?>
        <?php echo $menu; ?>
      <?php } ?>
    </div>
    <?php if (isset($status_text)) { ?>
      <?php echo '<h3>'.$status_text.'</h3>'; ?>
    <?php } ?>
    <p>
      <pre>
        <canvas id="canvas_rpg" width="480px" height="480px"></canvas> 
      </pre>
    </p>

  </body>
  <script src='js/lib/jaws-min.js'></script>
  <script src='js/enemy.js'></script>
  <script src='js/script.js'></script>
</html>
