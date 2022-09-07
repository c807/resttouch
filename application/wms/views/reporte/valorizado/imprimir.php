<!DOCTYPE html>
<html lang="es">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Inventario Valorizado</title>
</head>

<body lang="es-GT" dir="ltr">
	<table class="tabla-contenido">
		<tr>
			<td colspan="8" class="text-center">
				<h1>Inventario Valorizado</h1>
			</td>
		</tr>
		<tr>
			<td colspan="8" class="text-center">
				<h2>Al <?php echo $fecha; ?></h2>
			</td>
		</tr>
	</table>
	<?php foreach ($sedes as $sede) : ?>
		<?php $totalSede = 0; ?>
		<table class="tabla-contenido">
			<tr>
				<td colspan="8">
					<h3>Empresa: <?php echo $sede->empresa->nombre; ?></h3>
				</td>
			</tr>
			<tr>
				<td colspan="8">
					<h4>Sede: <?php echo $sede->nombre; ?></h4>
				</td>
			</tr>
		</table>
		<?php $lastBodega = end($sede->bodegas); ?>
		<?php foreach ($sede->bodegas as $bodega) : ?>
			<table class="tabla-contenido">
				<tr>
					<td colspan="8">
						<h5>Bodega: <?php echo $bodega->descripcion; ?></h5>
					</td>
				</tr>
			</table>
			<table class="tabla-contenido" style="padding: 5px; border: 1px solid black">
				<thead>
					<tr>
						<th class="titulo" style="border: 1px solid black;padding: 5px;" class="text-center">Categoria</th>
						<th class="titulo" style="border: 1px solid black;padding: 5px;" class="text-center">Subcategoria</th>
						<th class="titulo" style="border: 1px solid black;padding: 5px;" class="text-center">Descripción</th>
						<th class="titulo" style="border: 1px solid black;padding: 5px;" class="text-center">Presentación</th>
						<th class="titulo" style="border: 1px solid black;padding: 5px; width: 7%;" class="text-center">Existencia</th>
						<th class="titulo" style="border: 1px solid black;padding: 5px; width: 5%;" class="text-center">Última Compra</th>
						<th class="titulo" style="border: 1px solid black;padding: 5px; width: 7%;" class="text-center">Costo</th>
						<th class="titulo" style="border: 1px solid black;padding: 5px; width: 7%;" class="text-center">Valor</th>
					</tr>
				</thead>
				<tbody>
					<?php $totalBodega = 0; ?>
					<?php foreach ($bodega->articulos as $articulo) : ?>
						<tr>
							<td style="border: 1px solid black;padding: 5px; margin-left: 10px;"><?php echo $articulo->categoria; ?></td>
							<td style="border: 1px solid black;padding: 5px; margin-left: 10px;"><?php echo $articulo->categoria_grupo; ?></td>
							<td style="border: 1px solid black;padding: 5px; margin-left: 10px;"><?php echo $articulo->descripcion; ?></td>
							<td style="border: 1px solid black;padding: 5px; margin-left: 10px;"><?php echo $articulo->presentacion; ?></td>
							<td style="border: 1px solid black;padding: 5px; width: 7%;" class="text-right"><?php echo number_format($articulo->cantidad, 2); ?></td>
							<td style="border: 1px solid black;padding: 5px; width: 5%;" class="text-right"><?php echo $articulo->ultima_compra; ?></td>
							<td style="border: 1px solid black;padding: 5px; width: 7%;" class="text-right"><?php echo number_format($articulo->precio_unitario, 5); ?></td>
							<td style="border: 1px solid black;padding: 5px; width: 7%;" class="text-right"><?php echo number_format($articulo->total, 2); ?></td>
						</tr>
						<?php $totalBodega += $articulo->total;
						$totalSede += $articulo->total; ?>
					<?php endforeach; ?>
				</tbody>
				<tfoot>
					<tr>
						<td colspan="7" style="border: 1px solid black;padding: 5px;" class="totales">
							Total de la bodega <?php echo $bodega->descripcion; ?>:
						</td>
						<td style="border: 1px solid black;padding: 5px; width: 7%;" class="totales">
							<?php echo number_format($totalBodega, 2); ?>
						</td>
					</tr>
					<?php if ((int)$bodega->bodega === (int)$lastBodega->bodega) : ?>
						<tr>
							<td colspan="7" style="border: 1px solid black;padding: 5px;" class="totales">
								Total de la sede <?php echo $sede->nombre; ?>:
							</td>
							<td style="border: 1px solid black;padding: 5px; width: 7%;" class="totales">
								<?php echo number_format($totalSede, 2); ?>
							</td>
						</tr>
					<?php endif; ?>
				</tfoot>
			</table>
			<div style="width: 100%; height: 10px;"></div>
		<?php endforeach; ?>
	<?php endforeach; ?>
</body>

</html>
<style type="text/css">
	body {
		font-family: sans-serif;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		border: 0px solid black;
	}

	td {
		width: auto;
		border-collapse: collapse;
		border: 0px solid black;
	}

	.text-right {
		text-align: right;
	}

	.text-center {
		text-align: center;
	}

	.tabla-contenido {
		font-size: 0.65em;
	}

	.tabla-firma {
		font-size: 0.90em;
	}

	.tabla-firma-td {
		border: none;
		text-align: center;
		padding: 15px 1px 15 1px;
	}

	.titulo {
		text-align: center;
		vertical-align: middle;
		background-color: #E5E5E5;
		font-weight: bold;
	}

	.totales {
		text-align: right;
		background-color: #E5E5E5;
	}
</style>