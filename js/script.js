/**
 * Play State
 */


function PlayState(){
	var play_state = this;
	
	var tile_width = 8;
	var dungeon_width = 50;
	var dungeon_height = 50;
	var viewport;
	
	//player data
	var player;
	var player_coord = {x: 0, y: 0};
	
	var dungeon_features;
	
	//feature percentage
	var room_percentage = 75,
			corridor_percentage = 25;
	
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
	
	//environment constants
	//===== PICKABLE TYPES ======//
	var WEAPON = 0,
			ARMOR = 1,
			ITEM = 2;
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
			WALL = 0;		
	
	this.setup = function(){
		//initialize spritesheets
		character_sheet = new jaws.SpriteSheet({frame_size:[tile_width, tile_width], image:"images/lofi_char.png", orientation:"right"});
		env_sheet = new jaws.SpriteSheet({frame_size:[tile_width, tile_width], image:"images/lofi_environment.png", orientation:"right"});
			
		//initialize tile map
		viewport = new jaws.Viewport({ 
																	 
																	x: 0, y: 0});

		tile_map = new jaws.TileMap({cell_size: [tile_width, tile_width], size: [dungeon_width * tile_width, dungeon_height * tile_width]});
		
		//generate map
		player_coord = generateMap();
	
		renderMap();
		
		//initialize player sprite position
		player = new jaws.Sprite({x:player_coord.x * tile_width, y:player_coord.y * tile_width, scale: 1, anchor: "top_left"});
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
		//render object map
		//render enemy map
		//render player
		player.draw();
	};
	
	var onPressedTurn = function(key){
		//capture directional keys, detect collisions
		//detect attack
		//detect item move
		//move the rest of the world
	}
	
	var generateMap = function(){
		console.log("Generating Dungeon");
		
		//FILL THE LEVEL WITH DIRT
		tile_data = new Array(dungeon_width);
		for(var col = 0; col < dungeon_width; col++){
			tile_data[col] = new Array(dungeon_height);
			for(var row=0; row < dungeon_height; row++){
				tile_data[col][row] = {value:EARTH, isVisible:true};
			}
		}
		
		//INTIALIZE THE DUNGEON FEATURE LIST
		dungeon_features = new Array();
		
		//DIG OUT A SINGLE ROOM IN THE CENTER
		initial_room = makeRoom(Math.round(dungeon_width/2), Math.round(dungeon_height/2), 8, 8, parseInt(Math.random() * 3));
		
		//count how many features to add
		var current_features = 0;
		var total_features = 90;
		
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
					var room = makeRoom((new_x+mod_x), (new_y+mod_y), 8, 6, valid_tile);
					if(room != false){
						current_features++; //add to quota
						tile_data[new_x][new_y].value = DOOR; //mark the wall opening with a door
						tile_data[new_x+mod_x][new_y+mod_y].value = FLOOR; //clean up in front of a door so it's reachable 
					}
				}else if(feature >= 25){
					var corridor = makeCorridor((new_x+mod_x), (new_y+mod_y), 6, valid_tile);
					if(corridor != false){
						current_features++;
						tile_data[new_x][new_y].value = DOOR;
					}	
				}
			}	
		}
		console.log("Done");
		return {x: Math.round(initial_room.left + initial_room.width/2),
					  y: Math.round(initial_room.top + initial_room.height/2)}
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
	
	var renderItems = function(){
		//loop through item_list
	};
	
	var renderEnemies = function(){
		//loop through enemy_list draw only enemies around my radius
	}
	
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
				room.top = y - room_height;
				room.left = Math.round(x-room_width/2);
				room.width = room_width;
				room.height = room_height;
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
				room.top = y;
				room.left = Math.round(x-room_width/2);
				room.width = room_width;
				room.height = room_height;
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
				room.left = x;
				room.width = room_width;
				room.height = room_height;
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
				room.left = x-room_width;
				room.width = room_width;
				room.height = room_height;
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
				corridor.top = y-length;
				corridor.left = x;
				corridor.width = 1;
				corridor.height = length;
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
				corridor.top = y;
				corridor.left = x;
				corridor.width = 1;
				corridor.height = length;
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
				corridor.left = x;
				corridor.width = length;
				corridor.height = 1;
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
				corridor.left = x - length;
				corridor.width = length;
				corridor.height = 1;
				for(temp_x = x; temp_x > (x - length); temp_x--){
					tile_data[temp_x][temp_y].value = CORRIDOR;
				}
				break;
		}
		return corridor;
	}
}

window.onload = function(){
	console.log("Loading..");
	jaws.assets.add("images/lofi_char.png");
	jaws.assets.add("images/lofi_environment.png");
	jaws.start(PlayState);
}
