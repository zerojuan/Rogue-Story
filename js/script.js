/**
 * Play State
 */


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
											armor: 10,
											evasion: 10,
											strength: 10,
											hunger: 100
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
	var enemy_list;
	
	//sprite sheets
	var character_sheet;
	var env_sheet;
	var obj_sheet;
	var enemy_sheet;
	
	
	//environment constants
	
	//===== ROOM DIRECTIONS ====//
	var NORTH = 0,
			SOUTH = 1,
			EAST = 2,
			WEST = 3;
	//===== ENVIRONMENT SPRITESHEET INDEX ===/
	var FLOOR = 102,
			EARTH = 28,
			CORRIDOR = 6,
			DOOR = 26,
			DOOR_OPEN = 27,
			STAIR_UP = 23,
			STAIR_DOWN = 24,
			WALL = 0;
	//===== PICKABLE SPRITESHEET INDEX ======//
	var WEAPON_RARE = 56,
			WEAPON_COMMON = 54,
			ARMOR_RARE = 52,
			ARMOR_COMMON = 49,
			ITEM_HP = 13,
			ITEM_XP = 3,
			CHEST = 2;		
	
	this.setup = function(){
		//initialize spritesheets
		character_sheet = new jaws.SpriteSheet({frame_size:[tile_width, tile_width], image:"images/lofi_char.png", orientation:"right"});
		env_sheet = new jaws.SpriteSheet({frame_size:[tile_width, tile_width], image:"images/lofi_environment.png", orientation:"right"});
		enemy_sheet = new jaws.SpriteSheet({frame_size:[tile_width, tile_width], image:"images/lofi_enemy.png", orientation:"right"});
		obj_sheet = new jaws.SpriteSheet({frame_size:[tile_width, tile_width], image:"images/lofi_obj.png", orientation:"right"});
			
		var enemy = new Enemy(10, 10, 1, 1);
		//initialize tile map
		viewport = new jaws.Viewport({x: 0, y: 0});

		tile_map = new jaws.TileMap({cell_size: [tile_width, tile_width], size: [dungeon_width * tile_width, dungeon_height * tile_width]});
		
		goDeeper();		
		
		//initialize player sprite position
		player = new jaws.Sprite({x:player_data.x * tile_width, y:player_data.y * tile_width, scale: 1, anchor: "top_left"});
		player.setImage(character_sheet.frames[3]);
		jaws.context.mozImageSmoothingEnabled = false;
		
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
			
		}
		computeMove(player_x, player_y, mod_x, mod_y);
		updateVision(player_data.x, player_data.y);
		player.moveTo(player_data.x * tile_width, player_data.y*tile_width);
		renderMap();
		//detect attack
		//detect item move
		//move the rest of the world
	}
	
	var computeMove = function(player_x, player_y, mod_x, mod_y){
		var new_x = player_x+mod_x,
				new_y = player_y+mod_y;
		if(isDoor(new_x, new_y)){
			openDoor(new_x, new_y);
		}else if(isChest(new_x, new_y)){
			openChest(new_x,new_y);
		}else if(isExit(new_x,new_y)){
			goDeeper();
		}else{
			player_data.x = new_x;
			player_data.y = new_y;
		}
	}
	
	var goDeeper = function(){
		//generate map
		player_data = generateMap();
		updateVision(player_data.x, player_data.y);
		tile_data[player_data.x][player_data.y].value = STAIR_UP;	
		console.log("Total Dungeon Features: " + dungeon_features.length);
		//populate items
		populateObjects();
		renderMap();
	}
	
	var isPassable = function(x, y){
		if(tile_data[x][y].value == WALL ||
			tile_data[x][y].value == EARTH){
				return false;
			}
		return true;
	}
	
	var isVisionBlocker = function(x,y){
		if(tile_data[x][y].value == WALL ||
				tile_data[x][y].value == DOOR ||
				tile_data[x][y].value == EARTH){
				return true;
		}
		return false;
	}
	
	var isObjVisible = function(item){
		var grid_x = item.x/tile_width;
		var grid_y = item.y/tile_width;
		if(tile_data[grid_x][grid_y].isVisible && pickable_data[grid_x][grid_y] != undefined){
			return true;
		}
		return false;
	}
	
	var isEnemyVisible = function(enemy){
		//TODO: isEnemyVisible
	}
	
	var isExit = function(x,y){
		return tile_data[x][y].value == STAIR_DOWN;
	}
	
	var isDoor = function(x,y){
		return tile_data[x][y].value == DOOR;
	}
	
	var openDoor = function(x,y){
		tile_data[x][y].value = DOOR_OPEN;
	}
	
	var isChest = function(x,y){
		if(pickable_data[x][y] != undefined && pickable_data[x][y].isCovered){
			return true;
		}
		return false;
	}
	
	var openChest = function(x,y){
		pickable_data[x][y].isCovered = false;
		//generate item
		generateItem(x,y);
	}
	
	var updateVision = function(x,y){
		//normal vision
		tile_data[x+1][y].isVisible = true;
		tile_data[x-1][y].isVisible = true;
		tile_data[x][y+1].isVisible = true;
		tile_data[x][y-1].isVisible = true;
		//diagonal vision
		tile_data[x-1][y-1].isVisible = true;
		tile_data[x+1][y-1].isVisible = true;
		tile_data[x-1][y+1].isVisible = true;
		tile_data[x+1][y+1].isVisible = true;
		//extended vision
		if(!isVisionBlocker(x+1,y)) tile_data[x+2][y].isVisible = true;
		if(!isVisionBlocker(x-1,y)) tile_data[x-2][y].isVisible = true;
		if(!isVisionBlocker(x, y+1)) tile_data[x][y+2].isVisible = true;
		if(!isVisionBlocker(x, y-1)) tile_data[x][y-2].isVisible = true;
		
		tile_data[x][y].isVisible = true;
	}
	
	var populateObjects = function(){
		pickable_map = new jaws.SpriteList();
		var obj_count = 0;
		pickable_data = new Array(dungeon_width);
		for(var col = 0; col < dungeon_width; col++){
			pickable_data[col] = new Array(dungeon_height);
			for(var row=0; row < dungeon_height; row++){
				pickable_data[col][row] = undefined;
			}
		}
		for(i in dungeon_features){
			if(dungeon_features[i].type == 'room'){
				var room = dungeon_features[i];
				var num_items = Math.random() * 20 - 10;
				for(var item_count = 0; item_count < num_items; item_count++){
					var sub_x = Math.round(Math.random() * (room.width-1));
					var sub_y = Math.round(Math.random() * (room.height-1));
					var item_x = (room.left+1) + sub_x-1;
					var item_y = (room.top+1) + sub_y-1;
					if(pickable_data[item_x][item_y] == undefined && tile_data[item_x][item_y].value == FLOOR){
						var sprite = new jaws.Sprite({x:item_x*tile_width, y:item_y*tile_width, anchor:"top_left"});
						sprite.setImage(obj_sheet.frames[CHEST]);
						pickable_map.push(sprite);
						pickable_data[item_x][item_y] = {item_data:{}, isCovered:true,sprite:sprite};
						obj_count++;
					}
				}
				if(obj_count >= possible_items) break;
			}
		}
	}
	
	var generateItem = function(x,y){
		var dice = Math.random() * 100;
		if(dice <= enemy_in_the_box_rate){
					//TODO: Holy crap it's an enemy
					delete pickable_data[x][y];
					console.log("Uncovered an enemy");
		}else{
					var dice_rarity = Math.random() * 100;
					if(dice_rarity <= obj_rarity_rate){
						//produce rare object
						pickable_data[x][y].sprite.setImage(obj_sheet.frames[WEAPON_RARE]);
					}else{
						//produce ordinary object
						pickable_data[x][y].sprite.setImage(obj_sheet.frames[WEAPON_COMMON]);
					}
		}
	}
	
	var generateMap = function(){
		console.log("Generating Dungeon");
		
		//FILL THE LEVEL WITH DIRT
		tile_data = new Array(dungeon_width);
		for(var col = 0; col < dungeon_width; col++){
			tile_data[col] = new Array(dungeon_height);
			for(var row=0; row < dungeon_height; row++){
				tile_data[col][row] = {value:EARTH, isVisible:false};
			}
		}
		
		//INTIALIZE THE DUNGEON FEATURE LIST
		dungeon_features = new Array();
		
		//DIG OUT A SINGLE ROOM IN THE CENTER
		initial_room = makeRoom(Math.round(dungeon_width/2), Math.round(dungeon_height/2), 8, 8, parseInt(Math.random() * 3));
		
		dungeon_features.push(initial_room);
		
		//count how many features to add
		var current_features = 0;
		
		for(var countingTries = 0; countingTries < 1000; countingTries++){
			if(current_features == total_features){
				break;
			}
			
			var new_x = 0,
					new_y = 0,
					mod_x = 0,
					mod_y = 0,
					valid_tile = -1;
			//try looping 1000 times trying to build an extension to a room
			for(var testTries = 0; testTries < 1000; testTries++){
				new_x = parseInt(Math.random() * (dungeon_width - 1));
				new_y = parseInt(Math.random() * (dungeon_height - 1));
				valid_tile = -1;
				
				if(tile_data[new_x][new_y].value == WALL || tile_data[new_x][new_y].value == CORRIDOR){
					//check if we can reach the place
					if((new_y+1) < dungeon_height &&
						(tile_data[new_x][new_y + 1].value == FLOOR || tile_data[new_x][new_y + 1].value == CORRIDOR)){
						valid_tile = NORTH;
						mod_x = 0;
						mod_y = -1;
					}else if((new_x - 1) > 0 &&
						(tile_data[new_x-1][new_y].value == FLOOR || tile_data[new_x-1][new_y].value == CORRIDOR)){
						valid_tile = EAST;
						mod_x = 1;
						mod_y = 0;	
					}else if((new_y - 1) > 0 &&
						(tile_data[new_x][new_y-1].value == FLOOR || tile_data[new_x][new_y-1].value == CORRIDOR)){
						valid_tile = SOUTH;
						mod_x = 0;
						mod_y = 1;	
					}else if((new_x + 1) < dungeon_width &&
						(tile_data[new_x+1][new_y].value == FLOOR || tile_data[new_x+1][new_y].value == CORRIDOR)){
						valid_tile = WEST;
						mod_x = -1;
						mod_y = 0;
					}		
				}
				
				//check that we haven't got another door nearby, so there won't be a lot of opening next to each other
				if(valid_tile > -1){
					if(new_y+1 < dungeon_height && tile_data[new_x][new_y+1].value == DOOR)
						valid_tile = -1;
					else if(new_x-1 > 0 && tile_data[new_x-1][new_y].value == DOOR)
						valid_tile = -1;
					else if(new_y-1 > 0 && tile_data[new_x][new_y-1].value == DOOR)
						valid_tile = -1;
					else if(new_x+1 < dungeon_width && tile_data[new_x+1][new_y].value == DOOR)
						valid_tile = -1;
				}
				
				//if we can, jump out of the loop and continue with the rest
				if(valid_tile > -1) break;
			}
			if(valid_tile > -1){
				//choose what to build
				var feature = Math.random() * 100;
				if(feature <= room_percentage){
					var room = makeRoom((new_x+mod_x), (new_y+mod_y), 6, 6, valid_tile);
					if(room != false){
						current_features++; //add to quota
						tile_data[new_x][new_y].value = DOOR; //mark the wall opening with a door
						tile_data[new_x+mod_x][new_y+mod_y].value = FLOOR; //clean up in front of a door so it's reachable
						dungeon_features.push(room); 
					}
				}else if(feature >= corridor_percentage){
					var corridor = makeCorridor((new_x+mod_x), (new_y+mod_y), 6, valid_tile);
					if(corridor != false){
						current_features++;
						tile_data[new_x][new_y].value = DOOR;
						dungeon_features.push(corridor);
					}	
				}
			}	
		}
		console.log("Features before trim: " + dungeon_features.length);
		//remove awkward corridors
		for(var i in dungeon_features){
			if(dungeon_features[i].type=='corridor'){
				//trim this corridor
				var corridor = dungeon_features[i];
				if(!validateCorridor(corridor)){
					delete dungeon_features[i];
				}				
			}
		}
		
		dungeon_features = dungeon_features.filter(function(){return true});
		
		//add exit stairs
		for(var i = dungeon_features.length-1; i > 0; i--){
			if(dungeon_features[i].type == 'room'){
				var room = dungeon_features[i];
				var x = Math.round(room.left + room.width/2);
				var y = Math.round(room.top + room.height/2);
				tile_data[x][y].value = STAIR_DOWN;
				break;
			}
		}
		
		player_position = {x: Math.round(initial_room.left + initial_room.width/2),
					  y: Math.round(initial_room.top + initial_room.height/2)};
		
		console.log("Done");
		return player_position;
	}
	
	var renderMap = function(){
		tile_map.clear();
		for(var i = 0; i < dungeon_width; i++){
			for(var i2 = 0; i2 < dungeon_height; i2++){
				if(tile_data[i][i2].isVisible){
					var sprite = new jaws.Sprite({x:i*tile_width, y:i2*tile_width, anchor:"top_left"});
					sprite.setImage(env_sheet.frames[tile_data[i][i2].value]);
					tile_map.push( sprite );
				}
			}
		}
	};
	
	var makeRoom = function(x,y,room_width, room_height, direction){
		room_width = parseInt(Math.random() * room_width + 4);
		room_height = parseInt(Math.random() * room_height + 4);
		
		var temp_x = 0,
				temp_y = 0;
		var room = {type:'room',top:0, left:0, width:0, height:0};
				
		switch(direction){
			case NORTH:
				//check if there's enough space
				for(temp_y = y; temp_y > (y - room_height); temp_y--){
					if(temp_y < 0 || temp_y >= dungeon_height) return false;
					for(temp_x = Math.round(x-room_width/2); temp_x < (x+(room_width+1)/2); temp_x++){
						if(temp_x < 0 || temp_x >= dungeon_width) return false;
						if(tile_data[temp_x][temp_y].value != EARTH) return false;
					}
				}
				room.top = y - room_height+1;
				room.left = Math.round(x-room_width/2);
				room.width = room_width;
				room.height = room_height;
				room.facing = 'NORTH';
				for (temp_y = y; temp_y > (y-room_height); temp_y--){
					for (temp_x = Math.round(x-room_width/2); temp_x < (x+(room_width+1)/2); temp_x++){
						//start with the walls
						if (temp_x == Math.round(x-room_width/2)) tile_data[temp_x][temp_y].value = WALL;
						else if (temp_x == Math.round(x+(room_width-1)/2)) tile_data[temp_x][temp_y].value = WALL;
						else if (temp_y == y) tile_data[temp_x][temp_y].value = WALL;
						else if (temp_y == Math.round(y-room_height+1)) tile_data[temp_x][temp_y].value = WALL;
						//and then fill with the floor
						else tile_data[temp_x][temp_y].value = FLOOR;
					}
				}
				break;
			case SOUTH:
				for(temp_y = y; temp_y < (y+room_height); temp_y++){
					if(temp_y < 0 || temp_y >= dungeon_height) return false;
					for(temp_x = Math.round(x - room_width/2); temp_x < (x+(room_width+1)/2); temp_x++){
						if(temp_x < 0 || temp_x >= dungeon_width) return false;
						if(tile_data[temp_x][temp_y].value != EARTH) return false;
					}
				}
				room.top = y-1;
				room.left = Math.round(x-room_width/2);
				room.width = room_width;
				room.height = room_height;
				room.facing = 'SOUTH';
				for (temp_y = y; temp_y < (y+room_height); temp_y++){
					for (temp_x = Math.round(x-room_width/2); temp_x < (x+(room_width+1)/2); temp_x++){
								//start with the walls
						if (temp_x == Math.round(x-room_width/2)) tile_data[temp_x][temp_y].value = WALL;
						else if (temp_x == Math.round(x+(room_width-1)/2)) tile_data[temp_x][temp_y].value = WALL;
						else if (temp_y == y) tile_data[temp_x][temp_y].value = WALL;
						else if (temp_y == (y+room_height-1)) tile_data[temp_x][temp_y].value = WALL;
								//and then fill with the floor
						else tile_data[temp_x][temp_y].value = FLOOR;
					}
				}
				break;
			case EAST:
				for(temp_y = Math.round(y-room_height/2);temp_y < (y+(room_height+1)/2); temp_y++){
					if(temp_y < 0 || temp_y >= dungeon_height) return false;
					for(temp_x = x; temp_x < (x+room_width); temp_x++){
						if(temp_x < 0 || temp_x >= dungeon_width) return false;
						if(tile_data[temp_x][temp_y].value != EARTH) return false;
					}
				}
				room.top = Math.round(y-room_height/2);
				room.left = x-1;
				room.width = room_width;
				room.height = room_height;
				room.facing = 'EAST';
				for (temp_y = Math.round(y-room_height/2); temp_y < (y+(room_height+1)/2); temp_y++){
					for (temp_x = x; temp_x < (x+room_width); temp_x++){
			 
						if (temp_x == x) tile_data[temp_x][temp_y].value = WALL;
						else if (temp_x == (x+room_width-1)) tile_data[temp_x][temp_y].value = WALL;
						else if (temp_y == Math.round(y-room_height/2)) tile_data[temp_x][temp_y].value = WALL;
						else if (temp_y == Math.round(y+(room_height-1)/2)) tile_data[temp_x][temp_y].value = WALL;
			 
						else tile_data[temp_x][temp_y].value = FLOOR;
					}
				}
				break;
			case WEST:
				for(temp_y = Math.round(y-room_height/2);temp_y < (y+(room_height+1)/2); temp_y++){
					if(temp_y < 0 || temp_y >= dungeon_height) return false;
					for(temp_x = x; temp_x > (x - room_width); temp_x--){
						if(temp_x < 0 || temp_x >= dungeon_width) return false;
						if(tile_data[temp_x][temp_y].value != EARTH) return false;
					}
				}
				room.top = Math.round(y-room_height/2);
				room.left = x-room_width+1;
				room.width = room_width;
				room.height = room_height;
				room.facing = 'WEST';
				for (temp_y = Math.round(y-room_height/2); temp_y < (y+(room_height+1)/2); temp_y++){
					for (temp_x = x; temp_x > (x-room_width); temp_x--){
						if (temp_x == x) tile_data[temp_x][temp_y].value = WALL;
						else if (temp_x == (x-room_width+1)) tile_data[temp_x][temp_y].value = WALL;
						else if (temp_y == Math.round(y-room_height/2)) tile_data[temp_x][temp_y].value = WALL;
						else if (temp_y == Math.round(y+(room_height-1)/2)) tile_data[temp_x][temp_y].value = WALL;
			 
						else tile_data[temp_x][temp_y].value = FLOOR;
					}
				}
				break;
		}
		return room;
	}
	
	var makeCorridor = function(x,y, length, direction){
		length = parseInt(Math.random() * length + 2);
		
		var temp_x = 0,
				temp_y = 0;
		var corridor = {type:'corridor',
									  top:0, 
									  left:0, 
									  width:0, 
									  height:0};		
		switch(direction){
			case NORTH:
				if(x < 0 || x>=dungeon_width) return false;
				else temp_x = x;
				
				for(temp_y = y; temp_y > (y-length); temp_y--){
					if(temp_y < 0 || temp_y >= dungeon_height) return false;
					if(tile_data[temp_x][temp_y].value != EARTH) return false;
				}
				corridor.top = y-length+1;
				corridor.left = x;
				corridor.width = 0;
				corridor.height = length;
				corridor.facing = 'NORTH';
				for(temp_y = y; temp_y > (y - length); temp_y--){
					tile_data[temp_x][temp_y].value = CORRIDOR;
				}
				break;
			case SOUTH:
				if(x < 0 || x >= dungeon_width) return false;
				else temp_x = x;
				
				for(temp_y = y; temp_y < (y+length); temp_y++){
					if(temp_y < 0 || temp_y >= dungeon_height) return false;
					if(tile_data[temp_x][temp_y].value != EARTH) return false;
				}
				corridor.top = y-1;
				corridor.left = x;
				corridor.width = 0;
				corridor.height = length;
				corridor.facing = 'SOUTH';
				for(temp_y = y; temp_y < (y + length); temp_y++){
					tile_data[temp_x][temp_y].value = CORRIDOR;
				}
				break;
			case EAST:
				if(y < 0 || y >= dungeon_height) return false;
				else temp_y = y;
				
				for(temp_x = x; temp_x < (x+length); temp_x++){
					if(temp_x < 0 || temp_x >= dungeon_width) return false;
					if(tile_data[temp_x][temp_y].value != EARTH) return false;
				}
				corridor.top = y;
				corridor.left = x-1;
				corridor.width = length;
				corridor.height = 0;
				corridor.facing = 'EAST';
				for(temp_x = x; temp_x < (x + length); temp_x++){
					tile_data[temp_x][temp_y].value = CORRIDOR;
				}
				break;
			case WEST:
				if(y < 0 || y >= dungeon_height) return false;
				else temp_y = y;
				
				for(temp_x = x; temp_x > (x - length); temp_x--){
					if(temp_x < 0 || temp_x >= dungeon_width) return false;
					if(tile_data[temp_x][temp_y].value != EARTH) return false;
				}
				corridor.top = y;
				corridor.left = x - length + 1;
				corridor.width = length;
				corridor.height = 0;
				corridor.facing = 'WEST';
				for(temp_x = x; temp_x > (x - length); temp_x--){
					tile_data[temp_x][temp_y].value = CORRIDOR;
				}
				break;
		}
		return corridor;
	}

	var validateCorridor = function(corridor){
		var start_x = corridor.left;
		var start_y = corridor.top;
		var end_x = corridor.left + corridor.width;
		var end_y = corridor.top + corridor.height;
		//console.log("Start: " + start_x + "," + start_y + " : End: " + end_x + ", " + end_y + " Facing: " + corridor.facing);
		//console.log("Neighbor: " + getNumInValidNeighbors(start_x,start_y) + " : " + getNumInValidNeighbors(end_x, end_y));
		if(getNumInValidNeighbors(start_x, start_y) == 3 || getNumInValidNeighbors(end_x, end_y) == 3){
			//console.log("REMOVE ME");
			for(var x = start_x; x <= end_x; x++){
				for(var y = start_y; y <= end_y; y++){
					if(tile_data[x][y].value == CORRIDOR)
						tile_data[x][y].value = EARTH;
					else if(tile_data[x][y].value == DOOR){
						tile_data[x][y].value = WALL;
					}						
				}
			}
			return false;
		}
		return true;
	}
	
	var getNumInValidNeighbors = function(x,y){
		//get total
		var total = 0;
		if(y-1 <= 0 || (tile_data[x][y-1].value == EARTH || tile_data[x][y-1].value == WALL)){ //NORTH
			total+=1;
		}
		if(y+1 >= dungeon_height || (tile_data[x][y+1].value == EARTH || tile_data[x][y+1] == WALL)){ //SOUTH
			total+=1;
		}
		if(x-1 <= 0 || (tile_data[x-1][y].value == EARTH || tile_data[x-1][y].value == WALL)){ //WEST
			total+=1;
		}
		if(x+1 >= dungeon_width || (tile_data[x+1][y].value == EARTH || tile_data[x+1][y].value == WALL)){ //EAST
			total+=1;
		}
		return total;
	}
}

window.onload = function(){
	console.log("Loading..");
	jaws.assets.add("images/lofi_char.png");
	jaws.assets.add("images/lofi_environment.png");
	jaws.assets.add("images/lofi_obj.png");
	jaws.assets.add("images/lofi_enemy.png");
	jaws.start(PlayState);
}
