<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
    <title>Twitter OAuth in PHP</title>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
    <style type="text/css">
      img {border-width: 0}
      * {font-family:'Lucida Grande', sans-serif;}
      .container {
      	margin: auto;
      	width: 500px;
      }
      
      p{
      	font-family: "lucida grande",tahoma,verdana,arial,sans-serif;
      	font-size: 13px;
      }
      
      .canvasContent{
      	margin: auto;
      	width: 480px;
      }
      
      .leftHud{
      	float: left;
      	width: 20%;
      	border-left-style: solid;
      	border-left-width: 1px;
      }
      
      .leftHud p{
      	margin-left: 5px;
      }
      
      .rightHud{
      	float: left;
      	width: 70%;
      	height: 300px;
      	overflow: hidden;
				overflow-x: hidden;
      }
      
      .hudContent{
      	margin: auto;
      	width: 480px;
      }
      
      p.attack{
      	
      }
      
      p.hurt{
      	
      }
      
      p.die{
      	background: #7a7878;
      }
      
      p.kill{
      	background: #d0a7a7;
      }
    </style>
  </head>
  <body>
  	<div class="container">
	    <div >
	      <h2>Rogue Story</h2>
	
	      <!-- 
	      	<p>This site is a basic showcase of Twitters OAuth authentication method. If you are having issues try <a href='./clearsessions.php'>clearing your session</a>.</p>
	      -->
	    </div>
	    <hr />
	    <div class="canvasContent">
	        <canvas id="canvas_rpg" width="480px" height="480px" style="background:black;"></canvas> 
	    </div>
	    <div class="hudContent">
		    <div class="rightHud">
		    	<p>Loading...</p>
		    </div>
		    <div class="leftHud">
		    		<p>
		    			HP: <span id="hp"></span>
		    		</p>
		    		<p>
		    			XP: <span id="xp"></span>
		    		</p>
		    		<p>
		    			Level: <span id="level"></span>
		    		</p>
		    </div>
	    </div>  
    </div>

  </body>
  <script src='http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js'></script>
  <script src='js/lib/jaws-min.js'></script>
  <script src='js/tweet.js'></script>
  <script src='js/enemy.js'></script>
  <script src='js/dialogs.js'></script>
  <script src='js/item-generator.js'></script>
  <script src='js/enemy-generator.js'></script>
  <script src='js/dungeon-generator.js'></script>
  <script src='js/rogue-engine.js'></script>
  <script src='js/script.js'></script>
</html>
