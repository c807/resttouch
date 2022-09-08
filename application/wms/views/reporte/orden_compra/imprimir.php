<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Orden de Compra</title>
</head>

<body lang="es-GT" dir="ltr">
    <table class="tabla-contenido">
        <tr>
            <td class="text-center">
                <h2><?php echo $empresa ?></h2>
            </td>
        </tr>
        <tr>
            <td class="text-center">
                <h3><?php echo $sede . " ({$alias_sede})" ?></h3>
            </td>
        </tr>
        <tr>
            <td class="text-center">
                <h3>Orden de Compra</h3>
            </td>
        </tr>
        <tr>
            <td class="text-center">
                <h4>Impreso: <?php echo date('d/m/Y H:i:s'); ?></h4>
            </td>
        </tr>
    </table>
    <br />
    <table class="encabezado">
        <tr>
            <th class="text-right" style="width: 16.66%;">Número:</th>
            <td style="width: 16.67%;"><?php echo $orden_compra; ?></td>
            <th class="text-right" style="width: 16.66%;">Fecha:</th>
            <td style="width: 16.67%;"><?php echo $fecha_orden; ?></td>
            <th class="text-right" style="width: 16.66%;">Usuario:</th>
            <td style="width: 16.68%;"><?php echo $usuario; ?></td>
        </tr>

        <tr>
            <th class="text-right" style="width: 16.66%;">Proveedor:</th>
            <td colspan="5"><?php echo $proveedor; ?></td>
        </tr>
        
        <tr>
            <th class="text-right" style="width: 16.66%;">Estatus:</th>
            <td style="width: 16.67%;"><?php echo $estatus; ?></td>
            <th class="text-right" style="width: 16.66%;">Ingreso:</th>
            <td style="width: 16.68%;"><?php echo $ingreso; ?></td>            
        </tr>
        <tr>
            <th class="text-right">Notas:</th>
            <td colspan="5">
                <p><?php echo $notas; ?></p>
            </td>
        </tr>
    </table>
    <br />
    <table style="font-size: 10pt;">
        <thead>
            <tr>
                <th class="text-left" style="width: 12%; border-bottom: 1px solid black;">Código</th>
                <th class="text-left" style="width: 16.57%; border-bottom: 1px solid black;">Descripción</th>
                <th class="text-left" style="width: 14.29%; border-bottom: 1px solid black;">Presentación</th>
                <th class="text-right" style="width: 14.29%; border-bottom: 1px solid black;">Existencias*</th>
                <th class="text-right" style="width: 14.29%; border-bottom: 1px solid black;">Cantidad</th>
                <th class="text-right" style="width: 14.28%; border-bottom: 1px solid black;">Costo U.</th>
                <th class="text-right" style="width: 14.28%; border-bottom: 1px solid black;">Total</th>
            </tr>
        </thead>
        <tbody>
            <?php $montoTotal = 0; ?>
            <?php foreach ($detalle as $det) : ?>
                <tr>
                    <td><?php echo $det->codigo; ?></td>
                    <td><?php echo $det->articulo; ?></td>
                    <td><?php echo $det->presentacion; ?></td>
                    <td class="text-right"><?php echo number_format((float)$det->existencias, 2); ?></td>
                    <td class="text-right"><?php echo number_format((float)$det->cantidad, 2); ?></td>
                    <td class="text-right"><?php echo number_format((float)$det->monto, 2); ?></td>
                    <td class="text-right"><?php echo number_format((float)$det->total, 2); ?></td>
                </tr>
                <?php $montoTotal += (float)$det->total; ?>
            <?php endforeach; ?>
        </tbody>
    </table>
    <br />
    <table>
        <tr>
            <td class="text-right bld">Total: <?php echo number_format((float)$montoTotal, 2); ?></td>
        </tr>
        <tr>
            <td class="bld">*NOTA: Las existencias se calculan en base a todas las bodegas.</td>
        </tr>
    </table>    
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

    .encabezado {
        border: 1px solid black;
        border-radius: 1pt;
    }

    td {
        width: auto;
        border-collapse: collapse;
        border: 0px solid black;
    }

    .text-right {
        text-align: right;
    }

    .text-left {
        text-align: left;
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

    .bld {
        font-weight: bold;
    }
</style>