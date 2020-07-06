<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Reporte_de_existencias_<?php echo rand()?></title>
</head>
<body>
	<table class="tabla-contenido">
		<tr>
			<td colspan="6" class="text-center"><h1>Reporte de Existencias</h1></td>
			<td colspan="2" class="text-center">Fecha <?php echo $fecha?></td>
		</tr>
	
		<tr>
			<td class="titulo">Codigo</td>
			<td class="titulo">Descripción</td>
			<td class="titulo">Ingresos</td>
			<td class="titulo">Egresos</td>
			<td class="titulo">Comandas</td>
			<td class="titulo">Factura Directa</td>
			<td class="titulo">Total Egresos</td>
			<td class="titulo">Existencia</td>
		</tr>
		<?php 
			$ingresos 	   = 0;
			$egresos 	   = 0;
			$existencia     = 0;
			$comandas      = 0;
			$facturas      = 0;
			$total_egreso  = 0;

			if ($reg): 
		?>
			<?php 
				foreach ($reg as $key => $row): 

				$ingresos += $row->ingresos;
				$egresos += $row->egresos;
				$existencia    += $row->existencia;
				$comandas      += $row->comandas;
				$facturas      += $row->facturas;
				$total_egreso += $row->total_egresos;
			?>
				<tr>
					<td><?php echo (!empty($row->codigo) ? $row->codigo : $row->articulo)?></td>
					<td><?php echo $row->descripcion?></td>
					<td class="text-right"><?php echo number_format($row->ingresos,2)?></td>
					<td class="text-right"><?php echo number_format($row->egresos,2)?></td>
					<td class="text-right"><?php echo number_format($row->comandas,3)?></td>
					<td class="text-right"><?php echo number_format($row->facturas,3)?></td>
					<td class="text-right"><?php echo number_format($row->total_egresos,3)?></td>
					<td class="text-right"><?php echo number_format($row->existencia,2)?></td>
				</tr>
			<?php endforeach ?>
		<?php endif ?>
		<tr>
			<td colspan="2">Total</td>
			<td class="totales"><?php echo number_format($ingresos, 2)?></td>
			<td class="totales"><?php echo number_format($egresos, 2)?></td>
			<td class="totales"><?php echo number_format($comandas, 2)?></td>
			<td class="totales"><?php echo number_format($facturas, 3)?></td>
			<td class="totales"><?php echo number_format($total_egreso, 3)?></td>
			<td class="totales"><?php echo number_format($existencia, 3)?></td>
			
		</tr>
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