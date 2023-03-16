<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
    <title>Historial de reservas</title>
    <style>
        .brd-tbl {
            border: solid 1px black;
            padding: 5px;            
        }
    </style>
</head>
<body lang="es-GT" dir="ltr">
    <div class="row">
        <div class="col-sm-12">
            <table style="width: 100%;">
                <tr>
                    <th><?php echo $empresa; ?></th>
                </tr>
                <tr>
                    <th><?php echo $sede; ?></th>
                </tr>
                <tr>
                    <th>Del: <?php echo $fdel; ?> al <?php echo $fal; ?></th>
                </tr>
                <tr>
                    <th>Total de reservas en el rango: <?php echo count($detalle) ?></th>
                </tr>
                <?php if ($topn > 0): ?>
                <tr>
                    <th>Se muestra el top <?php echo $topn; ?></th>
                </tr>
                <?php endif ?>
            </table>
        </div>
    </div>
    <br/>
    <div class="row">
        <div class="col-sm-12">
            <table style="width: 100%;">
                <tr>
                    <th colspan="3" class="text-center">RESERVABLES</th>
                </tr>
                <tr>
                    <th class="brd-tbl" style="width: 60%;">Reservable</th>
                    <th class="text-right brd-tbl" style="width: 20%;">Cantidad</th>
                    <th class="text-right brd-tbl" style="width: 20%;">Porcentaje</th>
                </tr>
                <?php foreach($resumen_reservables as $rr): ?>
                <tr>
                    <td class="brd-tbl"><?php echo $rr['reservable'] ?></td>
                    <td class="text-right brd-tbl"><?php echo number_format($rr['cantidad']) ?></td>
                    <td class="text-right brd-tbl"><?php echo number_format($rr['porcentaje'], 2) ?>%</td>
                </tr>
                <?php endforeach ?>
            </table>
        </div>
    </div>
    <hr/>
    <div class="row">
        <div class="col-sm-12">
            <table style="width: 100%;">
                <tr>
                    <th colspan="3" class="text-center">CLIENTES</th>
                </tr>
                <tr>
                    <th class="brd-tbl" style="width: 60%;">Cliente</th>
                    <th class="text-right brd-tbl" style="width: 20%;">Cantidad</th>
                    <th class="text-right brd-tbl" style="width: 20%;">Porcentaje</th>
                </tr>
                <?php foreach($resumen_clientes as $rc): ?>
                <tr>
                    <td class="brd-tbl"><?php echo $rc['cliente'] ?></td>
                    <td class="text-right brd-tbl"><?php echo number_format($rc['cantidad']) ?></td>
                    <td class="text-right brd-tbl"><?php echo number_format($rc['porcentaje'], 2) ?>%</td>
                </tr>
                <?php endforeach ?>
            </table>
        </div>
    </div>
    <hr/>
    <div class="row">
        <div class="clo-sm-12">
            <table style="width: 100%; font-size: 8pt;">
                <tr>
                    <th colspan="7" class="text-center">DETALLE</th>
                </tr>
                <tr>
                    <th style="width: 10%;" class="text-center brd-tbl">Del</th>
                    <th style="width: 10%;" class="text-center brd-tbl">Al</th>
                    <th style="width: 10%;" class="text-center brd-tbl">Reserva</th>
                    <th style="width: 20%;" class="brd-tbl">Ubicación</th>
                    <th style="width: 30%;" class="brd-tbl">Cliente</th>
                    <th style="width: 10%;" class="text-center brd-tbl">Adultos</th>
                    <th style="width: 10%;" class="text-center brd-tbl">Menores</th>                    
                </tr>
                <?php foreach($detalle as $det): ?>
                <tr>
                    <td class="text-center brd-tbl"><?php echo formatoFecha($det->fecha_del, 2) ?></td>
                    <td class="text-center brd-tbl"><?php echo formatoFecha($det->fecha_al, 2) ?></td>
                    <td class="text-center brd-tbl"><?php echo $det->reserva ?></td>
                    <td class="brd-tbl"><?php echo "{$det->area} - {$det->reservable}" ?></td>
                    <td class="brd-tbl"><?php echo $det->cliente ?></td>
                    <td class="text-center brd-tbl"><?php echo $det->cantidad_adultos ?></td>
                    <td class="text-center brd-tbl"><?php echo $det->cantidad_menores ?></td>
                </tr>
                <?php endforeach ?>
            </table>            
        </div>
    </div>
</body>