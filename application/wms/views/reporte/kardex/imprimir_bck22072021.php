<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Reporte_kardex<?php echo rand()?></title>
	<style type="text/css">
		body {font-family: sans-serif;}
		table {width: 100%; border-collapse: collapse; border: 1px solid black;}
		td {width: auto; border-collapse: collapse; border: 1px solid black;}

		.text-right {text-align: right;}
		.text-center {text-align: center;}
		.tabla-contenido {font-size: 0.65em;}
		.titulo {text-align: center; vertical-align: middle; background-color: #E5E5E5; font-weight: bold;}
	</style>
</head>
<body>
	<table class="tabla-contenido">
		<tr>
			<td colspan="6" class="text-center"><h1>Kardex</h1></td>
			<td colspan="4" class="text-center">
				<b>Del:</b> <?php echo formatoFecha($fdel,2)?> 
				<b>Al:</b> <?php echo formatoFecha($fal,2) ?> 
			</td>
		</tr>
	
		<?php foreach ($bodegas as $value): ?>
			<?php $bodega = new Bodega_model($value) ?>
			<tr>
				<td class="titulo" colspan="10"><?php echo $bodega->descripcion ?>
				</td>
			</tr>
			<?php if (isset($articulos[$value])): ?>
				<?php foreach ($articulos[$value] as $row): ?>
					<tr>
						<td class="titulo">Código</td>
						<td class="titulo">Descripción</td>
						<td class="titulo">Presentación</td>
						<td class="titulo">Saldo Anterior</td>
						<td class="titulo">Ingresos</td>
						<td class="titulo">Egresos</td>
						<td class="titulo">Comandas</td>
						<td class="titulo">Factura Directa</td>
						<td class="titulo">Total Egresos</td>
						<td class="titulo">Saldo Actual</td>
					</tr>
					<?php $saldo = $row['antiguedad'] + $row['ingresos'] - $row['salidas'] ?>
					<tr>
						<td><?php echo (!empty($row['codigo']) ? $row['codigo'] : $row['articulo'])?></td>
						<td><?php echo $row['descripcion']?></td>
						<td><?php echo $row['presentacion']?></td>

						<td class="text-right"><?php echo number_format($row['antiguedad'],2)?></td>
						<td class="text-right"><?php echo number_format($row['ingresos'],2)?></td>
						<td class="text-right"><?php echo number_format($row['egresos'],2)?></td>
						<td class="text-right"><?php echo number_format($row['comandas'],2)?></td>
						<td class="text-right"><?php echo number_format($row['facturas'],2)?></td>
						<td class="text-right"><?php echo number_format($row['salidas'],2)?></td>
						<td class="text-right"><?php echo number_format($saldo,2)?></td>
					</tr>
					<?php if (count($row['detalle']) > 0): ?>
							<tr>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td class="titulo">Fecha</td>
								<td class="titulo">No</td>
								<td class="titulo">Tipo Movimiento</td>
								<td class="titulo">Ingreso</td>
								<td class="titulo">Salida</td>
							</tr>
					<?php foreach ($row['detalle'] as $det): ?>
							<tr>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td><?php echo formatoFecha($det->fecha,2) ?></td>
								<td><?php echo $det->id ?></td>
								<td><?php echo $det->tipo_movimiento ?></td>
								<td><?php echo ($det->tipo == 1) ? number_format($det->cantidad,2) : "0.00" ?></td>
								<td><?php echo ($det->tipo == 2) ? number_format($det->cantidad,2) : "0.00" ?></td>
							</tr>
					<?php endforeach ?>
						
					<?php endif ?>
					<tr><td colspan="7"></td></tr>
				<?php endforeach ?>
			<?php else: ?>
				<tr>
					<td class="titulo" colspan="10">Sin Movimientos
					</td>
				</tr>
			<?php endif ?>
		<?php endforeach ?>
	</table>
</body>
</html>

