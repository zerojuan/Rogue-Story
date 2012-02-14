/**
 * Play State
 */

var hp_label;
var xp_label;
var level_label;

function PlayState(){
	var play_state = this;
	
	var tile_width = 16;
	var dungeon_width = 30;
	var dungeon_height = 30;
	var viewport;
	
	//player data
	var player;
	var player_data = {x: 0, y: 0, steps:0, 
											equipment: {weapon:null, armor:null},
											backpack: [],
											level: 1,
											hp: 9999,
											max_hp: 100,
											armor: 10,
											evasion: 10,
											strength: 10,
											hunger: 100,
											xpNow: 0,
											xpNextLevel: 100 
										};
	
	//tile_data and tile_map
	var tile_map;
	var tile_data;
	
	//object layer
	var pickable_map;
	var pickable_data;
	
	//enemy layer
	var enemy_map;
	var enemy_data;
	
	//sprite sheets
	var character_sheet;
	var env_sheet;
	var obj_sheet;
	var enemy_sheet;
	
	var rogueEngine;
	
	
	this.setup = function(){
		hp_label = document.getElementById("hp");		
		hp_label.innerHTML = player_data.hp;
		
		xp_label = document.getElementById("xp");
		xp_label.innerHTML = player_data.xpNow + "/" + player_data.xpNextLevel;
		
		level_label = document.getElementById("level");
		level_label.innerHTML = player_data.level;
		
		//initialize spritesheets
		character_sheet = new jaws.SpriteSheet({frame_size:[tile_width, tile_width], image:"images/lofi_char.png", orientation:"right"});
		env_sheet = new jaws.SpriteSheet({frame_size:[tile_width, tile_width], image:"images/lofi_env.png", orientation:"right"});
		enemy_sheet = new jaws.SpriteSheet({frame_size:[tile_width, tile_width], image:"images/lofi_enemy.png", orientation:"right"});
		obj_sheet = new jaws.SpriteSheet({frame_size:[tile_width, tile_width], image:"images/lofi_obj.png", orientation:"right"});
			
		//initialize tile map
		viewport = new jaws.Viewport({x: 0, y: 0});

		tile_map = new jaws.TileMap({cell_size: [tile_width, tile_width], size: [dungeon_width * tile_width, dungeon_height * tile_width]});
		
		rogueEngine = new RogueEngine(tile_data, player_data, enemy_data, enemy_map, obj_sheet, enemy_sheet, appendLog, updateHUD);
		
		rogueEngine.goDeeper();
		renderMap();
		
		//initialize player sprite position
		player = new jaws.Sprite({x:player_data.x * tile_width, y:player_data.y * tile_width, scale: 1, anchor: "top_left"});
		player.setImage(character_sheet.frames[3]);
		jaws.context.mozImageSmoothingEnabled = false;
		
		//appendLog(dialogs.showIntro());
		//tweet("Is Adventuring...");
		
		jaws.preventDefaultKeys(["up", "down", "left", "right", "space"]);
		
		//add key event listener
		jaws.on_keyup(["up", "down", "left", "right", "space"], onPressedTurn);
	};
	
	this.update = function(){
		
	};
	
	this.draw = function(){
		jaws.clear();
		//render tilemap
		viewport.drawTileMap(tile_map);
		rogueEngine.itemGenerator.pickable_map.drawIf(rogueEngine.isObjVisible);
		rogueEngine.enemyGenerator.enemy_map.drawIf(rogueEngine.isEnemyVisible);
		//render object map
		//render enemy map
		//render player
		player.draw();
	};
	
	var appendLog = function(text,type){
		$("<p class='"+type+"'>"+text+"</p>").hide().prependTo(".rightHud").fadeIn("slow");
	};
	
	var updateHUD = function(hudInfo){
		if(hudInfo.hp){
			hp_label.innerHTML = hudInfo.hp;
		}
		if(hudInfo.level){
			level_label.innerHTML = hudInfo.level;
		}
		if(hudInfo.xp){
			xp_label.innerHTML = hudInfo.xp;
		}
	}
	
	var onPressedTurn = function(key){
		//capture directional keys, detect collisions
		var player_x = player_data.x,
			 	player_y = player_data.y;
			 	
		var mod_x = 0,
			  mod_y = 0;	 	
		var spacePressed = false;
		if(player_data.hp <= 0){
			return;
		}
		
		if(key == "up"){
			if(!rogueEngine.isPassable(player_x, player_y - 1)) return;
			mod_y = -1;
		}else if(key == "down"){
			if(!rogueEngine.isPassable(player_x, player_y + 1)) return;
			mod_y = 1;
		}else if(key == "left"){
			if(!rogueEngine.isPassable(player_x - 1, player_y)) return;
			mod_x = -1;
		}else if(key == "right"){
			if(!rogueEngine.isPassable(player_x+1, player_y)) return;
			mod_x = 1;
		}else if(key == "space"){
			spacePressed = true;
		}
		if(spacePressed){
			rogueEngine.doAction(player_x, player_y);
		}else{
			computeMove(player_x, player_y, mod_x, mod_y);
		}
		//enemy move
		rogueEngine.computeEnemyMove(player_data.x, player_data.y);
		rogueEngine.updateVision(player_data.x, player_data.y);
		player.moveTo(player_data.x * tile_width, player_data.y*tile_width);
		
		renderMap();
	}
	
	var computeMove = function(player_x, player_y, mod_x, mod_y){
		var new_x = player_x+mod_x,
				new_y = player_y+mod_y;
		if(rogueEngine.isDoor(new_x, new_y)){
			rogueEngine.openDoor(new_x, new_y);
		}else if(rogueEngine.isChest(new_x, new_y)){
			rogueEngine.openChest(new_x,new_y);
		}else if(rogueEngine.isEnemy(new_x, new_y)){
			rogueEngine.attackEnemy(new_x,new_y, onAttackDone);
		}else if(rogueEngine.isExit(new_x,new_y)){
			rogueEngine.goDeeper();
		}else{
			//rogueEngine.computePlayerRunAway(new_x, new_y);
			player_data.x = new_x;
			player_data.y = new_y;
		}
	}
	
	var onAttackDone = function(result){
		appendLog(result.story, result.type);
	}
	
	var updateLabels = function(){
		hp_label.innerHTML = player_data.hp;
		xp_label.innerHTML = player_data.xpNow + "/" + player_data.xpNextLevel;
		level_label.innerHTML = player_data.level;
	}
	
	var renderMap = function(){
		var tile_data = rogueEngine.dungeonGenerator.tile_data;
		tile_map.clear();
		for(var i = 0; i < dungeon_width; i++){
			for(var i2 = 0; i2 < dungeon_height; i2++){
					var sprite = new jaws.Sprite({x:i*tile_width, y:i2*tile_width, anchor:"top_left"});
					sprite.setImage(env_sheet.frames[(tile_data[i][i2].value) + (rogueEngine.area*16)]);
					if(tile_data[i][i2].visibility == constants.VISIBLE){
						sprite.alpha = 1;
					}else if(tile_data[i][i2].visibility == constants.FOG){
						sprite.alpha = .5;
					}else if(tile_data[i][i2].visibility == constants.UN_EXPLORED){
						sprite.alpha = .1;
					}
					tile_map.push( sprite );
			}
		}
	};
	
	
}

var stage;

var character_img;
var env_img;
var obj_img;
var enemy_img;

var enemy_layer;
var player_layer;
var item_layer;
var dungeon_layer;

var tile_width = 16;
var tile_height = 16;
var dungeon_width = 30;
var dungeon_height = 30;

function PlayState(){
	
	
	this.setup = function(){
		
	}
	//create
}

function preloadGFX(evt){
	//if graphics is done, show game screen
	var playState = new PlayState();
	playState.setup();
}

function tick(){
	//game loop now
}

window.onload = function(){
	console.log("Loading..");
	//preloading art assets
	//
	//show preloading screen
	
	Ticker.setFPS(30);
	Ticker.addListener(this);
}
