<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Costo de Recetas</title>
</head>
<body lang="es-GT" dir="ltr">
	<?php foreach ($data as $llave => $fila): ?>
		<div class="encabezado" style="border: 1px solid black; padding: 2.5px; border-radius: 10px; width: 100%; position: relative;">
			<table class="table encabezado">
				<tr>
					<td class="text-right"><b>Código: </b></td>
					<td><?php echo $fila["articulo"]->codigo?></td>
					<td class="text-right"><b>Fecha: </b></td>
					<td><?php echo formatoFecha(Hoy(), 2);?></td>
				</tr>
				<tr>
					<td class="text-right"><b>Categoria: </b></td>
					<td><?php echo "{$fila['articulo_grupo']->descripcion} ({$fila['articulo_grupo']->ncategoria})"?></td>
					<td class="text-right"><b>Nombre: </b></td>
					<td><?php echo $fila["articulo"]->descripcion?></td>
				</tr>
				<tr>
					<td></td>
					<td></td>
					<td class="text-right"><b>Rendimiento: </b></td>
					<td><?php echo $fila["articulo"]->rendimiento?></td>
				</tr>
			</table>
		</div><br>
		<table class="table">
			<thead>
				<tr>
					<th class="encabezado text-left">Código</th>
					<th class="encabezado text-left">Descripcion</th>
					<th class="encabezado text-center">Cantidad</th>
					<th class="encabezado text-right">Costo U.</th>
					<th class="encabezado text-right">Total Q.</th>
				</tr>
			</thead>
			<tbody>
				<?php $total=0; foreach ($fila["receta"] as $key => $row): $total+=$row->costo; ?>
					<tr>
						<td class="cuerpo text-left"><?php echo $row->articulo->codigo?></td>
						<td class="cuerpo text-left"><?php echo $row->articulo->descripcion?></td>
						<td class="cuerpo text-center"><?php echo number_format($row->cantidad, 2)." ".$row->medida->descripcion?></td>
						<td class="cuerpo text-right"><?php echo number_format($row->articulo->costo, 2)?></td>
						<td class="cuerpo text-right"><?php echo number_format($row->costo, 2)?></td>
					</tr>
				<?php endforeach ?>
				<tr>
					<td colspan="2"></td>
					<td colspan="2" class="encabezado btop text-right"><b>Costo total por receta:</b></td>
					<td class="encabezado btop text-right"><?php echo number_format($total, 2)?></td>
				</tr>
			</tbody>
		</table>
		<br><hr><br>
	<?php endforeach ?>
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
	.btop {border-top: 1px solid black;}
</style>