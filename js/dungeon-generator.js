function DungeonGenerator(){
	var instance = this;
	
	this.tile_data = {};
	
	this.generateMap = function(dungeon_width, dungeon_height){
		console.log("Generating Dungeon");
		
		var tile_data = instance.tile_data;
		
		//FILL THE LEVEL WITH DIRT
		tile_data = new Array(dungeon_width);
		for(var col = 0; col < dungeon_width; col++){
			tile_data[col] = new Array(dungeon_height);
			for(var row=0; row < dungeon_height; row++){
				tile_data[col][row] = {value:EARTH, isVisible:false};
			}
		}
		
		//INTIALIZE THE DUNGEON FEATURE LIST
		var dungeon_features = new Array();
		
		//DIG OUT A SINGLE ROOM IN THE CENTER
		initial_room = makeRoom(Math.round(dungeon_width/2), Math.round(dungeon_height/2), 8, 8, parseInt(Math.random() * 3), 
			dungeon_width, dungeon_height, tile_data);
		
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
				
				if(tile_data[new_x][new_y].value == constants.WALL || tile_data[new_x][new_y].value == constants.CORRIDOR){
					//check if we can reach the place
					if((new_y+1) < dungeon_height &&
						(tile_data[new_x][new_y + 1].value == constants.FLOOR || tile_data[new_x][new_y + 1].value == constants.CORRIDOR)){
						valid_tile = constants.NORTH;
						mod_x = 0;
						mod_y = -1;
					}else if((new_x - 1) > 0 &&
						(tile_data[new_x-1][new_y].value == constants.FLOOR || tile_data[new_x-1][new_y].value == constants.CORRIDOR)){
						valid_tile = constants.EAST;
						mod_x = 1;
						mod_y = 0;	
					}else if((new_y - 1) > 0 &&
						(tile_data[new_x][new_y-1].value == constants.FLOOR || tile_data[new_x][new_y-1].value == constants.CORRIDOR)){
						valid_tile = constants.SOUTH;
						mod_x = 0;
						mod_y = 1;	
					}else if((new_x + 1) < dungeon_width &&
						(tile_data[new_x+1][new_y].value == constants.FLOOR || tile_data[new_x+1][new_y].value == constants.CORRIDOR)){
						valid_tile = constants.WEST;
						mod_x = -1;
						mod_y = 0;
					}		
				}
				
				//check that we haven't got another door nearby, so there won't be a lot of opening next to each other
				if(valid_tile > -1){
					if(new_y+1 < dungeon_height && tile_data[new_x][new_y+1].value == constants.DOOR)
						valid_tile = -1;
					else if(new_x-1 > 0 && tile_data[new_x-1][new_y].value == constants.DOOR)
						valid_tile = -1;
					else if(new_y-1 > 0 && tile_data[new_x][new_y-1].value == constants.DOOR)
						valid_tile = -1;
					else if(new_x+1 < dungeon_width && tile_data[new_x+1][new_y].value == constants.DOOR)
						valid_tile = -1;
				}
				
				//if we can, jump out of the loop and continue with the rest
				if(valid_tile > -1) break;
			}
			if(valid_tile > -1){
				//choose what to build
				var feature = Math.random() * 100;
				if(feature <= room_percentage){
					var room = makeRoom((new_x+mod_x), (new_y+mod_y), 6, 6, valid_tile, dungeon_width, dungeon_height);
					if(room != false){
						current_features++; //add to quota
						tile_data[new_x][new_y].value = constants.DOOR; //mark the wall opening with a door
						tile_data[new_x+mod_x][new_y+mod_y].value = constants.FLOOR; //clean up in front of a door so it's reachable
						dungeon_features.push(room); 
					}
				}else if(feature >= corridor_percentage){
					var corridor = makeCorridor((new_x+mod_x), (new_y+mod_y), 6, valid_tile, dungeon_width, dungeon_height);
					if(corridor != false){
						current_features++;
						tile_data[new_x][new_y].value = constants.DOOR;
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
				if(!validateCorridor(corridor, tile_data, dungeon_width, dungeon_height)){
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
				tile_data[x][y].value = constants.STAIR_DOWN;
				break;
			}
		}
		
		instance.tile_data = tile_data;
		
		console.log("Done");
		
		return {
			player_x: Math.round(initial_room.left + initial_room.width/2),
			player_y: Math.round(initial_room.top + initial_room.height/2),
			tile_data: tile_data
		};
	}
	
	this.makeRoom = function(x, y, room_width, room_height, direction, dungeon_width, dungeon_height, tile_data){
		room_width = parseInt(Math.random() * room_width + 4);
		room_height = parseInt(Math.random() * room_height + 4);
		
		var temp_x = 0,
				temp_y = 0;
		var room = {type:'room',top:0, left:0, width:0, height:0};
				
		var NORTH = constants.NORTH;
		var SOUTH = constants.SOUTH;
		var EAST = constants.EAST;
		var WEST = constants.WEST;
		
		var WALL = constants.WALL;
		var FLOOR = constants.FLOOR;
		var EARTH = constants.EARTH;		
				
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
	
	var makeCorridor = function(x,y, length, direction, dungeon_width, dungeon_height){
		length = parseInt(Math.random() * length + 2);
		
		var temp_x = 0,
				temp_y = 0;
		var corridor = {type:'corridor',
									  top:0, 
									  left:0, 
									  width:0, 
									  height:0};
		var NORTH = constants.NORTH;
		var SOUTH = constants.SOUTH;
		var EAST = constants.EAST;
		var WEST = constants.WEST;
		
		var WALL = constants.WALL;
		var FLOOR = constants.FLOOR;
		var EARTH = constants.EARTH;							  
				
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

	var validateCorridor = function(corridor, tile_data, dungeon_width, dungeon_height){
		var start_x = corridor.left;
		var start_y = corridor.top;
		var end_x = corridor.left + corridor.width;
		var end_y = corridor.top + corridor.height;
		//console.log("Start: " + start_x + "," + start_y + " : End: " + end_x + ", " + end_y + " Facing: " + corridor.facing);
		//console.log("Neighbor: " + getNumInValidNeighbors(start_x,start_y) + " : " + getNumInValidNeighbors(end_x, end_y));
		if(getNumInValidNeighbors(start_x, start_y, tile_data, dungeon_width, dungeon_height) == 3 || getNumInValidNeighbors(end_x, end_y, tile_data, dungeon_width, dungeon_height) == 3){
			//console.log("REMOVE ME");
			for(var x = start_x; x <= end_x; x++){
				for(var y = start_y; y <= end_y; y++){
					if(tile_data[x][y].value == constants.CORRIDOR)
						tile_data[x][y].value = constants.EARTH;
					else if(tile_data[x][y].value == constants.DOOR){
						tile_data[x][y].value = constants.WALL;
					}						
				}
			}
			return false;
		}
		return true;
	}
	
	var getNumInValidNeighbors = function(x, y, tile_data, dungeon_width, dungeon_height){
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
