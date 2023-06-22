<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Resumen de ingresos</title>
	<style type="text/css">
		body {font-family: sans-serif;}
		table {width: 100%; border-collapse: collapse; border: 1px solid black;}
		td { border-collapse: collapse; border: 1px solid black;}

		.text-left {text-align: left;}
		.text-right {text-align: right;}
		.text-center {text-align: center;}
		.tabla-contenido {font-size: 0.55em;}
		.titulo {text-align: center; vertical-align: middle; background-color: #E5E5E5; font-weight: bold;}
		.totales {text-align: right; background-color: #E5E5E5; }
		.subtitulo {text-align: left; vertical-align: middle; background-color: #E5E5E5; font-weight: bold;}
		.num { width: 14.28%; }
	</style>
</head>
<body>
	<h3 class="text-center">Resumen de ingresos</h3>
	<div class="text-center"><b>Del</b> <?php echo formatoFecha($params["fdel"], 2)?> <b>al</b> <?php echo formatoFecha($params["fal"], 2)?> </div>
	<table class="tabla-contenido">
		<tr>
			<td class="titulo">Fecha</td>
			<td class="titulo text-right">Número</td>
			<td class="titulo">Estatus ingreso</td>
			<td class="titulo">Tipo</td>
			<td class="titulo text-right">Egreso/Requisición</td>
			<td class="titulo">Sede</td>
			<td class="titulo">Bodega</td>
			<td class="titulo">Proveedor</td>
			<td class="titulo">Serie</td>
			<td class="titulo">Documento</td>
			<td class="titulo">Fecha</td>
			<td class="titulo text-right">Total</td>
		</tr>
		<?php $total = 0; foreach ($lista as $key => $row): $total += $row->total;?>
			<tr>
				<td><?php echo $row->fecha?></td>
				<td class="text-right"><?php echo $row->numero?></td>
				<td><?php echo $row->estatus?></td>
				<td><?php echo $row->tipo?></td>
				<td class="text-right"><?php echo $row->egreso_origen?></td>
				<td><?php echo $row->sede?></td>
				<td><?php echo $row->bodega?></td>
				<td><?php echo $row->proveedor?></td>
				<td><?php echo $row->serie?></td>
				<td><?php echo $row->documento?></td>
				<td><?php echo formatoFecha($row->fecha_doc, 2)?></td>
				<td class="text-right"><?php echo number_format($row->total, 2)?></td>
			</tr>
		<?php endforeach ?>
		<tr>
			<td class="totales text-right" colspan="11"><b>Total</b></td>
			<td class="totales text-right"><b><?php echo number_format($total, 2); ?></b></td>
		</tr>
	</table>
</body>
</html>