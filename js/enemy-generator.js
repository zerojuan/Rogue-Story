function EnemyGenerator(){
	var instance = this;
	
	var populateEnemies = function(){
		instance.enemy_map = new jaws.SpriteList();
		var obj_count = 0;
		enemy_data = new Array(dungeon_width);
		for(var col = 0; col < dungeon_width; col++){
			enemy_data[col] = new Array(dungeon_height);
			for(var row=0; row < dungeon_height; row++){
				enemy_data[col][row] = undefined;
			}
		}
		for(i in dungeon_features){
			if(dungeon_features[i].type == 'room'){
				var room = dungeon_features[i];
				var num_items = Math.random() * 20 - 5;
				for(var item_count = 0; item_count < num_items; item_count++){
					var sub_x = Math.round(Math.random() * (room.width-1));
					var sub_y = Math.round(Math.random() * (room.height-1));
					var item_x = (room.left+1) + sub_x-1;
					var item_y = (room.top+1) + sub_y-1;
					if(enemy_data[item_x][item_y] == undefined && tile_data[item_x][item_y].value == FLOOR){
						var enemy_type;
						var enemy_level;
						var depth_mod = depth % 3;
						if(area == 0){
							enemy_type = Enemy.GOBLINS;
							if(depth_mod == 0){
								var dice = Math.random() * 100;
								if(dice >= 60){
									enemy_level = 2;
								}else{
									enemy_level = 1;
								}
							}else if(depth_mod == 1){
								var dice = Math.random() * 100;
								if(dice >= 60){
									enemy_level = 3;
								}else{
									enemy_level = 2;
								}
							}else if(depth_mod == 2){
								var dice = Math.random() * 100;
								if(dice >= 80){
									enemy_level = 3;
								}else if(dice >= 50){
									enemy_level = 2;
								}else{
									enemy_level = 1;
									enemy_type = Enemy.GHOSTS;
								}
							}
						}else if(area == 1){
							enemy_type = Enemy.GHOSTS;
							if(depth_mod == 0){
								var dice = Math.random() * 100;
								if(dice >= 60){
									enemy_level = 2;
								}else{
									enemy_level = 1;
								}
							}else if(depth_mod == 1){
								var dice = Math.random() * 100;
								if(dice >= 60){
									enemy_level = 3;
								}else{
									enemy_level = 2;
								}
							}else if(depth_mod == 2){
								var dice = Math.random() * 100;
								if(dice >= 80){
									enemy_level = 3;
								}else if(dice >= 50){
									enemy_level = 2;
								}else{
									enemy_level = 1;
									enemy_type = Enemy.BONES;
								}
							}
						}else if(area == 2){
							enemy_type = Enemy.BONES;
							if(depth_mod == 0){
								var dice = Math.random() * 100;
								if(dice >= 60){
									enemy_level = 2;
								}else{
									enemy_level = 1;
								}
							}else if(depth_mod == 1){
								var dice = Math.random() * 100;
								if(dice >= 60){
									enemy_level = 3;
								}else{
									enemy_level = 2;
								}
							}else if(depth_mod == 2){
								var dice = Math.random() * 100;
								if(dice >= 80){
									enemy_level = 3;
								}else if(dice >= 50){
									enemy_level = 2;
								}else{
									enemy_level = 1;
									enemy_type = Enemy.DEMONS;
								}
							}
						}else if(area == 3){
							enemy_type = Enemy.DEMONS;
							if(depth_mod == 0){
								var dice = Math.random() * 100;
								if(dice >= 60){
									enemy_level = 2;
								}else{
									enemy_level = 1;
								}
							}else if(depth_mod == 1){
								var dice = Math.random() * 100;
								if(dice >= 60){
									enemy_level = 3;
								}else{
									enemy_level = 2;
								}
							}else if(depth_mod == 2){
								var dice = Math.random() * 100;
								if(dice >= 80){
									enemy_level = 3;
								}else if(dice >= 50){
									enemy_level = 2;
								}else{
									enemy_level = 1;
									enemy_type = Enemy.GOBLINS;
								}
							}
						}
						
						var enemy = new Enemy(item_x, item_y,enemy_level,enemy_type, enemy_sheet);
						enemy_map.push(enemy.sprite);
						enemy_data[item_x][item_y] = enemy;
						obj_count++;
					}
				}
				if(obj_count >= possible_items) break;
			}
		}
		console.log("Total enemies: " + obj_count);
		console.log("Enemies: " + enemy_map.length);
	}
}
