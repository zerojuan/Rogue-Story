function ItemGenerator(obj_sheet, tile_width, tile_height){
	var instance = this;
	
	this.tile_width = tile_width;
	this.tile_height = tile_height;
	this.obj_sheet = obj_sheet;
	this.pickable_data = {};
	
	this.populateObjects = function(dungeon_width, dungeon_height, level_data){
		var pickable_map = new jaws.SpriteList();
		var obj_sheet = instance.obj_sheet;
		var dungeon_features = level_data.dungeon_features;
		var tile_data = level_data.tile_data;
		var obj_count = 0;
		var pickable_data = new Array(dungeon_width);
		var possible_items = 100;
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
					if(pickable_data[item_x][item_y] == undefined && tile_data[item_x][item_y].value == constants.FLOOR){
						var sprite = new jaws.Sprite({x:item_x*instance.tile_width, y:item_y*instance.tile_height, anchor:"top_left"});
						sprite.setImage(obj_sheet.frames[constants.CHEST]);
						pickable_map.push(sprite);
						pickable_data[item_x][item_y] = {item_data:{}, isCovered:true,sprite:sprite};
						obj_count++;
					}
				}
				if(obj_count >= possible_items) break;
			}
		}
		instance.pickable_map = pickable_map;
		instance.pickable_data = pickable_data;
	};
	
	instance.generateItem = function(x,y){
		var dice = Math.random() * 100;
		var pickable_data = instance.pickable_data;
		var obj_sheet = instance.object_sheet;
		if(dice <= 50){
					//TODO: Holy crap it's an enemy
					delete pickable_data[x][y];
					console.log("Uncovered an enemy");
		}else{
					var dice_rarity = Math.random() * 100;
					if(dice_rarity <= 30){ //object rarity rate
						//produce rare object
						pickable_data[x][y].sprite.setImage(obj_sheet.frames[constants.WEAPON_COMMON]);
					}else{
						//produce ordinary object
						pickable_data[x][y].sprite.setImage(obj_sheet.frames[constants.WEAPON_RARE]);
					}
		}
	};
}
