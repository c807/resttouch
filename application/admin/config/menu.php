<?php
defined('BASEPATH') or exit('No direct script access allowed');

$config['menu'] = [
	1 => [
		'nombre' => 'ADMIN',
		'dispositivo' => 1,
		'submodulo' => [
			1 => [
				'nombre' => 'Mantenimiento',
				'dispositivo' => 1,
				'opciones' => [
					1 => [
						'nombre' => 'Cliente',
						'link' => '/admin/cliente',
						'dispositivo' => 1
					],
					2 => [
						'nombre' => 'Artículos',
						'link' => '/wms/articulos',
						'dispositivo' => 1
					],
					3 => [
						'nombre' => 'Áreas',
						'link' => '/restaurante/mantareas',
						'dispositivo' => 1
					],
					4 => [
						'nombre' => 'Presentaciones',
						'link' => '/admin/presentacion',
						'dispositivo' => 1
					],
					5 => [
						'nombre' => 'Usuario',
						'link' => '/admin/usuario',
						'dispositivo' => 1
					],
					6 => [
						'nombre' => 'Medidas',
						'link' => '/admin/presentacion',
						'dispositivo' => 1
					],
					7  => [
						'nombre' => 'Impresoras',
						'link' => '/admin/impresora',
						'dispositivo' => 1
					],
					8  => [
						'nombre' => 'Tipo de Usuario',
						'link' => '/admin/tipo_usuario',
						'dispositivo' => 1
					],
					9  => [
						'nombre' => 'Acceso',
						'link' => '/admin/acceso',
						'dispositivo' => 1
					],
					10  => [
						'nombre' => 'Forma de Pago',
						'link' => '/admin/formapago',
						'dispositivo' => 1
					],
					11  => [
						'nombre' => 'Proveedores',
						'link' => '/admin/proveedor',
						'dispositivo' => 1
					],
					12  => [
						'nombre' => 'Impuesto Especial',
						'link' => '/admin/impuesto_especial',
						'dispositivo' => 1
					],
					13 => [
						'nombre' => 'Sede por Usuario',
						'link' => '/admin/usuario_sede',
						'dispositivo' => 1
					],
					14 => [
						'nombre' => 'Configuracion Certificador',
						'link' => '/admin/certificador_admin',
						'dispositivo' => 1
					],
					15 => [
						'nombre' => 'Certificador FEL',
						'link' => '/admin/certificador_fel',
						'dispositivo' => 1
					],
					16 => [
						'nombre' => 'Corporación',
						'link' => '/admin/corporacion',
						'dispositivo' => 1
					],
					17 => [
						'nombre' => 'Razones de anulacion',
						'link' => '/admin/razon_anulacion',
						'dispositivo' => 1
					],
					18 => [
						'nombre' => 'Tipo de compra/venta',
						'link' => '/admin/tipo_compra_venta',
						'dispositivo' => 1
					],
					19 => [
						'nombre' => 'Tipo de documento',
						'link' => '/admin/documento_tipo',
						'dispositivo' => 1
					],
					20 => [
						'nombre' => 'Bodegas',
						'link' => '/admin/bodega',
						'dispositivo' => 1
					],
					21 => [
						'nombre' => 'Edición rápida de artículos',
						'link' => '/wms/qeprod',
						'dispositivo' => 1
					],
					22 => [
						'nombre' => 'Tipo de cliente',
						'link' => '/admin/tipo_cliente',
						'dispositivo' => 1
					],
					23 => [
						'nombre' => 'Tipo de documento de identificación',
						'link' => '/admin/tipo_documento',
						'dispositivo' => 1
					],
					24 => [
						'nombre' => 'Rol de usuario',
						'link' => '/admin/rol_usuario',
						'dispositivo' => 1
					]
				]
			],
			2 => [
				'nombre' => 'Reportes',
				'dispositivo' => 1,
				'opciones' => [
					1 => [
						'nombre' => 'Tablero',
						'link' => '/admin/tablero',
						'dispositivo' => 1
					],
					2 => [
						'nombre' => 'Ventas por categoría',
						'link' => '/restaurante/rptvtascat',
						'dispositivo' => 1
					],
					3 => [
						'nombre' => 'Caja',
						'link' => '/restaurante/rptcaja',
						'dispositivo' => 1
					],
					4 => [
						'nombre' => 'Bitácora',
						'link' => '/admin/rptbitacora',
						'dispositivo' => 1
					]
				]
			],
			3 => [
				'nombre' => 'Transacciones',
				'dispositivo' => 1,
				'opciones' => [
					1 => [
						'nombre' => 'Replicar artículos a sedes',
						'link' => '/wms/replicar_articulos_sedes',
						'dispositivo' => 1
					],
					2 => [
						'nombre' => 'Anular comandas',
<<<<<<< HEAD
						// 'link' => '/restaurante/anulacomanda',
=======
>>>>>>> master
						'link' => '/admin/dashboard',
						'dispositivo' => 1
					]
				]
			]
		]
	],
	2 => [
		'nombre' => 'POS',
		'dispositivo' => 3,
		'submodulo' => [
			1 => [
				'nombre' => 'Transacción',
				'dispositivo' => 3,
				'opciones' => [
					1 => [
						'nombre' => 'Área',
						'link' => '/restaurante/tranareas',
						'dispositivo' => 3
					],
					2 => [
						'nombre' => 'Factura manual',
						'link' => '/pos/factman',
						'dispositivo' => 1
					],
					3 => [
						'nombre' => 'Turno',
						'link' => '/restaurante/turno',
						'dispositivo' => 1
					],
					4 => [
						'nombre' => 'Comanda en línea',
						'link' => '/restaurante/cmdonline',
						'dispositivo' => 1
					],
					6 => [
						'nombre' => 'Cocina',
						'link' => '/restaurante/trancocina',
						'dispositivo' => 1
					],
					7 => [
						'nombre' => 'Migrar facturas a contabilidad',
						'link' => '/pos/factura_migrar',
						'dispositivo' => 1
					]
				]
			],
			2 => [
				'nombre' => 'Reportes',
				'dispositivo' => 1,
				'opciones' => [
					1 => [
						'nombre' => 'Ventas',
						'link' => '/restaurante/rptvtascat',
						'dispositivo' => 1
					],
					2 => [
						'nombre' => 'Turnos',
						'link' => '/restaurante/rptturnos',
						'dispositivo' => 1
					],
					3 => [
						'nombre' => 'Propinas',
						'link' => '/restaurante/rptpropinas',
						'dispositivo' => 1
					],
					4 => [
						'nombre' => 'Caja',
						'link' => '/restaurante/rptcaja',
						'dispositivo' => 1
					],
					5 => [
						'nombre' => 'Factura',
						'link' => '/restaurante/rptfactura',
						'dispositivo' => 1
					],
					6 => [
						'nombre' => 'Autoconsulta',
						'link' => '/restaurante/autoconsulta',
						'dispositivo' => 1
					],
					7 => [
						'nombre' => 'Comandas',
						'link' => '/restaurante/rptcomanda',
						'dispositivo' => 1
					],
					8 => [
						'nombre' => 'Ventas administrativo',
						'link' => '/restaurante/rptvtasadm',
						'dispositivo' => 1
					],
					9 => [
						'nombre' => 'Artículos eliminados',
						'link' => '/restaurante/rptartelim',
						'dispositivo' => 1
					]
				]
			],
			3 => [
				'nombre' => 'Mantenimiento',
				'dispositivo' => 1,
				'opciones' => [
					1 => [
						'nombre' => 'Tipo de Turno',
						'link' => '/restaurante/tipoturno',
						'dispositivo' => 1
					],
					2 => [
						'nombre' => 'Distribución de propinas',
						'link' => '/restaurante/propina',
						'dispositivo' => 1
					],
					3 => [
						'nombre' => 'Notas predefinidas',
						'link' => '/restaurante/notas_predefinidas',
						'dispositivo' => 1
					]
				]
			]
		]
	],
	3 => [
		'nombre' => 'FACT',
		'dispositivo' => 1,
		'submodulo' => [
			1 => [
				'nombre' => 'Transacción',
				'dispositivo' => 1,
				'opciones' => [
					1 => [
						'nombre' => 'Formas de pago',
						'link' => '/pos/fpago',
						'dispositivo' => 1
					]
				]
			]
		]
	],
	4 => [
		'nombre' => 'WMS',
		'dispositivo' => 1,
		'submodulo' => [
			1 => [
				'nombre' => 'Transacción',
				'dispositivo' => 1,
				'opciones' => [
					1 => [
						'nombre' => 'Ingresos',
						'link' => '/wms/ingresos',
						'dispositivo' => 1
					],
					2 => [
						'nombre' => 'Egresos',
						'link' => '/wms/egresos',
						'dispositivo' => 1
					],
					3 => [
						'nombre' => 'Transformaciones',
						'link' => '/wms/transformaciones',
						'dispositivo' => 1
					],
					4 => [
						'nombre' => 'Produccion',
						'link' => '/wms/produccion',
						'dispositivo' => 1
					],
					5 => [
						'nombre' => 'Inventario físico',
						'link' => '/wms/fisico',
						'dispositivo' => 1
					],
					6 => [
						'nombre' => 'Cuadre diario',
						'link' => '/wms/cuadre_diario',
						'dispositivo' => 1
					],
					7 => [
						'nombre' => 'Requisiciones',
						'link' => '/wms/requisiciones',
						'dispositivo' => 1
					],
					8 => [
						'nombre' => 'Ajuste de costo promedio',
						'link' => '/wms/ajuste_costo_promedio',
						'dispositivo' => 1
					],
					9 => [
						'nombre' => 'Ajuste de costo y existencia',
						'link' => '/wms/ajuste_costo_existencia',
						'dispositivo' => 1
					]
				]
			],
			2 => [
				'nombre' => 'Reportes',
				'dispositivo' => 1,
				'opciones' => [
					1 => [
						'nombre' => 'Existencias',
						'link' => '/wms/rptexistencia',
						'dispositivo' => 1
					],
					2 => [
						'nombre' => 'Kardex',
						'link' => '/wms/rptkardex',
						'dispositivo' => 1
					],
					3 => [
						'nombre' => 'Inventario Valorizado',
						'link' => '/wms/rptvalorizado',
						'dispositivo' => 1
					],
					4 => [
						'nombre' => 'Ingreso',
						'link' => '/wms/rptingreso',
						'dispositivo' => 1
					],
					5 => [
						'nombre' => 'Consumos',
						'link' => '/wms/rptconsumos',
						'dispositivo' => 1
					],
					6 => [
						'nombre' => 'Resumen egresos',
						'link' => '/wms/resumen_egreso',
						'dispositivo' => 1
					],
					7 => [
						'nombre' => 'Resumen ingresos',
						'link' => '/wms/resumen_ingreso',
						'dispositivo' => 1
					],
					8 => [
						'nombre' => 'Uso de ingrediente',
						'link' => '/wms/uso_ingrediente',
						'dispositivo' => 1
					],
					9 => [
						'nombre' => 'Margen de receta',
						'link' => '/wms/margen_receta',
						'dispositivo' => 1
					],
					10 => [
						'nombre' => 'Consumo de articulo',
						'link' => '/wms/consumo_articulo',
						'dispositivo' => 1
					]
				]
			],
			3 => [
				'nombre' => 'Mantenimientos',
				'dispositivo' => 1,
				'opciones' => [
					1 => [
						'nombre' => 'Bodegas',
						'link' => '/admin/bodega',
						'dispositivo' => 1
					],
					2 => [
						'nombre' => 'Tipos de movimiento',
						'link' => '/wms/tipo_movimiento',
						'dispositivo' => 1
					]
				]
			]
		]
	],
	5 => [
		'nombre' => 'OC',
		'dispositivo' => 1,
		'submodulo' => [
			1 => [
				'nombre' => 'Transacción',
				'dispositivo' => 1,
				'opciones' => [
					1 => [
						'nombre' => 'Órdenes de compra',
						'link' => '/ordcomp/ordcomp',
						'dispositivo' => 1
					]
				]
			],
			2 => [
				'nombre' => 'Reportes',
				'dispositivo' => 1,
				'opciones' => [
					1 => [
						'nombre' => 'Lista de pedidos',
						'link' => '/ordcomp/rptlistapedido',
						'dispositivo' => 1
					],
					2 => [
						'nombre' => 'Resumen de pedidos por proveedor',
						'link' => '/ordcomp/resumen_pedidos_proveedor',
						'dispositivo' => 1
					]
				]
			]
		]
	],
	6 => [
		'nombre' => 'CC',
		'dispositivo' => 1,
		'submodulo' => [
			1 => [
				'nombre' => 'Transacción',
				'dispositivo' => 1,
				'opciones' => [
					1 => [
						'nombre' => 'Seguimiento',
						'link' => '/callcenter/seguimiento_callcenter',
						'dispositivo' => 1
					]
				]
			],
			2 => [
				'nombre' => 'Mantenimiento',
				'dispositivo' => 1,
				'opciones' => [
					1 => [
						'nombre' => 'Tipos de dirección',
						'link' => '/callcenter/tipo_direccion',
						'dispositivo' => 1
					],
					2 => [
						'nombre' => 'Clientes',
						'link' => '/callcenter/cliente_master',
						'dispositivo' => 1
					],
					3 => [
						'nombre' => 'Tiempos de entrega',
						'link' => '/callcenter/tiempo_entrega',
						'dispositivo' => 1
					],
					4 => [
						'nombre' => 'Estatus pedido',
						'link' => '/callcenter/estatus_callcenter',
						'dispositivo' => 1
					],
					5 => [
						'nombre' => 'Tipo de domicilio',
						'link' => '/callcenter/tipo_domicilio',
						'dispositivo' => 1
					],
					6 => [
						'nombre' => 'Repartidores',
						'link' => '/callcenter/repartidor',
						'dispositivo' => 1
					]
				]
			],
			3 => [
				'nombre' => 'Reportes',
				'dispositivo' => 1,
				'opciones' => [
					1 => [
						'nombre' => 'Pedidos por sede',
						'link' => '/callcenter/rpt_pedidos_sede',
						'dispositivo' => 1
					],
					2 => [
						'nombre' => 'Ventas callcenter',
						'link' => '/callcenter/venta_callcenter',
						'dispositivo' => 1
					]
				]
			]
		]
	],
	7 => [
		'nombre' => 'GK',
		'dispositivo' => 1,
		'submodulo' => [
			1 => [
				'nombre' => 'Transacción',
				'dispositivo' => 1,
				'opciones' => [
					1 => [
						'nombre' => 'Seguimiento',
						'link' => '/gk/seguimiento',
						'dispositivo' => 1
					]
				]
			],
			2 => [
				'nombre' => 'Mantenimiento',
				'dispositivo' => 1,
				'opciones' => [
					1 => [
						'nombre' => 'Formas de pago por origen',
						'link' => '/admin/fp_co',
						'dispositivo' => 1
					],
					2 => [
						'nombre' => 'Vendors por origen',
						'link' => '/admin/vdt',
						'dispositivo' => 1
					]
				]
			],
			3 => [
				'nombre' => 'Reportes',
				'dispositivo' => 1,
				'opciones' => [
					1 => [
						'nombre' => 'Distribución de propinas',
						'link' => '/gk/repdistprop',
						'dispositivo' => 1
					],
					2 => [
						'nombre' => 'Ventas por marca',
						'link' => '/gk/rep_venta_marca',
						'dispositivo' => 1
					]
				]
			]
		]
	],
	8 => [
		'nombre' => 'RSV',
		'dispositivo' => 1,
		'submodulo' => [
			1 => [
				'nombre' => 'Transacción',
				'dispositivo' => 1,
				'opciones' => [
					1 => [
						'nombre' => 'Reservaciones',
						'link' => '/hotel/reservas',
						'dispositivo' => 1
					]
				]
			],
			2 => [
				'nombre' => 'Reportes',
				'dispositivo' => 1,
				'opciones' => [
					1 => [
						'nombre' => 'Historial de reservas',
						'link' => '/hotel/rpthistrsrv',
						'dispositivo' => 1
					]
				]
			],
			3 => [
				'nombre' => 'Mantenimiento',
				'dispositivo' => 1,
				'opciones' => [
					1 => [
						'nombre' => 'Clientes',
						'link' => '/callcenter/cliente_master',
						'dispositivo' => 1
					],
					2 => [
						'nombre' => 'Tipos de habitación',
						'link' => '/hotel/tipo_habitacion',
						'dispositivo' => 1
					]
				]
			]
		]
	]
];
