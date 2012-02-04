function RogueEngine(tileMap, player_data, enemy_data){
	var instance = this;
	
	this.tile_width = 16;
	this.tile_height = 16;
	this.dungeon_width = 30;
	this.dungeon_height = 30;
	
	this.tileMap = tileMap;
	this.player_data = player_data;
	
	this.enemy_data = enemy_data;
	
	this.dialogs = new Dialogs();
	this.tweeter = new Tweet();
	
	this.dungeonGenerator = new DungeonGenerator();
	this.itemGenerator = new ItemGenerator();
	this.enemyGenerator = new EnemyGenerator();
	
	
	this.attackPlayer = function(enemy, callback){
		console.log("Enemy Strength: " + enemy.strength + " Player HP: " + player_data.hp);
		var player_data = instance.player_data;
		var dialogs = instance.dialogs;
		var tweeter = instance.tweeter;
		
		player_data.hp -= enemy.strength;
		
		var story = dialogs.getHurtStory(enemy.name, enemy.strength, enemy.type);
		var type = 'hurt';
		
		if(player_data.hp <= 0){
			story = dialogs.getDieStory(enemy.name, enemy.type);
			type = 'die';
			tweeter.tweet("Dead. At Lvl " + player_data.level + ". Killed by a " + enemy.name + ".");
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
			instance.levelUp();
		}
	};
	
	this.levelUP = function(){
		var player_data = instance.player_data;
		player_data.level += 1;
		player_data.strength += 1;
		player_data.max_hp += 5;
		player_data.evasion += 1;
		player_data.hp = player_data.max_hp;
	};
	
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
					if(enemy.hasMoved == false && enemy.isInRange(player_x, player_y, isVisionBlocker)){
						if(enemy.inLethalRange(player_x,player_y)){
							enemy.hasMoved = true;
							//you can hide behind the door
							if(!instance.isDoor(player_x,player_y))
								instance.attackPlayer(enemy);
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
		tile_data = dungeon_data.tile_data;
		player_data.x = dungeon_data.player_x;
		player_data.y = dungeon_data.player_y;
		
		instance.updateVision(player_data.x, player_data.y);
		
		tile_data[player_data.x][player_data.y].value = constants.STAIR_UP;	
		
		console.log("Total Dungeon Features: " + dungeon_features.length);
		//populate items
		itemGenerator.populateObjects();
		enemyGenerator.populateEnemies();
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
		
		if(tile_data[grid_x][grid_y].isVisible && pickable_data[grid_x][grid_y] != undefined){
			return true;
		}
		return false;
	}
	
	this.isEnemyVisible = function(enemy){
		var tile_data = instance.tile_data;
		var enemy_data = instance.enemy_data;
		
		var grid_x = enemy.x / instance.tile_width;
		var grid_y = enemy.y / instance.tile_width;
		if(tile_data[grid_x][grid_y].isVisible && enemy_data[grid_x][grid_y] != undefined){
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
		var isVisionBlocker = instance.isVisionBlocker;
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
}
