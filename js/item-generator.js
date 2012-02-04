function ItemGenerator(){
	
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
	};
	
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
	};
}
