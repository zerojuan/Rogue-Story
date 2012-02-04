function Tweet(){
	tweet : function(text){
		$.get('tweet.php', { status: text}, function(data) {
  			console.log("Success tweet");
		});
	}
}

function TweetManager(){
	//track the relevant info here
}
