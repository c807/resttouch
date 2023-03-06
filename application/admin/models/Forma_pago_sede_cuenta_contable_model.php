<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Forma_pago_sede_cuenta_contable_model extends General_model
{
    public $forma_pago_sede_cuenta_contable;
    public $forma_pago;
    public $sede;
    public $cuenta_contable;

    public function __construct($id = "")
    {
        parent::__construct();
        $this->setTabla("forma_pago_sede_cuenta_contable");

        if (!empty($id)) {
            $this->cargar($id);
        }        
    }
}