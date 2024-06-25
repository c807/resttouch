<!DOCTYPE html>
<html lang="es-GT">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
    <title>Reporte de Ventas por Habitación</title>
    <style>
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .bold { font-weight: bold; }
    </style>
</head>
<body lang="es-GT" dir="ltr">
    <div class="row">
        <div class="col-sm-12 text-center">
            <h3>Ventas por Habitación</h3>
        </div>
    </div>

    <div class="row">
        <div class="col-sm-12 text-center">
            <span><b>Del:</b> <?php echo $fdel; ?> <b>al:</b> <?php echo $fal; ?></span>
        </div>
    </div>
    <br />
    <div class="table-responsive">
        <table class="table table-bordered" style="padding: 5px">
            <thead>
                <tr>
					<th style="padding: 5px;" class="text-center">Sede</th>
                    <th style="padding: 5px;" class="text-center">Descripción</th>
                    <th style="padding: 5px;" class="text-center">Cantidad</th>
                    <th style="padding: 5px;" class="text-center">Precio</th>
                </tr>
            </thead>
            <tbody>
                <?php $totalGeneral = 0; ?>
                <?php foreach ($reservas as $reserva): ?>
                    <tr>
						<td style="padding: 5px;" class="text-center"><?php echo $reserva->sede; ?></td>
                        <td style="padding: 5px;" class="text-left"><?php echo $reserva->tipo_habitacion_descripcion; ?></td>
                        <td style="padding: 5px;" class="text-right"><?php echo number_format($reserva->cantidad, 2); ?></td>
                        <td style="padding: 5px;" class="text-right"><?php echo number_format($reserva->precio, 2); ?></td>
                    </tr>
                    <?php $totalGeneral += $reserva->precio; ?>
                <?php endforeach; ?>
            </tbody>
            <tfoot>
                <tr>
                    <td style="padding: 5px;" colspan="3" class="text-right bold"><b>Sub-total:</b></td>
                    <td style="padding: 5px;" class="text-right"><?php echo number_format($totalGeneral, 2); ?></td>
                </tr>
            </tfoot>
        </table>
    </div>
    <div>
        <span>NOTA: Reporte solo por habitaciones</span>
    </div>
</body>
</html>

