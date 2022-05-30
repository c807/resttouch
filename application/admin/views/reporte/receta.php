<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
	<title>Receta</title>
</head>

<body lang="es-GT" dir="ltr">
	<div class="row">
		<div class="col-sm-12">
			<table style="width: 100%;">
				<tr>
					<td><?php echo $empresa->nombre ?></td>
				</tr>
				<tr>
					<td><?php echo $nsede ?></td>
				</tr>
			</table>
		</div>
	</div>
	<div class="row">
		<div class="col-sm-6 text-center">
			<h3>Receta articulo <?php echo $articulo->descripcion ?></h3>
		</div>
		<div class="col-sm-6 text-right">
			<h3>Costo: Q.<?php echo number_format($costo, 2); ?></h3>
		</div>
	</div>
	<br>
	<div class="table-responsive">
		<table style="padding: 5px">
			<thead>
				<tr>
					<th style="border: 1px solid black;padding: 5px;" class="text-center">Descripcion</th>
					<th style="border: 1px solid black;padding: 5px;" class="text-center">Existencias</th>
					<th style="border: 1px solid black;padding: 5px;" class="text-center">Costo</th>
				</tr>
			</thead>
			<tbody>
				<?php $total = 0 ?>
				<?php foreach ($receta as $row) : ?>
					<tr>
						<td style="border: 1px solid black;padding: 5px; margin-left: 5px;"><b><?php echo $row->articulo->descripcion ?></b></td>
						<td style="border: 1px solid black;padding: 5px;" class="text-right">
							<?php echo $row->articulo->existencias ?>
						</td>
						<td style="border: 1px solid black;padding: 5px;" class="text-right">
							<?php echo number_format($row->costo, 2) ?>
						</td>
					</tr>
					<?php $total += $row->costo; ?>
				<?php endforeach ?>
				<tr>
					<td style="border: 1px solid black;padding: 5px;font-weight: bold;" colspan="2" class="text-right">
						<b>Total</b>
					</td>
					<td style="border: 1px solid black;padding: 5px;" class="text-right">
						<?php echo number_format($total, 2) ?>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
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