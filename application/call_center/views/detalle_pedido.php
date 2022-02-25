<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
    <title>Detalle de Pedidos</title>
    <style>

        .mytb th, .mytb td{
            border: 1px solid black;
            padding: 5px;
        }
    </style>
</head>

<body lang="es-GT" dir="ltr">
<div class="row">
    <h5 style="font-weight: bold">Pedidos por sede</h5>

    <div style="display: flex;">

        <table >
            <tr>
                <td style="font-weight: bold">Del:</td>
                <td><?php echo formatoFecha($fdel, 2) ?></td>
            </tr>
            <tr>
                <td style="font-weight: bold">Al:</td>
                <td><?php echo formatoFecha($fal, 2) ?></td>
            </tr>

            <?php if ($tipoDName !== null): ?>
                <tr>
                    <td style="font-weight: bold">Tipo:</td>
                    <td><?php echo $tipoDName ?></td>
                </tr>
            <?php endif; ?>

            <?php if ($sedeNName !== null): ?>
                <tr>
                    <td style="font-weight: bold">Sede :</td>
                    <td><?php echo $sedeNName ?></td>
                </tr>
            <?php endif; ?>

            <tr>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
            </tr>
        </table>


    </div>

</div>
<div>

    <table class="mytb">
        <tr>
            <th><h5><b>Sede</b></h5></th>
            <th><h5><b>Pedido</b></h5></th>
            <th><h5><b>Monto</b></h5></th>
        </tr>

        <?php foreach ($forViewArr as $row) : ?>


            <tr>
                <td><?php echo $row['sede'] ?></td>
                <td></td>
                <td></td>
            </tr>

            <?php foreach ($row['pedidos'] as $pedidos) : ?>
                <tr>
                    <td></td>
                    <td><?php echo $pedidos->pedido ?></td>
                    <td style="text-align:right; "><?php echo $pedidos->monto ?></td>
                </tr>
            <?php endforeach ?>

            <tr>
                <td></td>
                <td style="font-weight: bold">Total&nbsp;</td>
                <td><?php echo number_format($row['total'],2) ?></td>
            </tr>
        <?php endforeach ?>

        <tr><td>&nbsp;</td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td></tr>

        <tr>
            <td></td>
            <td style="font-weight: bold; text-align:right; ">Total de venta&nbsp;</td>
            <td><?php echo number_format($totalDeVenta,2) ?></td>
        </tr>
        <tr>
            <td></td>
            <td style="font-weight: bold; text-align:right; ">Cantidad de pedidos&nbsp;</td>
            <td><?php echo $cantPedidos ?></td>
        </tr>
        <tr>
            <td></td>
            <td style="font-weight: bold; text-align:right; ">Consumo/Pedido&nbsp;</td>
            <td><?php echo $consumoP ?></td>
        </tr>

    </table>



</div>
</body>

</html>
