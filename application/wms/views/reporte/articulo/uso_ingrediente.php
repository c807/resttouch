<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Uso de Ingrediente</title>
</head>
<body lang="es-GT" dir="ltr">
	<h3 class="text-center encabezado" style="padding-bottom: 1px;">Uso de Ingrediente</h3>
	<h4 class="text-center encabezado" style="border-bottom: 1px solid black; padding-bottom: 5px;"><?php echo "{$params['sede']->nombre} ({$params['sede']->alias})"; ?></h4>
	<div class="encabezado" style="border: 1px solid black; padding: 2.5px; border-radius: 10px;">
		<p><b>Nombre: </b> <?php echo $params["articulo_nombre"]?></p>
	</div><br>
	<table class="table">
		<thead>
			<tr>
				<th class="encabezado text-left">Código</th>
				<th class="encabezado text-left">Receta</th>
				<th class="encabezado text-center">Cantidad uso</th>
				<th class="encabezado text-center">Medida</th>
			</tr>
		</thead>
		<tbody>
			<?php foreach ($data as $key => $row): ?>
				<tr>
					<td class="cuerpo text-left"><?php echo $row->codigo?></td>
					<td class="cuerpo text-left"><?php echo $row->narticulo?></td>
					<td class="cuerpo text-center"><?php echo $row->cantidad_uso?></td>
					<td class="cuerpo text-center"><?php echo $row->nmedida?></td>
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