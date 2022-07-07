<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Margen de receta</title>
</head>
<body lang="es-GT" dir="ltr">
	<h3 class="text-center encabezado" style="border-bottom: 1px solid black; padding-bottom: 5px;">Margen de receta</h3>
	
	<table class="table">
		<thead>
			<tr>
				<th class="encabezado text-left">Código</th>
				<th class="encabezado text-left">Receta</th>
				<th class="encabezado text-left">Presentación</th>
				<th class="encabezado text-right">Precio</th>
				<th class="encabezado text-right">Costo</th>
				<th class="encabezado text-right">Margen</th>
			</tr>
		</thead>
		<tbody>
			<?php foreach ($data as $key => $row): ?>
				<tr>
					<td class="cuerpo text-left"><?php echo $row["codigo"] ?></td>
					<td class="cuerpo text-left"><?php echo $row["descripcion"] ?></td>
					<td class="cuerpo text-left"><?php echo $row["presentacion"] ?></td>
					<td class="cuerpo text-right"><?php echo number_format($row["precio"], 2) ?></td>
					<td class="cuerpo text-right"><?php echo number_format($row["costo"], 2) ?></td>
					<td class="cuerpo text-right"><?php echo number_format($row["margen"], 2) ?></td>
				</tr>
			<?php endforeach ?>
		</tbody>
	</table>
</body>
</html>
<style type="text/css">
	.table {
		display: table;
		width: 100%;
		max-width: 100%;
		border-collapse: collapse;
		border-spacing: 2px;
	}
	th {vertical-align: bottom;}
	.encabezado { font-family: Arial, Helvetica, sans-serif; }
	.cuerpo { font-family: Arial, Helvetica, sans-serif; font-size: 11px;}
	.text-center {text-align: center;}
	.text-left {text-align: left;}
	.text-right {text-align: right;}
</style>