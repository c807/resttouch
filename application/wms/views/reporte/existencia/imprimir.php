<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Reporte_de_existencias_<?php echo rand()?></title>
</head>
<body>
	<table class="tabla-contenido">
		<tr>
			<td colspan="9" class="text-center"><h1>Reporte de Existencias <?php echo $subtitulo ?></h1></td>
			<td colspan="3" class="text-center">Del <?php echo $fecha_del?> al <?php echo $fecha?></td>
		</tr>
	
		<tr>
			<td class="titulo">Código</td>
			<td class="titulo">Descripción</td>
			<td class="titulo">Unidad</td>
			<td class="titulo">Mínimo</td>
			<td class="titulo">Máximo</td>
			<td class="titulo">S. Inicial</td>
			<td class="titulo">Ingresos</td>
			<td class="titulo">Egresos</td>
			<td class="titulo">Comandas</td>
			<td class="titulo">Factura Directa</td>
			<td class="titulo">Total Egresos</td>
			<td class="titulo">Existencia</td>
		</tr>
		<?php 
			// $ingresos 	   = 0;
			// $egresos 	   = 0;
			// $existencia     = 0;
			// $comandas      = 0;
			// $facturas      = 0;
			// $total_egreso  = 0;

			if ($reg): 
		?>
			<?php foreach ($sedes as $sede): ?>
				<?php $obj = new Sede_model($sede); ?>
				<tr>
					<td colspan="12" class="titulo"><?php echo "{$obj->nombre} ({$obj->alias})"; ?></td>
				</tr>
				<tr>
					<td colspan="12" class="titulo"><?php echo $bodegas[$obj->getPK()]; ?></td>
				</tr>
				<?php 
					foreach ($reg[$sede] as $key => $row): 
						$art = new Articulo_model($row->articulo->articulo);
						// $rec = $art->getReceta();
						// $ingresos += $row->ingresos;
						// $egresos += $row->egresos;
						// $existencia    += $row->existencia;
						// $comandas      += $row->comandas;
						// $facturas      += $row->facturas;
						// $total_egreso += $row->total_egresos;
				?>
						<tr>
							<td><?php echo (!empty($row->articulo->codigo) ? $row->articulo->codigo : $row->articulo->articulo)?></td>
							<td>
								<?php echo $row->articulo->descripcion ?>
									
							</td>
							<td>
								<?php echo $row->presentacion->descripcion ?>
							</td>
							<td class="text-right">
								<?php echo number_format($row->articulo->stock_minimo, 2) ?>
							</td>
							<td class="text-right">
								<?php echo number_format($row->articulo->stock_maximo, 2) ?>
							</td>
							<td class="text-right">
								<?php echo number_format($row->saldo_inicial / $row->presentacion->cantidad,2)?>
							</td>
							<td class="text-right">
								<?php echo number_format($row->ingresos / $row->presentacion->cantidad,2)?>
							</td>
							<td class="text-right">
								<?php echo number_format($row->egresos / $row->presentacion->cantidad,2)?>
							</td>
							<td class="text-right">
								<?php echo number_format($row->comandas / $row->presentacion->cantidad,2)?>
								
							</td>
							<td class="text-right">
								<?php echo number_format($row->facturas / $row->presentacion->cantidad,2)?>
									
							</td>
							<td class="text-right">
								<?php echo number_format($row->total_egresos / $row->presentacion->cantidad,2)?>
							</td>
							<td class="text-right">
							<?php 
								echo number_format($row->existencia / $row->presentacion->cantidad,2);
							?>	
							</td>
						</tr>
						
				<?php endforeach ?>
			<?php endforeach ?>
		<?php endif ?>
		
	</table>
	<table class="tabla-firma">
		<tr>
			<td class="tabla-firma-td">
				Supervisor: __________________________________<br>
			</td>
			<td class="tabla-firma-td">Jefe de Almacenaje: ___________________________<br></td>
			<td class="tabla-firma-td">Fecha: ____________</td>
			<td class="tabla-firma-td">Hora: ____________<br></td>
		</tr>
	</table>
</body>
</html>

<style type="text/css">
	body {font-family: sans-serif;}
	table {width: 100%; border-collapse: collapse; border: 1px solid black;}
	td {width: auto; border-collapse: collapse; border: 1px solid black;}

	.text-right {text-align: right;}
	.text-center {text-align: center;}
	.tabla-contenido {font-size: 0.65em;}
	.tabla-firma {font-size: 0.90em;}
	.tabla-firma-td {border: none; text-align:center;padding: 15px 1px 15 1px;}
	.titulo {text-align: center; vertical-align: middle; background-color: #E5E5E5; font-weight: bold;}
	.totales {text-align: right; background-color: #E5E5E5; }
</style>