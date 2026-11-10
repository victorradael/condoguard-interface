"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { commitImport, previewImport } from "@/lib/api";
import { apiErrorMessage } from "@/lib/errors";
import { hasWriteRole } from "@/lib/session";
import type { ImportError, ImportPreviewResponse } from "@/types";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type Step = "upload" | "preview" | "done";

function ImportacaoPage() {
  const { user } = useAuth();
  const router = useRouter();
  const canWrite = hasWriteRole(user?.roles);

  const fileRef = useRef<HTMLInputElement>(null);
  const [csv, setCsv] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("upload");
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportPreviewResponse | null>(null);

  if (!canWrite) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-danger">
        Você não tem permissão para importar dados.
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setCsv(evt.target?.result as string);
    };
    reader.readAsText(file, "utf-8");
  };

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csv) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await previewImport(csv);
      setPreview(data);
      setStep("preview");
    } catch (err) {
      setError(apiErrorMessage(err, "Erro ao processar prévia do arquivo."));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!csv) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await commitImport(csv);
      setResult(data);
      setStep("done");
    } catch (err) {
      setError(apiErrorMessage(err, "Erro ao confirmar importação."));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCsv(null);
    setFileName(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setStep("upload");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Importação CSV</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Importe blocos, unidades, pessoas e vínculos de uma vez
        </p>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-danger">{error}</div>
      ) : null}

      {step === "upload" ? (
        <Card>
          <CardHeader>
            <CardTitle>Selecionar arquivo</CardTitle>
          </CardHeader>
          <form onSubmit={handlePreview} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="csv-file"
                className="mb-1 block text-sm font-medium text-text-secondary"
              >
                Arquivo CSV
              </label>
              <input
                id="csv-file"
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-text-secondary file:mr-4 file:rounded-md file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-accent-hover"
                required
              />
              {fileName ? (
                <p className="mt-1 text-xs text-text-muted">Arquivo: {fileName}</p>
              ) : null}
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={loading} disabled={!csv}>
                Visualizar prévia
              </Button>
            </div>
          </form>
        </Card>
      ) : step === "preview" && preview ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Prévia da importação</CardTitle>
            </CardHeader>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-text-muted">Linhas</dt>
                <dd className="font-semibold text-text-primary">{preview.rows}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Novos blocos</dt>
                <dd className="font-semibold text-text-primary">{preview.newBlocks}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Novas unidades</dt>
                <dd className="font-semibold text-text-primary">{preview.newUnits}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Novas pessoas</dt>
                <dd className="font-semibold text-text-primary">{preview.newPeople}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Novos vínculos</dt>
                <dd className="font-semibold text-text-primary">{preview.newLinks}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Sem alteração</dt>
                <dd className="font-semibold text-text-primary">{preview.unchanged}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Erros</dt>
                <dd
                  className={`font-semibold ${preview.errorCount > 0 ? "text-danger" : "text-text-primary"}`}
                >
                  {preview.errorCount}
                </dd>
              </div>
            </dl>
          </Card>

          {preview.errors.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-danger">Erros no arquivo</CardTitle>
              </CardHeader>
              <div className="mt-2 divide-y divide-border">
                {preview.errors.map((e: ImportError, i: number) => (
                  <div key={i} className="py-2 text-sm">
                    <span className="font-medium text-text-secondary">Linha {e.line}</span>
                    {e.field ? (
                      <span className="ml-1 text-text-muted">({e.field})</span>
                    ) : null}
                    <span className="ml-2 text-danger">{e.message}</span>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {preview.preview.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Linhas a processar{preview.truncated ? " (prévia parcial)" : ""}</CardTitle>
              </CardHeader>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-text-muted">
                      <th className="pb-2 pr-4 font-medium">Linha</th>
                      <th className="pb-2 pr-4 font-medium">Bloco</th>
                      <th className="pb-2 pr-4 font-medium">Unidade</th>
                      <th className="pb-2 pr-4 font-medium">Papel</th>
                      <th className="pb-2 pr-4 font-medium">Pessoa</th>
                      <th className="pb-2 font-medium">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {preview.preview.map((row, i) => (
                      <tr key={i} className={row.action === "error" ? "text-danger" : ""}>
                        <td className="py-1.5 pr-4 text-text-muted">{row.line}</td>
                        <td className="py-1.5 pr-4">{row.block ?? "—"}</td>
                        <td className="py-1.5 pr-4">{row.unit}</td>
                        <td className="py-1.5 pr-4">{row.kind ?? "—"}</td>
                        <td className="py-1.5 pr-4">{row.person ?? "—"}</td>
                        <td className="py-1.5 capitalize">{row.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null}

          <div className="flex justify-between gap-2">
            <Button variant="secondary" onClick={handleReset}>
              Escolher outro arquivo
            </Button>
            <Button
              onClick={handleConfirm}
              loading={loading}
              disabled={preview.errorCount > 0}
              title={preview.errorCount > 0 ? "Corrija os erros antes de confirmar" : undefined}
            >
              Confirmar importação
            </Button>
          </div>
        </>
      ) : step === "done" && result ? (
        <Card>
          <CardHeader>
            <CardTitle>Importação concluída</CardTitle>
          </CardHeader>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-text-muted">Blocos criados</dt>
              <dd className="font-semibold text-text-primary">{result.newBlocks}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Unidades criadas</dt>
              <dd className="font-semibold text-text-primary">{result.newUnits}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Pessoas criadas</dt>
              <dd className="font-semibold text-text-primary">{result.newPeople}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Vínculos criados</dt>
              <dd className="font-semibold text-text-primary">{result.newLinks}</dd>
            </div>
          </dl>
          <div className="mt-6 flex gap-2">
            <Button variant="secondary" onClick={handleReset}>
              Nova importação
            </Button>
            <Button onClick={() => router.push("/dashboard/unidades")}>
              Ver unidades
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

export default ImportacaoPage;
