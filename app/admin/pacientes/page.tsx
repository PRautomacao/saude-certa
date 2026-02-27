'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, User, Phone, Mail, Edit2, Trash2, ChevronRight, Loader2 } from 'lucide-react';
import { getPacientes, upsertPaciente, inativarPaciente } from '@/lib/supabase/queries/pacientes';
import { formatPhone, formatCPF } from '@/lib/utils';
import type { Paciente } from '@/types';

function Modal({
  paciente, onClose, onSave,
}: { paciente?: Partial<Paciente>; onClose: () => void; onSave: (p: Partial<Paciente>) => void }) {
  const [form, setForm] = useState<Partial<Paciente>>(paciente ?? { status: 'ativo' });
  const [saving, setSaving] = useState(false);

  function update(field: keyof Paciente, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (err) { alert('Erro ao salvar. Tente novamente.'); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">{paciente?.id ? 'Editar Paciente' : 'Novo Paciente'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Nome Completo *</label>
              <input className="input" required value={form.nome ?? ''} onChange={(e) => update('nome', e.target.value)} placeholder="Ex: Maria da Silva" />
            </div>
            <div>
              <label className="label">CPF</label>
              <input className="input" value={form.cpf ?? ''} onChange={(e) => update('cpf', e.target.value)} placeholder="000.000.000-00" maxLength={14} />
            </div>
            <div>
              <label className="label">Data de Nascimento</label>
              <input className="input" type="date" value={form.data_nascimento ?? ''} onChange={(e) => update('data_nascimento', e.target.value)} />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input className="input" value={form.telefone ?? ''} onChange={(e) => update('telefone', e.target.value)} placeholder="(64) 99999-9999" />
            </div>
            <div>
              <label className="label">E-mail</label>
              <input className="input" type="email" value={form.email ?? ''} onChange={(e) => update('email', e.target.value)} placeholder="email@exemplo.com" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Endereço</label>
              <input className="input" value={form.endereco ?? ''} onChange={(e) => update('endereco', e.target.value)} placeholder="Rua, número, bairro, cidade" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Histórico Odontológico</label>
              <textarea className="input min-h-20 resize-none" value={form.historico_odontologico ?? ''} onChange={(e) => update('historico_odontologico', e.target.value)} placeholder="Tratamentos anteriores, alergias, medicamentos..." />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Observações</label>
              <textarea className="input min-h-16 resize-none" value={form.observacoes ?? ''} onChange={(e) => update('observacoes', e.target.value)} placeholder="Anotações adicionais..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {paciente?.id ? 'Salvar alterações' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Partial<Paciente> | undefined>();

  const load = useCallback(async () => {
    setLoading(true);
    try { setPacientes(await getPacientes(search || undefined)); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  async function handleSave(p: Partial<Paciente>) {
    await upsertPaciente(p);
    await load();
  }

  async function handleInativar(id: string) {
    if (!confirm('Deseja inativar este paciente?')) return;
    await inativarPaciente(id);
    await load();
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-header">Pacientes</h1>
          <p className="page-subtitle">{pacientes.length} paciente{pacientes.length !== 1 ? 's' : ''} ativo{pacientes.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setEditando(undefined); setModalOpen(true); }} className="btn-primary flex items-center gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Novo Paciente
        </button>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          className="input pl-10"
          placeholder="Buscar por nome, CPF ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="table-header text-left px-4 py-3">Paciente</th>
                <th className="table-header text-left px-4 py-3 hidden md:table-cell">Telefone</th>
                <th className="table-header text-left px-4 py-3 hidden lg:table-cell">E-mail</th>
                <th className="table-header text-left px-4 py-3 hidden sm:table-cell">Status</th>
                <th className="table-header text-right px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-500" />
                  </td>
                </tr>
              ) : pacientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground">
                    <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhum paciente encontrado</p>
                  </td>
                </tr>
              ) : (
                pacientes.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-semibold text-sm shrink-0">
                          {p.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-foreground">{p.nome}</div>
                          {p.cpf && <div className="text-xs text-muted-foreground">{formatCPF(p.cpf)}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-muted-foreground">
                      {p.telefone ? (
                        <a href={`tel:${p.telefone}`} className="flex items-center gap-1.5 hover:text-brand-600 transition-colors">
                          <Phone className="w-3.5 h-3.5" />
                          {formatPhone(p.telefone)}
                        </a>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground">
                      {p.email ? (
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          {p.email}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`badge ${p.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditando(p); setModalOpen(true); }}
                          className="p-1.5 rounded-md hover:bg-brand-50 text-muted-foreground hover:text-brand-600 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleInativar(p.id)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                          title="Inativar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <Modal
          paciente={editando}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
