<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title><?php echo $reporte->titulo ?></title>
	<style type="text/css">
		body {font-family: sans-serif;}
		table {width: 100%; border-collapse: collapse; border: 1px solid black;}
		td { border-collapse: collapse; border: 1px solid black;}

		.text-left {text-align: left;}
		.text-right {text-align: right;}
		.text-center {text-align: center;}
		.tabla-contenido {font-size: 0.65em;}
		.titulo {text-align: center; vertical-align: middle; background-color: #E5E5E5; font-weight: bold;}
		.totales {text-align: right; background-color: #E5E5E5; }
		.subtitulo {text-align: left; vertical-align: middle; background-color: #E5E5E5; font-weight: bold;}
		.num { width: 14.28%; }
	</style>
</head>
<body>
	<h3 class="text-center"><?php echo $reporte->titulo ?></h3>
	<div class="text-center"><b>Del</b> <?php echo formatoFecha($args->fdel, 2)?> <b>al</b> <?php echo formatoFecha($args->fal, 2)?> </div>
	<table class="tabla-contenido">
		<tr>
			<td class="titulo">Fecha</td>
			<td class="titulo"># Documento</td>
			<td class="titulo">Estatus ingreso</td>
			<td class="titulo">Tipo movimiento</td>
			<td class="titulo">Bodega </td>
			<td class="titulo">Producto</td>
			<td class="titulo">Cantidad</td>
			<td class="titulo">Costo</td>
			<td class="titulo">Total</td>
		</tr>
		<?php $total = 0; $cantidad = 0; 
			foreach ($lista as $proveedor => $documento): 
				$provTotal = 0;
				$provCant  = 0; ?>
			<tr>
				<td colspan="9" class="titulo text-left"><?php echo $proveedor?></td>
			</tr>
			<?php foreach ($documento as $llave => $producto): 
					$docTotal = 0;
					$docCant  = 0; ?>
				
				<?php foreach ($producto as $key => $row): 
						$tmpCosto =  $args->iva == 1 ? $row->costo + ($row->costo * 0.12) : $row->costo;
						$tmpCant  = $row->cantidad;
						$tmpTot   = $tmpCosto * $row->cantidad;
				?>
					<tr>
						<td><?php echo formatoFecha($row->fecha, 2); ?></td>
						<td><?php echo $row->num_documento; ?></td>
						<td><?php echo $row->nestatus; ?></td>
						<td><?php echo $row->ntipo_movimiento; ?></td>
						<td><?php echo $row->bodega; ?> </td>
						<td><?php echo $row->producto; ?></td>
						<td class="text-right"><?php echo number_format($row->cantidad, 2); ?></td>
						<td class="text-right"><?php echo number_format($tmpCosto, 2); ?></td>
						<td class="text-right"><?php echo number_format($tmpTot, 2); ?></td>
					</tr>
				<?php 
					$provTotal += $tmpTot;
					$provCant  += $tmpCant;
					$docTotal  += $tmpTot;
					$docCant   += $tmpCant;
					$total     += $tmpTot;
					$cantidad  += $tmpCant;
					endforeach ?>
				<tr>
					<td class="totales text-right" colspan="6"><b>Total documento: </b></td>
					<td class="totales text-right"><?php echo number_format($docCant, 2)?></td>
					<td class="totales text-right"></td>
					<td class="totales text-right"><?php echo number_format($docTotal, 2)?></td>
				</tr>
			<?php endforeach ?>
			<tr>
				<td class="totales text-right" colspan="6"><b>Total Proveedor: </b></td>
				<td class="totales text-right"><?php echo number_format($provCant, 2)?></td>
				<td class="totales text-right"></td>
				<td class="totales text-right"><?php echo number_format($provTotal, 2)?></td>
			</tr>
		<?php endforeach ?>
		<tr>
			<td class="totales text-right" colspan="6"><b>Total</b></td>
			<td class="totales text-right"><?php echo number_format($cantidad, 2)?></td>
			<td class="totales text-right"></td>
			<td class="totales text-right"><b><?php echo number_format($total, 2); ?></b></td>
		</tr>
	</table>
</body>
</html>