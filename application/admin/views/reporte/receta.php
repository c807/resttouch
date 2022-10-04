<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Costo de Recetas</title>
</head>
<body lang="es-GT" dir="ltr">
	<h3 class="text-center encabezado" style="border-bottom: 1px solid black; padding-bottom: 5px;">
		<span>Costo de Recetas</span><br>
		<span><?php echo isset($nsede) ? $nsede : "" ?></span>
	</h3>
	<div class="encabezado" style="border: 1px solid black; padding: 2.5px; border-radius: 10px; width: 100%; position: relative;">
		<table class="table encabezado">
			<tr>
				<td class="text-right"><b>Código:</b></td>
				<td><?php echo $articulo->codigo?></td>
				<td class="text-right"><b>Fecha:</b></td>
				<td><?php echo formatoFecha(Hoy(), 2);?></td>
			</tr>
			<tr>
				<td class="text-right"><b>Categoría:</b></td>
				<td><?php echo "$articulo_grupo->descripcion ({$articulo_grupo->ncategoria})"?></td>
				<td class="text-right"><b>Nombre: </b></td>
				<td><?php echo $articulo->descripcion?></td>
			</tr>
			<tr>
				<td><b>Presentación:</b></td>
				<td><?php echo $presentacion_reporte->descripcion?></td>
				<td class="text-right"><b>Rendimiento: </b></td>
				<td><?php echo $articulo->rendimiento?></td>
			</tr>
		</table>
	</div><br>
	<table class="table">
		<?php if(!empty($advertir)): ?>
		<caption class="text-center">				
			<span style="color: red; font-weight: bold;">
				<?php echo $advertir; ?>
			</span>
		</caption>
		<?php endif ?>
		<thead>
			<tr>
				<th class="encabezado text-left">Código</th>
				<th class="encabezado text-left">Descripción</th>
				<th class="encabezado text-center" style="width: 7%;">Pro.</th>
				<th class="encabezado text-center" style="width: 7%;">Inv.</th>
				<th class="encabezado text-center" style="width: 7%;">Rec.</th>
				<th class="encabezado text-center">Cantidad</th>
				<th class="encabezado text-right">Costo U.</th>
				<th class="encabezado text-right">Total Q.</th>
			</tr>
		</thead>
		<tbody>
			<?php $total=0; foreach ($receta as $key => $row): $total+=$row->costo; ?>
				<tr>
					<td class="cuerpo text-left"><?php echo $row->articulo->codigo?></td>
					<td class="cuerpo text-left"><?php echo $row->articulo->descripcion?></td>
					<td class="cuerpo text-center"><?php echo (int)$row->articulo->produccion === 1 ? '&#10004;' : '';?></td>
					<td class="cuerpo text-center"><?php echo (int)$row->articulo->mostrar_inventario === 1 ? '&#10004;' : '';?></td>
					<td class="cuerpo text-center"><?php echo (int)$row->articulo->esreceta === 1 ? '&#10004;' : '';?></td>
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
			<!-- <tr>
				<td colspan="2"></td>
				<td colspan="2" class="encabezado btop text-right"><b>Costo Receta:</b></td>
				<td class="encabezado btop text-right"><?php #echo number_format($costo, 2)?></td>
			</tr> -->
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
	.btop {border-top: 1px solid black;}
</style>