<?php
defined('BASEPATH') OR exit('No direct script access allowed');
/* ./cloud_sql_proxy -instances="restouch:us-central1:restadmin"=tcp:3306 */

$active_group = 'default';
$query_builder = TRUE;

$db['default'] = array(
	'dsn'	=> '',
	'dbdriver' => 'mysqli',
	'dbprefix' => '',
	'pconnect' => FALSE,
	'db_debug' => (ENVIRONMENT !== 'production'),
	'cache_on' => FALSE,
	'cachedir' => '',
	'char_set' => 'utf8',
	'dbcollat' => 'utf8_general_ci',
	'swap_pre' => '',
	'encrypt' => FALSE,
	'compress' => FALSE,
	'stricton' => FALSE,
	'failover' => array(),
	'save_queries' => TRUE
);

if (isset($_SERVER["GAE_APPLICATION"])) {
	/* PRODUCCIÓN */
	$db['default']['hostname'] = '/cloudsql/restouch:us-central1:administracion';
	$db['default']['username'] = 'root';
	$db['default']['password'] = 'xIrs4ECzrcp6wnHF';
	$db['default']['database'] = 'administracion';
} else {
	/* LOCAL */
	$db['default']['hostname'] = '127.0.0.1';
	$db['default']['username'] = 'root';
	$db['default']['password'] = 'PoChoco2016';
	$db['default']['database'] = 'administracion';



	//192.168.18.240
    //username devdm
    //password za9Cjq43jXqp
	/* DEV */
	// $db['default']['hostname'] = '192.168.18.240';
	// $db['default']['username'] = 'devja';
	// $db['default']['password'] = 'D3vJA2020!';
	// $db['default']['database'] = 'administracion';
}
