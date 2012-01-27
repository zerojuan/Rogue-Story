/**
 * Play State
 */


function PlayState(){
	var play_state = this;
	
	//player position
	var player_coord = {x: 0, y: 0};
	
	var room_features;
	
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
	
	//environment constants 
	
	//===== PICKABLE TYPES ======//
	var WEAPON = 0,
			ARMOR = 1,
			ITEM = 2;
	
	var NORTH = 0,
			SOUTH = 1;
			EAST = 2;
			WEST = 3;
	
	this.setup = function(){
		//initialize spritesheets
		
		//initialize tile map
		
		//generate map
		
		//initialize player sprite position
		
		//add key event listener
	};
	
	this.update = function(){
		
	};
	
	this.draw = function(){
		//render tilemap
		//render object map
		//render enemy map
		//render player
	};
	
	var onPressedTurn = function(key){
		//capture directional keys, detect collisions
		//detect attack
		//detect item move
		//move the rest of the world
	}
	
	var generateMap = function(){
		
	}
	
	var renderMap = function(){
		//loop through tile data, draw only explored areas
	}
	
	var renderItems = function(){
		//loop through item_list
	}
	
	var renderEnemies = function(){
		//loop through enemy_list draw only enemies around my radius
	}
	
	var makeRoom = function(x,y,room_width, direction){
		//return room
		//return null
	}
	
	var makeCorridor = function(x,y, length, direction){
		//return room
		//return null
	}
}
