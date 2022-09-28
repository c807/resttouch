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
		.subtitulo {text-align: left; vertical-align: middle; background-color: #E5E5E5; font-weight: bold;}
		.num { width: 14.28%; }
	</style>
</head>
<body>
	<h3 class="text-center"><?php echo $reporte->titulo ?></h3>
	<div class="text-center"><b>Del</b> <?php echo formatoFecha($args->fdel, 2)?> <b>al</b> <?php echo formatoFecha($args->fal, 2)?> </div>
	<table class="tabla-contenido">
		<?php if ($args->reporte == 3): ?>
			<tr>
				<td class="titulo">Producto</td>
				<td class="titulo">Último costo</td>
				<td class="titulo">Costo promedio</td>
				<td class="titulo">Desviación estándar</td>
			</tr>
		<?php else: ?>
			<?php
				$col = "Producto";
			
				if ($args->reporte == 2) {
					$col = "Proveedor";
				}
			?>
			<tr>
				<td class="titulo">Fecha</td>
				<td class="titulo">Tipo</td>
				<td class="titulo">Documento</td>
				<td class="titulo">Estatus ingreso</td>
				<td class="titulo">Bodega </td>
				<td class="titulo"><?php echo $col ?></td>
				<td class="titulo">Cantidad</td>
				<td class="titulo">Costo <?php echo(isset($args->ds) && $args->ds) ? " promedio": "" ?></td>
				<td class="titulo">Total</td>
			</tr>
		<?php endif ?>

		<?php if ($lista && $args->reporte == 3): ?>
			<?php $categoria = ""; $subcategoria = ""; ?>
			<?php foreach ($lista as $row): ?>
				<?php if ($categoria != $row->categoria): ?>
					<?php $categoria = $row->categoria; ?>
					<tr>
						<td colspan="4" class="subtitulo"><?php echo $categoria ?></td>
					</tr>
				<?php endif; ?>

				<?php if ($subcategoria != $row->subcategoria): ?>
					<?php $subcategoria = $row->subcategoria; ?>
					<tr>
						<td colspan="4" class="text-left"><b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo $subcategoria ?></b></td>
					</tr>
				<?php endif; ?>

				<tr>
					<td><?php echo $row->producto; ?></td>
					<td><?php echo number_format($row->ultimo_costo, 2); ?></td>
					<td><?php echo number_format($row->costo_promedio, 2); ?></td>
					<td><?php echo number_format($row->desviacion, 5); ?></td>
				</tr>
			<?php endforeach; ?>

		<?php elseif ($lista): ?>
			<?php $total = 0; $tcantidad = 0; $proveedor = ""; $producto = "";?>
			<?php foreach ($lista as $row): ?>
				<?php if ($args->reporte == 1): ?>
					<?php if ($row->nproveedor != $proveedor): ?>
						<?php $proveedor = $row->nproveedor; ?>
						<tr>
							<td colspan="9" class="titulo text-left"><?php echo $proveedor ?></td>
						</tr>
					<?php endif ?>
				<?php endif ?>
				<?php if ($args->reporte == 2): ?>
					<?php if ($row->producto != $producto): ?>
						<?php $producto = $row->producto; ?>
						<tr>
							<td colspan="9" class="titulo text-left"><?php echo $producto ?></td>
						</tr>
					<?php endif ?>
				<?php endif ?>
				<tr>
					<td><?php echo formatoFecha($row->fecha, 2); ?></td>
					<td><?php echo $row->ntipo_movimiento; ?></td>
					<td><?php echo $row->num_documento; ?></td>
					<td><?php echo $row->nestatus?></td>
					<td><?php echo $row->bodega; ?> </td>
					<?php
						$val = $row->producto;
				
						if ($args->reporte == 2) {
							$val = $row->nproveedor;
						}
					?>
					<td><?php echo $val; ?></td>
					<td class="text-right"><?php echo number_format($row->cantidad, 2); ?></td>
					<td class="text-right"><?php echo number_format($row->costo, 4); ?></td>
					<td class="text-right"><?php echo number_format($row->costo_total, 2); ?></td>
				</tr>
				<?php 
					$total += $row->costo_total;
					$tcantidad += $row->cantidad;
				?>
			<?php endforeach ?>
			<tr>
				<td colspan="6" class="text-right"><b>Total</b></td>
				<?php if ($args->reporte == 2): ?>
					<td class="text-right"><b><?php echo number_format($tcantidad, 2); ?></b></td>
				<?php else: ?>
					<td></td>
				<?php endif ?>
				<td></td>
				<td class="text-right"><b><?php echo number_format($total, 2); ?></b></td>
			</tr>
		<?php endif ?>

	</table>
</body>
</html>