<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
    <title>Detalle de Pedidos</title>
</head>

<body lang="es-GT" dir="ltr">
<div class="row">
    <h5>Pedidos por sede</h5>
    <h5>
        <b>Del:</b>
        <?php echo formatoFecha($fdel, 2) ?>
        <b>al:</b>
        <?php echo formatoFecha($fal, 2) ?>
    </h5>
</div>
<div>

    <table>
        <tr>
            <th>Sede</th>
            <th>Pedido</th>
            <th>Monto</th>
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
                    <td><?php echo $pedidos->monto ?></td>
                </tr>
            <?php endforeach ?>
        <?php endforeach ?>

    </table>


</div>
</body>

</html>
