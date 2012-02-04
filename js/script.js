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
											hp: 50,
											max_hp: 100,
											armor: 10,
											evasion: 10,
											strength: 10,
											hunger: 100,
											xpNow: 0,
											xpNextLevel: 100 
										};
	var dungeon_features;
	
	//feature percentage
	var room_percentage = 60,
			corridor_percentage = 40;
	var possible_items = 20;
	var enemy_in_the_box_rate = 20;
	var obj_rarity_rate = 10;
	var total_features = 90;
	
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
		
		goDeeper();
		
		//initialize player sprite position
		player = new jaws.Sprite({x:player_data.x * tile_width, y:player_data.y * tile_width, scale: 1, anchor: "top_left"});
		player.setImage(character_sheet.frames[3]);
		jaws.context.mozImageSmoothingEnabled = false;
		
		appendLog(dialogs.showIntro());
		tweet("Is Adventuring...");
		
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
		pickable_map.drawIf(isObjVisible);
		enemy_map.drawIf(isEnemyVisible);
		//render object map
		//render enemy map
		//render player
		player.draw();
	};
	
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
			if(!isPassable(player_x, player_y - 1)) return;
			mod_y = -1;
		}else if(key == "down"){
			if(!isPassable(player_x, player_y + 1)) return;
			mod_y = 1;
		}else if(key == "left"){
			if(!isPassable(player_x - 1, player_y)) return;
			mod_x = -1;
		}else if(key == "right"){
			if(!isPassable(player_x+1, player_y)) return;
			mod_x = 1;
		}else if(key == "space"){
			spacePressed = true;
		}
		if(spacePressed){
			doAction(player_x, player_y);
		}else{
			computeMove(player_x, player_y, mod_x, mod_y);
		}
		//enemy move
		computeEnemyMove(player_data.x, player_data.y);
		updateVision(player_data.x, player_data.y);
		player.moveTo(player_data.x * tile_width, player_data.y*tile_width);
		
		renderMap();
	}
	
	var computeMove = function(player_x, player_y, mod_x, mod_y){
		var new_x = player_x+mod_x,
				new_y = player_y+mod_y;
		if(isDoor(new_x, new_y)){
			openDoor(new_x, new_y);
		}else if(isChest(new_x, new_y)){
			openChest(new_x,new_y);
		}else if(isEnemy(new_x, new_y)){
			attackEnemy(new_x,new_y);
		}else if(isExit(new_x,new_y)){
			goDeeper();
		}else{
			computePlayerRunAway(new_x, new_y);
			player_data.x = new_x;
			player_data.y = new_y;
		}
	}
	
	var updateLabels = function(){
		hp_label.innerHTML = player_data.hp;
		xp_label.innerHTML = player_data.xpNow + "/" + player_data.xpNextLevel;
		level_label.innerHTML = player_data.level;
	}
	
	var renderMap = function(){
		tile_map.clear();
		for(var i = 0; i < dungeon_width; i++){
			for(var i2 = 0; i2 < dungeon_height; i2++){
				if(tile_data[i][i2].isVisible){
					var sprite = new jaws.Sprite({x:i*tile_width, y:i2*tile_width, anchor:"top_left"});
					sprite.setImage(env_sheet.frames[(tile_data[i][i2].value) + (area*16)]);
					tile_map.push( sprite );
				}
			}
		}
	};
	
	
}

window.onload = function(){
	console.log("Loading..");
	jaws.assets.add("images/lofi_char.png");
	jaws.assets.add("images/lofi_env.png");
	jaws.assets.add("images/lofi_obj.png");
	jaws.assets.add("images/lofi_enemy.png");
	jaws.start(PlayState);
}

$(document).ready(function(){
  
})
