<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Kardex</title>
	<style type="text/css">
		body {font-family: sans-serif;}
		table {width: 100%; border-collapse: collapse; border: 1px solid black;}
		td {width: auto; border-collapse: collapse; border: 1px solid black;}

		.text-right {text-align: right;}
		.text-center {text-align: center;}
		.tabla-contenido {font-size: 0.65em;}
		.titulo {text-align: center; vertical-align: middle; background-color: #E5E5E5; font-weight: bold;}
		.num { width: 14.28%; }
	</style>
</head>
<body>
	<table class="tabla-contenido">
		<tr>
			<td colspan="4" class="text-center">
				<h1>Kardex</h1>
				<h2><?php echo "Artículo: {$articulo->descripcion}" ?></h2>
				<h3><?php echo "Código: {$articulo->codigo}" ?></h3>
			</td>
			<td colspan="3" class="text-center">
				<b>Del:</b> <?php echo formatoFecha($fdel,2)?> 
				<b>Al:</b> <?php echo formatoFecha($fal,2) ?> 
			</td>
		</tr>
		<?php $lastSede = end($sedes); ?>
		<?php foreach ($sedes as $sede): ?>
			<tr>
				<td class="titulo" colspan="7">
					Sede: <?php echo "{$sede->sede->nombre} ({$sede->sede->alias})" ?>
				</td>
			</tr>
			<tr>
				<td class="titulo" colspan="7">
					Presentación: <?php echo $sede->presentacion ?>
				</td>
			</tr>
			<?php foreach ($sede->bodegas as $bodega): ?>
				<tr>
					<td class="titulo" colspan="7">
						Bodega: <?php echo $bodega->descripcion ?>
					</td>
				</tr>
				<tr>
					<td class="titulo num">Saldo Anterior</td>
					<td class="titulo num">Ingresos</td>
					<td class="titulo num">Egresos</td>
					<td class="titulo num">Comandas</td>
					<td class="titulo num">Factura Directa</td>
					<td class="titulo num">Total Egresos</td>
					<td class="titulo num">Saldo Actual</td>
				</tr>
				<?php $saldo = $bodega->antiguedad + $bodega->ingresos - $bodega->salidas ?>
				<tr>
					<td class="text-right num"><?php echo number_format($bodega->antiguedad, 2)?></td>
					<td class="text-right num"><?php echo number_format($bodega->ingresos, 2)?></td>
					<td class="text-right num"><?php echo number_format($bodega->egresos, 2)?></td>
					<td class="text-right num"><?php echo number_format($bodega->comandas, 2)?></td>
					<td class="text-right num"><?php echo number_format($bodega->facturas, 2)?></td>
					<td class="text-right num"><?php echo number_format($bodega->salidas, 2)?></td>
					<td class="text-right num"><?php echo number_format($saldo, 2)?></td>
				</tr>
				<?php if(count($bodega->detalle) > 0): ?>
					<tr>
						<td colspan="2"></td>					
						<td class="titulo num">Fecha</td>
						<td class="titulo num">No</td>
						<td class="titulo num">Tipo Movimiento</td>
						<td class="titulo num">Ingreso</td>
						<td class="titulo num">Salida</td>
					</tr>
					<?php foreach ($bodega->detalle as $det): ?>
						<tr>
							<td colspan="2"></td>						
							<td class="text-center num"><?php echo formatoFecha($det->fecha, 2) ?></td>
							<td class="text-center num"><?php echo $det->id ?></td>
							<td class="text-center num"><?php echo $det->tipo_movimiento ?></td>
							<td class="text-right num"><?php echo ($det->tipo == 1) ? number_format($det->cantidad, 2) : "0.00" ?></td>
							<td class="text-right num"><?php echo ($det->tipo == 2) ? number_format($det->cantidad, 2) : "0.00" ?></td>
						</tr>					
					<?php endforeach ?>
				<?php else: ?>
					<tr>
						<td class="text-center" colspan="7">
							<h5>SIN MOVIMIENTOS EN LA BODEGA <?php echo strtoupper($bodega->descripcion) ?></h5>
						</td>
					</tr>
				<?php endif ?>
			<?php endforeach ?>
			<?php if($sede != $lastSede): ?>
				<tr>
					<td colspan="7" style="height: 15px; border-left: 1px solid white; border-right: 1px solid white;"></td>
				</tr>
			<?php endif ?>
		<?php endforeach ?>
	</table>
</body>
</html>

