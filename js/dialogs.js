function Dialogs(){
	var instance = this;
	this.name = "<b>Vogue la Rogue</b>";
	
	this.showIntro = function(){
		var str = ["You <b>Vogue la Rogue</b> is go there to kill a many monsters. Go now!",
								"<b>Vogue la Rogue</b>, your adventure starts here.",
								"<b>Vogue la Rogue</b> meet dungeon. Dungeon meet <b>Vogue la Rogue</b>.",
								"The more you kill, the more you please me. And you too, <b>Vogue la Rogue</b>.",
								"... blah blah.. adventure time, Herogue!",
								"Go. Start. Rogue. Like."];
		return str[parseInt(Math.random()*str.length-1)]
	}
	
	this.getAttackStory = function(enemy_name, damage,type){
		enemy_name = "<b>"+enemy_name+"</b>";
		damage = "<b>"+damage+"</b>";
		var str = ["<b>Vogue la Rogue</b> attacks " + enemy_name + " for " + damage + " damage.",
							"What a damage! " + instance.name + " hurts " + enemy_name + " out of " + damage + ".",
							instance.name + " attacks! " + enemy_name + " is hurt."
					];
		return str[parseInt(Math.random()*str.length-1)];
	}
	
	this.getKillStory = function(enemy_name, type){
		enemy_name = "<b>"+enemy_name+"</b>";
		var str = [];
		switch(type){
			case Enemy.BONES:
					str = [enemy_name + " rests in peace.",
								enemy_name + " breaks into tiny bones. And is no longer a threat.",
							];
					break;
			case Enemy.GOBLINS:
					str = [enemy_name + " is now a good goblin. ",
								enemy_name + ": dead goblin."];
					break;
			case Enemy.GHOSTS:
					str = [enemy_name + " goes to purgatory. ",
								enemy_name + " goes to heaven.",
								enemy_name + " will not be bothering us again."];
					break;
			case Enemy.DEMONS:
					str = [enemy_name + " repents. ",
								enemy_name + " goes to heaven.",
								enemy_name + " learns his lesson."];
					break;
		}
		return str[parseInt(Math.random()*str.length-1)];
	}
	
	this.getDieStory = function(enemy_name,type){
		"<b>"+enemy_name+"</b>";
		var str = [];
		switch(type){
			case Enemy.BONES:
					str = ["Killed by " + enemy_name,
								"Dies by the bony hands of " + enemy_name
							];
					break;
			case Enemy.GOBLINS:
					str = [enemy_name + ", a Goblin, kills " + instance.name,
								enemy_name + ": rogue killer."];
					break;
			case Enemy.GHOSTS:
					str = [enemy_name + " sends "+instance.name+" to purgatory. ",
								enemy_name + " sends "+instance.name+" to heaven.",
								enemy_name + " ghost killed you!"];
					break;
			case Enemy.DEMONS:
					str = [enemy_name + " sends "+instance.name+" to hell ",
								enemy_name + ", a demon, killed you.",
								enemy_name + " learns his lesson. He killed " + instance.name];
					break;
		}
		return str[parseInt(Math.random()*str.length-1)];
	}
	
	this.getHurtStory = function(enemy_name, damage, type){
		enemy_name = "<b>"+enemy_name+"</b>";
		damage = "<b>"+damage+"</b>";
		var str = [enemy_name + " hits for " + damage + " damage.",
							enemy_name + " uses mystery move, " + instance.name +" is hurt -" + damage + ".",
							enemy_name + " attacks! " + instance.name + " is hurt."
					];
					
		return str[parseInt(Math.random()*str.length-1)];
	}
}
