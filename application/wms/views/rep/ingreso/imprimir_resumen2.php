<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Resumen de Ingresos</title>
</head>
<body lang="es-GT" dir="ltr">
	<table class="table">
		<thead>
			<tr>
				<th colspan="8" class="encabezado text-center sborder"><h2>Resumen de ingresos</h2></th>
			</tr>
			<tr>
				<th colspan="8" class="encabezado text-center sborder">Del: <?php echo formatoFecha($params["fdel"], 2)?> Al: <?php echo formatoFecha($params["fal"], 2)?></th>
			</tr>
		</thead>
		<tbody>

			<?php foreach ($sedes as $cd => $tcd): ?>
				<tr>
					<th colspan="8" class="encabezado text-left sborder"><small>Bodega: <?php echo $tcd["bodega"]; ?></small></th>
				</tr>
				<tr>
					<th colspan="8" class="encabezado text-left sborder"><small>Sede: <?php echo $tcd["sede"]; ?></small></th>
				</tr>
				<tr>
					<td colspan="8"><br></td>
				</tr>

				<tr>
					<th class="encabezado text-center" colspan="2">Fecha</th>
					<th class="encabezado text-left" colspan="2">Documento</th>
					<th class="encabezado text-center" colspan="1">Estatus ingreso</th>
					<th class="encabezado text-center tipo" colspan="1">Tipo</th>
					<th class="encabezado text-center">Bodega</th>
					<th class="encabezado text-center"></th>
				</tr>

				<?php $total = 0; 

				foreach ($lista as $key => $row): ?>
					<?php if ($tcd["sede"] == $row->sede): ?>
					
						<tr>
							<td class="cuerpo text-center" colspan="2"><?php echo $row->fecha?></td>
							<td class="cuerpo text-left" colspan="2"><?php echo $row->numero?></td>
							<td class="cuerpo text-center" colspan="1"><?php echo $row->estatus?></td>
							<td class="cuerpo text-center tipo" colspan="1"><?php echo $row->tipo?></td>
							<td class="cuerpo text-center" colspan="2"><?php echo $row->bodega?></td>					
						</tr>
						<tr>
							<td class="encabezado cuerpo text-center"></td>
							<td class="encabezado cuerpo text-center"><b>Código</b></td>
							<td class="encabezado cuerpo text-left" colspan="2"><b>Artículo</b></td>
							<td class="encabezado cuerpo text-left" colspan="2"><b>Presentación</b></td>
							<td class="encabezado cuerpo text-right"><b>Cantidad</b></td>
							<td class="encabezado cuerpo text-right"><b>Total</b></td>
						</tr>
						<?php foreach ($row->detalle as $det): ?>
							<tr>
								<td class="cuerpo"><br></td>
								<td class="cuerpo text-center"><?php echo $det->codigo ?></td>
								<td class="cuerpo text-left" colspan="2"><?php echo $det->articulo ?></td>
								<td class="cuerpo text-left" colspan="2"><?php echo $det->presentacion?></td>
								<td class="cuerpo text-right"><?php echo number_format($det->cantidad, 2)?></td>
								<td class="cuerpo text-right"><?php echo number_format($det->costo_total_con_iva, 2)?></td>
							</tr>
						<?php endforeach ?>
						<tr class="total-documento">
							<td colspan="7" class="totales text-right sborder"><b>Total documento:</b></td>
							<td class="totales text-right sborder"><b><?php echo number_format($row->total, 2)?></b></td>
						</tr>
						<?php $total += $row->total; ?>
					<?php endif ?>
					<?php endforeach ?>
					<tr>
						<td colspan="7" class="totales text-right sborder"><b>GRAN TOTAL:</b></td>
						<td class="gtotal text-right"><b><?php echo number_format($total, 2)?></b></td>
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
	th {vertical-align: bottom; border-bottom: 1px solid black;}
	.encabezado { font-family: Arial, Helvetica, sans-serif; }
	.cuerpo { font-family: Arial, Helvetica, sans-serif; font-size: 11px;}
	.totales { vertical-align: middle; font-family: Arial, Helvetica, sans-serif; font-size: 11px; margin-bottom: 15px;}
	.gtotal { vertical-align: middle; border-top: 1px solid black; font-family: Arial, Helvetica, sans-serif; font-size: 11px;}
	.text-center {text-align: center;}
	.text-left {text-align: left;}
	.text-right {text-align: right;}
	.sborder {border: none;}
	.tipo {
		padding-right: 30px;
	}
</style>