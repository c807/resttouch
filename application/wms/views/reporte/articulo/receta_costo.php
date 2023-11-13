<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Costo de Recetas</title>
</head>
<body lang="es-GT" dir="ltr">
	<?php foreach ($data as $llave => $fila): ?>
		<?php if(is_array($fila)): ?>
		<div class="encabezado" style="border: 1px solid black; padding: 2.5px; border-radius: 10px; width: 100%; position: relative;">
			<table class="table encabezado">
				<tr>
					<td class="text-right"><b>Código: </b></td>
					<td><?php echo $fila["articulo"]->codigo?></td>
					<td class="text-right"><b>Fecha: </b></td>
					<td><?php echo formatoFecha(Hoy(), 2);?></td>
				</tr>
				<tr>
					<td class="text-right"><b>Categoría: </b></td>
					<td><?php echo "{$fila['articulo_grupo']->descripcion} ({$fila['articulo_grupo']->ncategoria})"?></td>
					<td class="text-right"><b>Nombre: </b></td>
					<td><?php echo $fila["articulo"]->descripcion?></td>
				</tr>
				<tr>
					<td><b>Presentación:</b></td>
					<td><?php echo $fila["presentacion_reporte"]->descripcion?></td>
					<td class="text-right"><b>Rendimiento: </b></td>
					<td><?php echo $fila["articulo"]->rendimiento?></td>
				</tr>
			</table>
		</div><br>
		<table class="table">
			<?php if(!empty($fila['advertir'])): ?>
			<caption class="text-center">				
				<span style="color: red; font-weight: bold;">
					<?php echo $fila['advertir']; ?>
				</span>
			</caption>
			<?php endif ?>
			<thead>
				<tr>
					<th class="encabezado text-left"><b>Código</b></th>
					<th class="encabezado text-left"><b>Descripción</b></th>
					<th class="encabezado text-center" style="width: 7%;"><b>Pro.</b></th>
					<th class="encabezado text-center" style="width: 7%;"><b>Inv.</b></th>
					<th class="encabezado text-center" style="width: 7%;"><b>Rec.</b></th>
					<th class="encabezado text-center"><b>Cantidad</b></th>
					<th class="encabezado text-right"><b>Costo U.</b></th>
					<th class="encabezado text-right"><b>Total Q.</b></th>
				</tr>
			</thead>
			<tbody>
				<?php $total=0; foreach ($fila["receta"] as $key => $row): $total+=$row->costo; ?>
					<tr>
						<td class="cuerpo text-left"><?php echo $row->articulo->codigo?></td>
						<td class="cuerpo text-left"><?php echo $row->articulo->descripcion?></td>
						<td class="cuerpo text-center"><?php echo (int)$row->articulo->produccion === 1 ? ($data['enPDF'] ? '&#10004;' : 'X') : '';?></td>
						<td class="cuerpo text-center"><?php echo (int)$row->articulo->mostrar_inventario === 1 ? ($data['enPDF'] ? '&#10004;' : 'X') : '';?></td>
						<td class="cuerpo text-center"><?php echo (int)$row->articulo->esreceta === 1 ? ($data['enPDF'] ? '&#10004;' : 'X') : '';?></td>
						<td class="cuerpo text-center"><?php echo number_format($row->cantidad, 2)." ".$row->medida->descripcion?></td>
						<td class="cuerpo text-right"><?php echo number_format($row->articulo->costo, 5)?></td>
						<td class="cuerpo text-right"><?php echo number_format($row->costo, 2)?></td>
					</tr>
				<?php endforeach ?>
				<tr>
					<td colspan="2"></td>
					<td colspan="5" class="encabezado btop text-right"><b>Costo total por receta:</b></td>
					<td class="encabezado btop text-right"><?php echo number_format($total, 2)?></td>
				</tr>
			</tbody>
		</table>
		<br><hr><br>
		<?php endif ?>
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