
function Enemy(x,y,level,type,sprite_sheet){
	//ENEMY TYPES
	
	var enemy_ = this;
	
	this.name;
	this.strength = 10;
	this.hp = 10;
	this.armor = 10;
	this.evasion = 10;
	this.courage = 10;
	this.xpDrop = 10;
	this.vision = Enemy.ADVANCED_VISION;
	
	this.sprite;
	
	this.type = type;
	
	this.hasMoved = false;
	
	this.x = x;
	this.y = y;

	var generateBones = function(level){
		var SEED = 16 + level;
		if(level == 1){
			enemy_.armor = 15;
			enemy_.evasion = 10;
			enemy_.xpDrop = 10;
			enemy_.hp = 10;
			enemy_.strength = 5;
			enemy_.vision = Enemy.ADVANCED_VISION;
			enemy_.name = "Skeletony";
		}else if(level == 2){
			enemy_.armor = 10;
			enemy_.evasion = 25;
			enemy_.xpDrop = 20;
			enemy_.hp = 15;
			enemy_.strength = 7;
			enemy_.vision = Enemy.DIAGONAL_VISION;
			enemy_.name = "Bone Thug";
		}else if(level == 3){
			enemy_.armor = 10;
			enemy_.evasion = 30;
			enemy_.xpDrop = 40;
			enemy_.hp = 15;
			enemy_.strength = 10;
			enemy_.vision = Enemy.NORMAL_VISION;
			enemy_.name = "Gangs T Bone";
		}
		//highly effective when using blunt weapons
		enemy_.sprite = new jaws.Sprite({x:enemy_.x*16, y:enemy_.y*16, anchor:"top_left"});
		enemy_.sprite.setImage(sprite_sheet.frames[SEED]);
	};
	
	var generateGoblins = function(level){
		var SEED = 0 + level;
		//normal type
		if(level == 1){
			enemy_.armor = 15;
			enemy_.evasion = 10;
			enemy_.xpDrop = 10;
			enemy_.hp = 10;
			enemy_.strength = 5;
			enemy_.vision = Enemy.ADVANCED_VISION;
			enemy_.name = "Goblin Hobo";
		}else if(level == 2){
			enemy_.armor = 10;
			enemy_.evasion = 25;
			enemy_.xpDrop = 20;
			enemy_.hp = 15;
			enemy_.strength = 7;
			enemy_.vision = Enemy.DIAGONAL_VISION;
			enemy_.name = "Goblin-4-Hire";
		}else if(level == 3){
			enemy_.armor = 10;
			enemy_.evasion = 30;
			enemy_.xpDrop = 40;
			enemy_.hp = 15;
			enemy_.strength = 10;
			enemy_.vision = Enemy.NORMAL_VISION;
			enemy_.name = "Professional Goblin";
		}
		enemy_.sprite = new jaws.Sprite({x:enemy_.x*16, y:enemy_.y*16, anchor:"top_left"});
		enemy_.sprite.setImage(sprite_sheet.frames[SEED]);
	};
	
	var generateGhosts = function(level){
		var SEED = 16*2 + 6 + level;
		//highly evasive
		if(level == 1){
			enemy_.armor = 15;
			enemy_.evasion = 10;
			enemy_.xpDrop = 10;
			enemy_.hp = 10;
			enemy_.strength = 5;
			enemy_.vision = Enemy.ADVANCED_VISION;
			enemy_.name = "Boo";
		}else if(level == 2){
			enemy_.armor = 10;
			enemy_.evasion = 25;
			enemy_.xpDrop = 20;
			enemy_.hp = 15;
			enemy_.strength = 7;
			enemy_.vision = Enemy.DIAGONAL_VISION;
			enemy_.name = "Aiiiieee";
		}else if(level == 3){
			enemy_.armor = 10;
			enemy_.evasion = 30;
			enemy_.xpDrop = 40;
			enemy_.hp = 15;
			enemy_.strength = 10;
			enemy_.vision = Enemy.NORMAL_VISION;
			enemy_.name = "Awoooo";
		}
		enemy_.sprite = new jaws.Sprite({x:enemy_.x*16, y:enemy_.y*16, anchor:"top_left"});
		enemy_.sprite.setImage(sprite_sheet.frames[SEED]);
	};
	
	var generateCats = function(level){
		//cats just follow you around
	};
	
	var generateSnakes = function(level){
		//snakes run away from you
	};
	
	var generateDemons = function(level){
		var SEED = 16*4 + level;
		//tough on armor
		if(level == 1){
			enemy_.armor = 15;
			enemy_.evasion = 10;
			enemy_.xpDrop = 10;
			enemy_.hp = 10;
			enemy_.strength = 5;
			enemy_.vision = Enemy.ADVANCED_VISION;
			enemy_.name = "Monyo";
		}else if(level == 2){
			enemy_.armor = 10;
			enemy_.evasion = 25;
			enemy_.xpDrop = 20;
			enemy_.hp = 15;
			enemy_.strength = 7;
			enemy_.vision = Enemy.DIAGONAL_VISION;
			enemy_.name = "White Monyo";
		}else if(level == 3){
			enemy_.armor = 10;
			enemy_.evasion = 30;
			enemy_.xpDrop = 40;
			enemy_.hp = 15;
			enemy_.strength = 10;
			enemy_.vision = Enemy.NORMAL_VISION;
			enemy_.name = "Demonion";
		}
		enemy_.sprite = new jaws.Sprite({x:enemy_.x*16, y:enemy_.y*16, anchor:"top_left"});
		enemy_.sprite.setImage(sprite_sheet.frames[SEED]);
	};
	
	this.isInRange = function(player_x,player_y, isVisionBlocker){
		
		for(var i=1;i<360;i++){
		    theta_x=Math.cos(i);
		    theta_y=Math.sin(i);
		    if(enemy_.castRay(theta_x, theta_y, enemy_.x, enemy_.y, player_x, player_y, isVisionBlocker)){
		    	return true;
		    }
		}
		
		return false;
	}
	
	this.castRay = function(theta_x, theta_y, x, y, player_x, player_y, isVisionBlocker){
		var view_radius = 4;
		var ray;
		var ox,oy;
			ox = x;
			oy = y;
		console.log("Player is at " + player_x + ", " + player_y);
		for(ray=0;ray<view_radius;ray++){
			var tile_x = Math.round(ox);
			var tile_y = Math.round(oy);
			if(isVisionBlocker(tile_x,tile_y)){
				return false;
			} 
			else if(player_x == tile_x && player_y == tile_y){
				return true; //player found!
			}
			ox+=theta_x;
			oy+=theta_y;
		}
	}
	
	this.inLethalRange = function(player_x, player_y){
		if(enemy_.x+1 == player_x && enemy_.y == player_y) return true;
		if(enemy_.x-1 == player_x && enemy_.y == player_y) return true;
		if(enemy_.x == player_x && enemy_.y+1 == player_y) return true;
		if(enemy_.x == player_x && enemy_.y-1 == player_y) return true;
		
		return false;
	}
	
	this.move = function(new_x,new_y){
		enemy_.x = new_x;
		enemy_.y = new_y;
		enemy_.sprite.moveTo(enemy_.x * 16, enemy_.y * 16);
	}
	
	switch(type){
		case Enemy.BONES:
					generateBones(level);
					break;
		case Enemy.GOBLINS:
					generateGoblins(level);
					break;
		case Enemy.GHOSTS:
					generateGhosts(level);
					break;
		case Enemy.CATS:
					generateCats(level);
					break;
		case Enemy.SNAKES:
					generateSnakes(level);
					break;
		case Enemy.DEMONS:
					generateDemons(level);
					break;
	}
}

Enemy.BONES = 0;
Enemy.GOBLINS = 1;
Enemy.GHOST = 2;
Enemy.CATS = 3;
Enemy.SNAKES = 4;
Enemy.DEMONS = 5;
Enemy.NORMAL_VISION = 1;
Enemy.DIAGONAL_VISION = 2;
Enemy.ADVANCED_VISION = 3;
