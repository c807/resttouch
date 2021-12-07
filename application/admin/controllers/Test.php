<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Test extends CI_Controller
{
    public function __construct()
    {
        $method = $_SERVER['REQUEST_METHOD'];
        if ($method == "OPTIONS") {
            die();
        }

        parent::__construct();
        $this->output->set_content_type("application/json", "UTF-8");
    }

    public function test() {
        $this->output->set_output(json_encode($_SERVER));        
    }
}
