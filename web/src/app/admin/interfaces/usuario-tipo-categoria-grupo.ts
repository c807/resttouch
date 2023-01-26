import { UsuarioTipoJerarquia } from './usuario-tipo';
import { CategoriaGrupo } from '@wms-interfaces/categoria-grupo';

export interface UsuarioTipoCategoriaGrupo {
    usuario_tipo_categoria_grupo: number;
    usuario_tipo: number;
    categoria_grupo: number;
    debaja: number;
}

export interface UsuarioTipoCGrupo {
    usuario_tipo_categoria_grupo: number;
    usuario_tipo: UsuarioTipoJerarquia;
    categoria_grupo: CategoriaGrupo;
}
