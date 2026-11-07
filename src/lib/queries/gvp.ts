import { supabase } from '@/lib/supabase';
import type { GvpGrupoRow, GvpPapel } from '@/types/database';

export interface GvpGrupoMembro {
  id: string;
  nome: string;
  papel: GvpPapel;
  telZap: string | null;
}

export interface GvpGrupoHospital {
  id: string;
  nome: string;
}

export type GvpGrupo = GvpGrupoRow & {
  responsavel: GvpGrupoMembro | null;
  ajudantes: GvpGrupoMembro[];
  hospitais: GvpGrupoHospital[];
};

/** Grupos em ordem de número, com responsável, ajudantes e hospitais já montados. */
export async function listGvpGrupos(): Promise<GvpGrupo[]> {
  const [grupos, membros, hospitais] = await Promise.all([
    supabase.from('gvp_grupos').select('*').order('numero'),
    supabase.from('gvp_grupo_membros').select('grupo_id, papel, membro:membros!membro_id(id, nome, tel_zap)'),
    supabase.from('gvp_grupo_hospitais').select('grupo_id, hospital:hospitais!hospital_id(id, nome)'),
  ]);
  if (grupos.error) throw grupos.error;
  if (membros.error) throw membros.error;
  if (hospitais.error) throw hospitais.error;

  type MembroJoin = {
    grupo_id: string;
    papel: GvpPapel;
    membro: { id: string; nome: string; tel_zap: string | null } | null;
  };
  type HospitalJoin = { grupo_id: string; hospital: { id: string; nome: string } | null };
  const porNome = (a: { nome: string }, b: { nome: string }) => a.nome.localeCompare(b.nome, 'pt-BR');

  return (grupos.data ?? []).map((g) => {
    const doGrupo = ((membros.data ?? []) as unknown as MembroJoin[])
      .filter((m) => m.grupo_id === g.id && m.membro)
      .map((m) => ({
        id: m.membro!.id,
        nome: m.membro!.nome,
        papel: m.papel,
        telZap: m.membro!.tel_zap,
      }));
    return {
      ...g,
      responsavel: doGrupo.find((m) => m.papel === 'responsavel') ?? null,
      ajudantes: doGrupo.filter((m) => m.papel === 'ajudante').sort(porNome),
      hospitais: ((hospitais.data ?? []) as unknown as HospitalJoin[])
        .filter((h) => h.grupo_id === g.id && h.hospital)
        .map((h) => h.hospital!)
        .sort(porNome),
    };
  });
}

export interface SalvarGvpGrupo {
  id: string | null;
  numero: number;
  nome: string;
  observacoes: string;
  responsavelId: string | null;
  ajudanteIds: string[];
  hospitalIds: string[];
}

export async function salvarGvpGrupo(g: SalvarGvpGrupo): Promise<string> {
  const { data, error } = await supabase.rpc('salvar_gvp_grupo', {
    _id: g.id,
    _numero: g.numero,
    _nome: g.nome || null,
    _observacoes: g.observacoes || null,
    _responsavel: g.responsavelId,
    _ajudantes: g.ajudanteIds,
    _hospitais: g.hospitalIds,
  });
  if (error) throw error;
  return data;
}

/** Excluir o grupo solta os hospitais e os membros dele (a função "Membro GVP" fica). */
export async function excluirGvpGrupo(id: string): Promise<void> {
  const { error } = await supabase.from('gvp_grupos').delete().eq('id', id);
  if (error) throw error;
}
