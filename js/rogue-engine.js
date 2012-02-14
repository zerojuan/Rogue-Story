function RogueEngine(tile_data, player_data, enemy_data, enemy_map, obj_sheet, enemy_sheet, appendLog, updateHUD){
	var instance = this;
	
	this.tile_width = 16;
	this.tile_height = 16;
	this.dungeon_width = 30;
	this.dungeon_height = 30;
	
	this.tile_data = tile_data;
	this.player_data = player_data;
	
	this.enemy_map = enemy_map;
	this.enemy_data = enemy_data;
	
	this.dialogs = new Dialogs();
	this.tweeter = new Tweet();
	
	this.dungeonGenerator = new DungeonGenerator();
	this.itemGenerator = new ItemGenerator(obj_sheet, this.tile_width, this.tile_height);
	this.enemyGenerator = new EnemyGenerator(enemy_sheet);
	
	this.appendLog = appendLog;
	this.updateHUD = updateHUD;
	
	this.attackPlayer = function(enemy, callback){
		var player_data = instance.player_data;
		var dialogs = instance.dialogs;
		var tweeter = instance.tweeter;
		
		console.log("Enemy Strength: " + enemy.strength + " Player HP: " + player_data.hp);
		
		player_data.hp -= enemy.strength;
		
		var story = dialogs.getHurtStory(enemy.name, enemy.strength, enemy.type);
		var type = 'hurt';
		
		if(player_data.hp <= 0){
			story = dialogs.getDieStory(enemy.name, enemy.type);
			type = 'die';
			//tweeter.tweet("Dead. At Lvl " + player_data.level + ". Killed by a " + enemy.name + ".");
			instance.updateHUD({hp: player_data.hp});
		}else{
			instance.updateHUD({hp: player_data.hp});
		}
		enemy.hasMoved = true;
		callback({"story":story, 'type': type});
	};
	
	this.attackEnemy = function(x,y, callback){
		var player_data = instance.player_data;
		var enemy_data = instance.enemy_data;
		var dialogs = instance.dialogs;
		var enemy = enemy_data[x][y];
		
		var story = '';
		var type = 'attack';
		
		console.log("Player Strength: " + player_data.strength + " Enemy HP: " + enemy.hp);
		enemy.hp -= player_data.strength;
		console.log("Enemy Health: " + enemy.hp);
		story = dialogs.getAttackStory(enemy.name, player_data.strength, enemy.type);
		if(enemy.hp <= 0){
			instance.addXP(enemy.xpDrop);
    		enemy_data[x][y] = undefined;
    		story = dialogs.getKillStory(enemy.name, enemy.type);
    		type = 'kill';
		}
		callback({"story":story, "type":type});
	};
	
	this.addXP = function(xp){
		var player_data = instance.player_data;
		player_data.xpNow += xp;
		if(player_data.xpNow >= player_data.xpNextLevel){
			player_data.xpNow = player_data.xpNow - player_data.xpNextLevel;
			instance.levelUP();
		}else{
			instance.updateHUD({xp: player_data.xpNow + ' / ' + player_data.xpNextLevel});
		}
	};
	
	this.levelUP = function(){
		var player_data = instance.player_data;
		player_data.level += 1;
		player_data.strength += 1;
		player_data.max_hp += 5;
		player_data.evasion += 1;
		player_data.hp = player_data.max_hp;
		instance.updateHUD({hp: player_data.hp, xp: player_data.xpNow + ' / '+player_data.xpNextLevel, level: player_data.level});
	};
	
	var onAttackedPlayer = function(result){
		instance.appendLog(result.story, result.type);	
	}
	
	this.computeEnemyMove = function(player_x, player_y){
		var enemy_data = instance.enemy_data;
		
		//only compute enemies within a 10 cell radius of the player
		var top = (player_y - 5) < 0 ? 0 : player_y - 5;
		var left = (player_x - 5) < 0 ? 0 : player_x - 5;
		var bottom = (player_y + 5) >= instance.dungeon_height ? instance.dungeon_height-1 : player_y + 5;
		var right = (player_x + 5) >= instance.dungeon_width ? instance.dungeon_width-1 : player_x + 5;
		
		for(var col = left; col <= right; col++){
			for(var row = top; row <= bottom; row++){
				if(enemy_data[col][row] != undefined){
					var enemy = enemy_data[col][row];
					if(enemy.hasMoved == false && enemy.isInRange(player_x, player_y, instance.isVisionBlocker)){
						if(enemy.inLethalRange(player_x,player_y)){
							enemy.hasMoved = true;
							//you can hide behind the door
							if(!instance.isDoor(player_x,player_y))
								instance.attackPlayer(enemy, onAttackedPlayer);
						}else{
							console.log("I can see you");
							var mod_x = 0;
							var mod_y = 0;
							if(player_x - enemy.x > 0){
								mod_x = 1;
							}else if(player_x - enemy.x < 0){
								mod_x = -1;
							}
							
							if(player_y - enemy.y > 0){
								mod_y = 1;
							}else if(player_x - enemy.y < 0){
								mod_y = -1;
							}
							
							//try moving x-wise
							if(instance.isPassable(enemy.x + mod_x, enemy.y)){
								if(enemy_data[enemy.x + mod_x][ enemy.y] == undefined){									
									delete enemy_data[enemy.x][enemy.y];				
									console.log("Before: Enemy: " + enemy.x + ", " + enemy.y + " Player is at: " + player_x + "," + player_y);					
									enemy.move(enemy.x+mod_x, enemy.y);
									enemy_data[enemy.x][enemy.y] = enemy;
									enemy.hasMoved = true;
									console.log("Enemy: " + enemy.x + ", " + enemy.y + " Player is at: " + player_x + "," + player_y);
								}
							}
							
							if(!enemy.hasMoved){
								if(instance.isPassable(enemy.x, enemy.y + mod_y)){
									if(enemy_data[enemy.x][enemy.y + mod_y] == undefined){
										delete enemy_data[enemy.x][enemy.y];
										console.log("Before: Enemy: " + enemy.x + ", " + enemy.y + " Player is at: " + player_x + "," + player_y);
										enemy.move(enemy.x, enemy.y + mod_y);
										enemy_data[enemy.x][enemy.y] = enemy;
										enemy.hasMoved = true;
										console.log("Enemy: " + enemy.x + ", " + enemy.y + " Player is at: " + player_x + "," + player_y);										
									}
								}
							}
						}
					}
				}
			}
		}
		
		for(var col = left; col <= right; col++){
			for(var row = top; row <= bottom; row++){
					if(enemy_data[col][row] != undefined){
						enemy_data[col][row].hasMoved = false;
					}
			}
		}		
	}
	
	this.doAction = function(x, y){
		if(instance.isDoorOpen(x,y)){
			instance.closeDoor(x,y);
		}else if(instance.isItem(x,y)){
			instance.pickable_data[x][y] = undefined;
			console.log("Oh look, shiny!");
		}
	}
	
	this.depth = 0;
	this.area = 0;
	this.goDeeper = function(){
		var depth = instance.depth;
		var area = instance.area;
		var dungeonGenerator = instance.dungeonGenerator;
		var player_data = instance.player_data;
		var tile_data = instance.tile_data;
		var dungeon_width = instance.dungeon_width;
		var dungeon_height = instance.dungeon_height;
		var enemy_map = instance.enemy_map;
		var enemyGenerator = instance.enemyGenerator;
		var itemGenerator = instance.itemGenerator;
		
		//generate map
		depth += 1;
		if(depth % 3 == 0){
			area += 1;
			if(area > 3){
				depth = 0;
				area = 0;
			}
		}
		
		var dungeon_data = dungeonGenerator.generateMap(instance.dungeon_width, instance.dungeon_height);
		tile_data = dungeonGenerator.tile_data;
		player_data.x = dungeon_data.player_x;
		player_data.y = dungeon_data.player_y;
		
		tile_data[player_data.x][player_data.y].value = constants.STAIR_UP;	
		instance.tile_data = tile_data;
		
		instance.updateVision(player_data.x, player_data.y);
		
		console.log("Total Dungeon Features: " + dungeonGenerator.dungeon_features.length);
		//populate items
		itemGenerator.populateObjects(dungeon_width, dungeon_height, {tile_data: tile_data, dungeon_features: dungeonGenerator.dungeon_features});
		enemyGenerator.populateEnemies(dungeon_width, dungeon_height, enemy_map, {tile_data: tile_data, dungeon_features: dungeonGenerator.dungeon_features, area: area, depth: depth});
		
		instance.enemy_data = enemyGenerator.enemy_data;
		instance.pickable_data = itemGenerator.pickable_data;
		
		instance.area = area;
		instance.depth = depth;
	}
	
	this.isPassable = function(x, y){
		var tile_data = instance.tile_data;
		if(tile_data[x][y].value == constants.WALL ||
			tile_data[x][y].value == constants.EARTH){
				return false;
			}
		return true;
	}
	
	this.isVisionBlocker = function(x,y){
		var tile_data = instance.tile_data;
		if(tile_data[x][y].value == constants.WALL ||
				tile_data[x][y].value == constants.DOOR ||
				tile_data[x][y].value == constants.EARTH){
				return true;
		}
		return false;
	}
	
	this.isObjVisible = function(item){
		var tile_data = instance.tile_data;
		var pickable_data = instance.pickable_data;
		
		var grid_x = item.x/instance.tile_width;
		var grid_y = item.y/instance.tile_height;
		
		if(tile_data[grid_x][grid_y].visiblity == constants.VISIBLE && pickable_data[grid_x][grid_y] != undefined){
			return true;
		}
		return false;
	}
	
	this.isEnemyVisible = function(enemy){
		var tile_data = instance.tile_data;
		var enemy_data = instance.enemy_data;
		
		var grid_x = enemy.x / instance.tile_width;
		var grid_y = enemy.y / instance.tile_width;
		if(tile_data[grid_x][grid_y].visibility == constants.VISIBLE && enemy_data[grid_x][grid_y] != undefined){
			return true;
		}
		
		return false;
	}
	
	this.isExit = function(x,y){
		return instance.tile_data[x][y].value == constants.STAIR_DOWN;
	}
	
	this.isDoor = function(x,y){
		return instance.tile_data[x][y].value == constants.DOOR;
	}
	
	this.isDoorOpen = function(x,y){
		return instance.tile_data[x][y].value == constants.DOOR_OPEN;
	}
	
	this.openDoor = function(x,y){
		instance.tile_data[x][y].value = constants.DOOR_OPEN;
	}
	
	this.closeDoor = function(x,y){
		instance.tile_data[x][y].value = constants.DOOR;
	}
	
	this.isChest = function(x,y){
		if(instance.pickable_data[x][y] != undefined && instance.pickable_data[x][y].isCovered){
			return true;
		}
		return false;
	}
	
	this.isItem = function(x,y){
		if(instance.pickable_data[x][y] != undefined && !instance.pickable_data[x][y].isCovered){
			return true;
		}
		return false;
	}
	
	this.isEnemy = function(x,y){
		if(instance.enemy_data[x][y] != undefined){
			return true;
		}
		return false;
	}
	
	this.openChest = function(x,y){
		instance.pickable_data[x][y].isCovered = false;
		//generate item
		instance.itemGenerator.generateItem(x,y);
	}
	
	this.updateVision = function(x,y){
		var tile_data = instance.tile_data;
		
		//every visible thing is now fogged
		tile_data = instance.refreshVision(tile_data);

		for(var i=1;i<360;i++){
		    theta_x=Math.cos(i);
		    theta_y=Math.sin(i);
		    instance.castRay(tile_data, theta_x, theta_y, x, y);
		}
	}
	
	this.castRay = function(tile_data, theta_x, theta_y, player_x, player_y){
		var view_radius = 4;
		var ray;
		var ox,oy;
			ox = player_x;
			oy = player_y;
		var isVisionBlocker = instance.isVisionBlocker;
		console.log("Player is at " + player_x + ", " + player_y);
		for(ray=0;ray<view_radius;ray++){
			var tile_x = Math.round(ox);
			var tile_y = Math.round(oy);
			console.log("Ray cast " + ray + ": " + tile_x + ", " + tile_y);
			tile_data[tile_x][tile_y].visibility = constants.VISIBLE;//Set the tile to visible.
			if(isVisionBlocker(tile_x,tile_y))
			      return;
			ox+=theta_x;
			oy+=theta_y;
		}
	}
	
	this.refreshVision = function(tile_data){
		for(var col = 0; col < instance.dungeon_width; col++){
			for(var row = 0; row < instance.dungeon_height; row++){
					if(tile_data[col][row].visibility == constants.VISIBLE){
						tile_data[col][row].visibility = constants.FOG;
					}
			}
		}
		return tile_data;
	}
}
