<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pedidos</title>
</head>

<body lang="es-GT" dir="ltr">
    <table class="tabla-contenido">
        <tr>
            <td class="text-center">
                <h2><?php echo $empresa->nombre; ?></h2>
            </td>
        </tr>
        <tr>
            <td class="text-center">
                <h3><?php echo $sede->nombre . " ({$sede->alias})"; ?></h3>
            </td>
        </tr>
        <tr>
            <td class="text-center">
                <h3>Lista de pedido de productos al <?php echo $fecha; ?></h3>
            </td>
        </tr>
        <tr>
            <td class="text-center">
                <h4>Bodega: <?php echo $bodega->descripcion; ?></h4>
            </td>
        </tr>
        <tr>
            <td class="text-center">
                <h4>Impreso: <?php echo date('d/m/Y H:i:s'); ?></h4>
            </td>
        </tr>
    </table>
    <br />
    <table>
        <tr>
            <td colspan="4" style="width: 57%;"></td>
            <td class="bld text-center brd-ultima-compra" style="width: 23%;" colspan="2">Ultima Compra</td>
            <td colspan="2" style="width: 20%;"></td>
        </tr>
        <tr>
            <td class="bld brd" style="width: 24%;">Descripcion</td>
            <td class="bld brd" style="width: 13%;">Presentación</td>
            <td class="bld brd text-right wtdnum">Mínimo</td>
            <td class="bld brd text-right wtdnum">Máximo</td>
            <td class="bld brd" style="width: 13%; padding-left: 5px;">Presentación</td>
            <td class="bld brd text-right wtdnum">Costo</td>
            <td class="bld brd text-right wtdnum">Existencia</td>
            <td class="bld brd text-right wtdnum">A pedir</td>
        </tr>
        <?php foreach ($pedidos as $pedido) : ?>
            <tr class="separador-fila">
                <td class="bld" colspan="8"><?php echo $pedido->proveedor; ?></td>
            </tr>
            <?php foreach ($pedido->productos as $producto) : ?>
                <?php if ($producto->mostrar === 1) : ?>
                    <tr>
                        <td class="separador-fila"><?php echo $producto->descripcion_articulo; ?></td>
                        <td class="separador-fila"><?php echo $producto->descripcion_presentacion; ?></td>
                        <td class="separador-fila text-right "><?php echo number_format((float)$producto->minimo, 2); ?></td>
                        <td class="separador-fila text-right"><?php echo number_format((float)$producto->maximo, 2); ?></td>
                        <td class="separador-fila" style="padding-left: 5px;"><?php echo $producto->descripcion_ultima_presentacion; ?></td>
                        <td class="separador-fila text-right"><?php echo number_format((float)$producto->ultimo_costo, 2); ?></td>
                        <td class="separador-fila text-right"><?php echo number_format($producto->existencia, 2); ?></td>
                        <td class="separador-fila text-right"><?php echo number_format($producto->a_pedir, 2); ?></td>
                    </tr>
                <?php endif; ?>
            <?php endforeach; ?>
        <?php endforeach; ?>
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

    .wtdnum {
        width: 10%;
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

    .brd {
        border-bottom: 1px solid black;
    }

    .brd-ultima-compra {
        border-left: 1px solid black;
        border-top: 1px solid black;
        border-right: 1px solid black;
    }

    .separador-fila {
        padding-top: 2.5px;
        padding-bottom: 2.5px;
    }
</style>