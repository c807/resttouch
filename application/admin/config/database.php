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

$db['vesuvio'] = array(
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

	$db['vesuvio']['hostname'] = '127.0.0.1:6603';
	$db['vesuvio']['username'] = 'root';
	$db['vesuvio']['password'] = 'PoChoco2016';
	$db['vesuvio']['database'] = 'administracion';	
	$db['vesuvio']['port'] = '6603';	
}
