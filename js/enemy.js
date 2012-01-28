
function Enemy(x,y,level,type){
	//ENEMY TYPES
	
	var enemy_ = this;
	
	this.strength = 0;
	this.hp = 0;
	this.armor = 0;
	this.evasion = 0;
	
	this.sprite;
	
	this.x = x;
	this.y = y;

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
		case Enemy.GHOSTS:
					generateGhosts(level);
					break;
	}
	
	var generateBones = function(level){
		
	};
	
	var generateGoblins = function(level){
		
	};
	
	var generateGhosts = function(level){
		
	};
	
	var generateCats = function(level){
		
	};
	
	var generateSnakes = function(level){
		
	};
	
	var generateGhosts = function(level){
		
	};
}

Enemy.BONES = 0;
Enemy.GOBLINS = 1;
Enemy.GHOST = 2;
Enemy.CATS = 3;
Enemy.SNAKES = 4;
Enemy.DEMONS = 5;
