<?php

if (!defined('BASEPATH')) exit('No direct script access allowed');

class DatabaseHook
{
    public function switchDatabase()
    {
        // $this->ci = &get_instance();
        // if (!is_null($this->ci)) {
        //     // $this->ci->load->helper(['jwt', 'authorization']);
        //     include_once(APPPATH.'helpers/jwt_helper.php');
        //     include_once(APPPATH.'helpers/authorization_helper.php');
    
        //     $esVesuvio = false;
        //     $credenciales = json_decode(file_get_contents('php://input'), true);
        //     if (isset($credenciales['usr'])) {
        //         $datosDominio = explode('@', $credenciales['usr']);
        //         if (count($datosDominio) === 2) {
        //             if (strcasecmp('vesuvio', $datosDominio[1]) == 0) {
        //                 $esVesuvio = true;
        //             }
        //         }
        //     } else {
        //         $headers = $this->ci->input->request_headers();
        //         if (array_key_exists('Authorization', $headers)) {
        //             $token = $headers['Authorization'];
        //             try {
        //                 $data = AUTHORIZATION::validateToken($token);
        //                 if ($data && isset($data->dominio) && strcasecmp('vesuvio', $data->dominio) == 0) {
        //                     $esVesuvio = true;
        //                 }
        //             } catch (Exception $e) {
        //             }
        //         }
        //     }
    
        //     if ($esVesuvio) {
        //         include(APPPATH . 'config/database.php');
        //         $this->ci->db->close();
        //         $this->ci->db = null;
        //         $this->ci->load->database($db['vesuvio'], TRUE);
        //     }
        // }
    }
}
