<?php

require_once('twitteroauth/twitteroauth.php');
require_once('config.php');

/* Create a TwitterOauth object with consumer/user tokens. */
$connection = new TwitterOAuth(CONSUMER_KEY, CONSUMER_SECRET, OAUTH_TOKEN, OAUTH_TOKEN_SECRET);

/* If method is set change API call made. Test is called by default. */
$connection->get('account/verify_credentials');

$result  = $connection->post('statuses/update', array('status' => $_GET['status']));

echo $result;