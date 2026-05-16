import React, { useState, useEffect, useRef } from "react";
import { supabaseApi } from "@/api/supabaseApi";
import { useCompany, clearCompanyCache } from "@/hooks/useCompany";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  User,
  Building,
  Save,
  Link,
  Palette,
  Image,
  Instagram,
  Phone,
  MapPin,
  AtSign,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { applyBrandVars } from "@/hooks/useBrand";

const CORES_SUGERIDAS = [
  "#f43f5e",
  "#ec4899",
  "#a855f7",
  "#8b5cf6",
  "#3b82f6",
  "#06b6d4",
  "#10b981",
  "#84cc16",
  "#f59e0b",
  "#ef4444",
  "#1e293b",
  "#0f172a",
];

export default function AppConfiguracoes() {
  const { salao, user, loading: loadingCompany } = useCompany();
  const [perfil, setPerfil] = useState({
    nome_salao: "",
    slug: "",
    telefone: "",
    email_salao: "",
    endereco: "",
    descricao: "",
    slogan: "",
    instagram: "",
    whatsapp: "",
    cor_primaria: "#f43f5e",
    cor_secundaria: "#fda4af",
    logo_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileRef = useRef();
  const { toast } = useToast();

  useEffect(() => {
    if (!salao) return;
    setPerfil({
      nome_salao: salao.nome_salao || "",
      slug: salao.slug || "",
      telefone: salao.telefone || "",
      email_salao: salao.email_salao || "",
      endereco: salao.endereco || "",
      descricao: salao.descricao || "",
      slogan: salao.slogan || "",
      instagram: salao.instagram || "",
      whatsapp: salao.whatsapp || "",
      cor_primaria: salao.cor_primaria || "#f43f5e",
      cor_secundaria: salao.cor_secundaria || "#fda4af",
      logo_url: salao.logo_url || "",
    });
  }, [salao?.id]);

  const save = async () => {
    if (!salao?.id) {
      toast({ title: "Salão não identificado", variant: "destructive" });
      return;
    }
    const slugNorm = perfil.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setSaving(true);
    const data = { ...perfil, slug: slugNorm };
    await supabaseApi.entities.Salao.update(salao.id, data);
    clearCompanyCache();
    setPerfil((p) => ({ ...p, slug: slugNorm }));
    applyBrandVars(perfil.cor_primaria, perfil.cor_secundaria);
    toast({ title: "Identidade visual salva!" });
    setSaving(false);
  };

  const uploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const { file_url } = await supabaseApi.integrations.Core.UploadFile({ file });
    setPerfil((p) => ({ ...p, logo_url: file_url }));
    setUploadingLogo(false);
    toast({ title: "Logo enviado!" });
  };

  const linkPublico = perfil.slug
    ? `${window.location.origin}/agendar/${perfil.slug}`
    : null;

  const copyLink = () => {
    if (!linkPublico) return;
    navigator.clipboard.writeText(linkPublico);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loadingCompany)
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div
          className="w-8 h-8 border-4 border-slate-200 rounded-full animate-spin"
          style={{ borderTopColor: "var(--company-primary, #f43f5e)" }}
        />
      </div>
    );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500 text-sm">
          Identidade visual e dados do seu salão
        </p>
      </div>

      {/* Conta */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User
              className="w-4 h-4"
              style={{ color: "var(--company-primary, #f43f5e)" }}
            />{" "}
            Minha Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {user && (
            <>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Nome
                </label>
                <Input
                  value={user.full_name || ""}
                  disabled
                  className="bg-slate-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  E-mail da conta
                </label>
                <Input
                  value={user.email || ""}
                  disabled
                  className="bg-slate-50 text-xs"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Identidade Visual */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette
              className="w-4 h-4"
              style={{ color: "var(--company-primary, #f43f5e)" }}
            />{" "}
            Identidade Visual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Logo do Salão
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 flex-shrink-0">
                {perfil.logo_url ? (
                  <img
                    src={perfil.logo_url}
                    alt="Logo"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <Image className="w-6 h-6 text-slate-300" />
                )}
              </div>
              <div className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingLogo}
                  className="text-xs"
                >
                  {uploadingLogo
                    ? "Enviando..."
                    : perfil.logo_url
                      ? "Trocar logo"
                      : "Fazer upload da logo"}
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={uploadLogo}
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  PNG ou JPG. Tamanho recomendado: 200×200px
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Cor Principal
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="color"
                  value={perfil.cor_primaria}
                  onChange={(e) =>
                    setPerfil((p) => ({ ...p, cor_primaria: e.target.value }))
                  }
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                />
                <Input
                  value={perfil.cor_primaria}
                  onChange={(e) =>
                    setPerfil((p) => ({ ...p, cor_primaria: e.target.value }))
                  }
                  className="text-xs font-mono"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {CORES_SUGERIDAS.slice(0, 6).map((c) => (
                  <button
                    key={c}
                    onClick={() =>
                      setPerfil((p) => ({ ...p, cor_primaria: c }))
                    }
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${perfil.cor_primaria === c ? "border-slate-700 scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Cor de Apoio
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="color"
                  value={perfil.cor_secundaria}
                  onChange={(e) =>
                    setPerfil((p) => ({ ...p, cor_secundaria: e.target.value }))
                  }
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                />
                <Input
                  value={perfil.cor_secundaria}
                  onChange={(e) =>
                    setPerfil((p) => ({ ...p, cor_secundaria: e.target.value }))
                  }
                  className="text-xs font-mono"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {CORES_SUGERIDAS.slice(6, 12).map((c) => (
                  <button
                    key={c}
                    onClick={() =>
                      setPerfil((p) => ({ ...p, cor_secundaria: c }))
                    }
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${perfil.cor_secundaria === c ? "border-slate-700 scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-3">Pré-visualização</p>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow"
                style={{ backgroundColor: perfil.cor_primaria }}
              >
                {perfil.logo_url ? (
                  <img
                    src={perfil.logo_url}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  perfil.nome_salao?.[0] || "S"
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {perfil.nome_salao || "Nome do Salão"}
                </p>
                {perfil.slogan && (
                  <p className="text-xs" style={{ color: perfil.cor_primaria }}>
                    {perfil.slogan}
                  </p>
                )}
              </div>
              <div className="ml-auto">
                <button
                  className="px-3 py-1.5 rounded-lg text-white text-xs font-medium"
                  style={{ backgroundColor: perfil.cor_primaria }}
                >
                  Agendar
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados do Salão */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building
              className="w-4 h-4"
              style={{ color: "var(--company-primary, #f43f5e)" }}
            />{" "}
            Dados do Salão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Nome do Salão
              </label>
              <Input
                placeholder="Ex: Studio Beleza Premium"
                value={perfil.nome_salao}
                onChange={(e) =>
                  setPerfil({ ...perfil, nome_salao: e.target.value })
                }
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Slogan / Subtítulo
              </label>
              <Input
                placeholder="Ex: Beleza que transforma"
                value={perfil.slogan}
                onChange={(e) =>
                  setPerfil({ ...perfil, slogan: e.target.value })
                }
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Descrição curta
              </label>
              <Input
                placeholder="Breve descrição do seu salão"
                value={perfil.descricao}
                onChange={(e) =>
                  setPerfil({ ...perfil, descricao: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5 block">
                <Phone className="w-3 h-3" />
                Telefone
              </label>
              <Input
                placeholder="(11) 99999-0000"
                value={perfil.telefone}
                onChange={(e) =>
                  setPerfil({ ...perfil, telefone: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5 block">
                <Phone className="w-3 h-3 text-green-500" />
                WhatsApp
              </label>
              <Input
                placeholder="(11) 99999-0000"
                value={perfil.whatsapp}
                onChange={(e) =>
                  setPerfil({ ...perfil, whatsapp: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5 block">
                <AtSign className="w-3 h-3" />
                E-mail público
              </label>
              <Input
                type="email"
                placeholder="contato@seusalao.com"
                value={perfil.email_salao}
                onChange={(e) =>
                  setPerfil({ ...perfil, email_salao: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5 block">
                <Instagram className="w-3 h-3" />
                Instagram
              </label>
              <Input
                placeholder="@seusalao"
                value={perfil.instagram}
                onChange={(e) =>
                  setPerfil({ ...perfil, instagram: e.target.value })
                }
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5 block">
                <MapPin className="w-3 h-3" />
                Endereço
              </label>
              <Input
                placeholder="Rua, número, bairro, cidade"
                value={perfil.endereco}
                onChange={(e) =>
                  setPerfil({ ...perfil, endereco: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Link Público */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Link
              className="w-4 h-4"
              style={{ color: "var(--company-primary, #f43f5e)" }}
            />{" "}
            Link de Agendamento Público
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Slug do Salão
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 flex-shrink-0 bg-slate-50 border rounded-l-lg px-3 py-2">
                /agendar/
              </span>
              <Input
                placeholder="meu-salao"
                value={perfil.slug}
                onChange={(e) => setPerfil({ ...perfil, slug: e.target.value })}
                className="rounded-l-none"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Apenas letras minúsculas, números e hífens.
            </p>
          </div>
          {linkPublico && (
            <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
              <p className="text-xs font-mono text-slate-600 flex-1 truncate">
                {linkPublico}
              </p>
              <button
                onClick={copyLink}
                className="p-1.5 rounded-lg hover:bg-white border transition-colors flex-shrink-0"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
              <a
                href={linkPublico}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg hover:bg-white border transition-colors flex-shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={save}
        disabled={saving}
        className="text-white h-11 px-6"
        style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
      >
        <Save className="w-4 h-4 mr-2" />
        {saving ? "Salvando..." : "Salvar Identidade Visual"}
      </Button>
    </div>
  );
}
