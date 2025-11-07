import { FormEvent, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Plus, Trash2, Database, Loader2 } from "lucide-react";
import { DashboardData, SupportBugEntry } from "@/lib/dashboard-data";
import { useDashboardData } from "@/contexts/dashboard-data-context";

function ensureNumber(value: string, fallback = 0) {
  if (value === "") {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export default function DataPage() {
  const { data, updateData, isLoading } = useDashboardData();
  const [formData, setFormData] = useState<DashboardData>(data);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleCardChange = (
    card: keyof DashboardData["cards"],
    field: keyof DashboardData["cards"][typeof card],
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      cards: {
        ...prev.cards,
        [card]: {
          ...prev.cards[card],
          [field]: value,
        } as DashboardData["cards"][typeof card],
      },
    }));
  };

  const handleCrisisChange = (
    index: number,
    field: "month" | "count",
    value: string,
  ) => {
    setFormData((prev) => {
      const crisisManagement = [...prev.charts.crisisManagement];
      if (field === "month") {
        crisisManagement[index] = {
          ...crisisManagement[index],
          month: value,
        };
      } else {
        crisisManagement[index] = {
          ...crisisManagement[index],
          count: ensureNumber(value),
        };
      }
      return {
        ...prev,
        charts: {
          ...prev.charts,
          crisisManagement,
        },
      };
    });
  };

  const addCrisisRow = () => {
    setFormData((prev) => ({
      ...prev,
      charts: {
        ...prev.charts,
        crisisManagement: [
          ...prev.charts.crisisManagement,
          { month: "", count: 0 },
        ],
      },
    }));
  };

  const removeCrisisRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      charts: {
        ...prev.charts,
        crisisManagement: prev.charts.crisisManagement.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSquadsChange = (value: string) => {
    const squads = value
      .split(",")
      .map((squad) => squad.trim())
      .filter(Boolean);

    setFormData((prev) => ({
      ...prev,
      charts: {
        ...prev.charts,
        irProjects: {
          squads,
          data: prev.charts.irProjects.data.map((entry) => {
            const values: Record<string, number> = {};
            squads.forEach((squad) => {
              values[squad] = entry.values[squad] ?? 0;
            });
            return {
              ...entry,
              values,
            };
          }),
        },
      },
    }));
  };

  const handleIRDataChange = (
    index: number,
    squad: string | undefined,
    field: "month" | "value",
    value: string,
  ) => {
    setFormData((prev) => {
      const dataEntries = [...prev.charts.irProjects.data];
      if (field === "month") {
        dataEntries[index] = {
          ...dataEntries[index],
          month: value,
        };
      } else {
        if (!squad) {
          return prev;
        }
        dataEntries[index] = {
          ...dataEntries[index],
          values: {
            ...dataEntries[index].values,
            [squad]: ensureNumber(value),
          },
        };
      }
      return {
        ...prev,
        charts: {
          ...prev.charts,
          irProjects: {
            squads: prev.charts.irProjects.squads,
            data: dataEntries,
          },
        },
      };
    });
  };

  const addIRRow = () => {
    setFormData((prev) => {
      const values: Record<string, number> = {};
      prev.charts.irProjects.squads.forEach((squad) => {
        values[squad] = 0;
      });
      return {
        ...prev,
        charts: {
          ...prev.charts,
          irProjects: {
            squads: prev.charts.irProjects.squads,
            data: [
              ...prev.charts.irProjects.data,
              { month: "", values },
            ],
          },
        },
      };
    });
  };

  const removeIRRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      charts: {
        ...prev.charts,
        irProjects: {
          squads: prev.charts.irProjects.squads,
          data: prev.charts.irProjects.data.filter((_, i) => i !== index),
        },
      },
    }));
  };

  const handleMonthlyTrackingChange = (
    index: number,
    field: keyof DashboardData["charts"]["monthlyTracking"][number],
    value: string,
  ) => {
    setFormData((prev) => {
      const monthlyTracking = [...prev.charts.monthlyTracking];
      monthlyTracking[index] = {
        ...monthlyTracking[index],
        [field]: field === "month" ? value : ensureNumber(value),
      };
      return {
        ...prev,
        charts: {
          ...prev.charts,
          monthlyTracking,
        },
      };
    });
  };

  const addMonthlyTrackingRow = () => {
    setFormData((prev) => ({
      ...prev,
      charts: {
        ...prev.charts,
        monthlyTracking: [
          ...prev.charts.monthlyTracking,
          { month: "", bugs: 0, issues: 0 },
        ],
      },
    }));
  };

  const removeMonthlyTrackingRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      charts: {
        ...prev.charts,
        monthlyTracking: prev.charts.monthlyTracking.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSupportBugChange = (
    index: number,
    field: keyof SupportBugEntry,
    value: string,
  ) => {
    setFormData((prev) => {
      const supportBugs = [...prev.charts.supportBugs];
      supportBugs[index] = {
        ...supportBugs[index],
        [field]: field === "month" ? value : ensureNumber(value),
      };
      return {
        ...prev,
        charts: {
          ...prev.charts,
          supportBugs,
        },
      };
    });
  };

  const addSupportBugRow = () => {
    setFormData((prev) => ({
      ...prev,
      charts: {
        ...prev.charts,
        supportBugs: [
          ...prev.charts.supportBugs,
          { month: "", score0: 0, score1: 0, score2: 0, score3: 0, score4: 0 },
        ],
      },
    }));
  };

  const removeSupportBugRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      charts: {
        ...prev.charts,
        supportBugs: prev.charts.supportBugs.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSquadBugChange = (
    index: number,
    field: keyof DashboardData["squadBugs"][number],
    value: string,
  ) => {
    setFormData((prev) => {
      const squadBugs = [...prev.squadBugs];
      squadBugs[index] = {
        ...squadBugs[index],
        [field]: field === "squad" || field === "status" || field === "trend" 
          ? value 
          : ensureNumber(value),
      } as DashboardData["squadBugs"][number];
      return {
        ...prev,
        squadBugs,
      };
    });
  };

  const addSquadBugRow = () => {
    setFormData((prev) => ({
      ...prev,
      squadBugs: [
        ...prev.squadBugs,
        { squad: "", currentMonth: 0, previousMonth: 0, status: "warning" as const, trend: "+0%" },
      ],
    }));
  };

  const removeSquadBugRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      squadBugs: prev.squadBugs.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await updateData(formData);
      toast.success("Base Dashboard salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar dados do dashboard", error);
      const message =
        error instanceof Error ? error.message : "Não foi possível salvar os dados.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Database className="h-7 w-7 text-primary" />
            Base Dashboard
          </h1>
          <p className="text-muted-foreground">
            Preencha manualmente os valores que serão exibidos no dashboard.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          aria-busy={isLoading || isSaving}
        >
          <fieldset disabled={isLoading || isSaving} className="space-y-6">
            <Card className="p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Cards</h2>
              <p className="text-muted-foreground text-sm">
                Ajuste os valores e descrições exibidos nos cards principais do dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bugs Críticos</Label>
                <Input
                  value={formData.cards.criticalBugs.value}
                  onChange={(event) =>
                    handleCardChange("criticalBugs", "value", event.target.value)
                  }
                  placeholder="Valor"
                />
                <Input
                  value={formData.cards.criticalBugs.subtitle}
                  onChange={(event) =>
                    handleCardChange("criticalBugs", "subtitle", event.target.value)
                  }
                  placeholder="Subtítulo"
                />
                <Input
                  value={formData.cards.criticalBugs.monthComparison ?? ""}
                  onChange={(event) =>
                    handleCardChange("criticalBugs", "monthComparison", event.target.value)
                  }
                  placeholder="Comparação vs mês anterior (ex: +5%)"
                />
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.cards.criticalBugs.status ?? "warning"}
                  onChange={(event) =>
                    handleCardChange("criticalBugs", "status", event.target.value)
                  }
                >
                  <option value="critical">Crítico</option>
                  <option value="warning">Atenção</option>
                  <option value="success">Excelente</option>
                </select>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.cards.criticalBugs.isKR ?? false}
                    onChange={(event) =>
                      handleCardChange("criticalBugs", "isKR", event.target.checked)
                    }
                    className="h-4 w-4 rounded border-input"
                  />
                  É Key Result (KR)
                </label>
              </div>

              <div className="space-y-2">
                <Label>Retenção de Bugs</Label>
                <Input
                  value={formData.cards.bugRetention.value}
                  onChange={(event) =>
                    handleCardChange("bugRetention", "value", event.target.value)
                  }
                  placeholder="Valor"
                />
                <Input
                  value={formData.cards.bugRetention.subtitle}
                  onChange={(event) =>
                    handleCardChange("bugRetention", "subtitle", event.target.value)
                  }
                  placeholder="Subtítulo"
                />
                <Input
                  value={formData.cards.bugRetention.monthComparison ?? ""}
                  onChange={(event) =>
                    handleCardChange("bugRetention", "monthComparison", event.target.value)
                  }
                  placeholder="Comparação vs mês anterior (ex: +10%)"
                />
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.cards.bugRetention.status ?? "warning"}
                  onChange={(event) =>
                    handleCardChange("bugRetention", "status", event.target.value)
                  }
                >
                  <option value="critical">Crítico</option>
                  <option value="warning">Atenção</option>
                  <option value="success">Excelente</option>
                </select>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.cards.bugRetention.isKR ?? false}
                    onChange={(event) =>
                      handleCardChange("bugRetention", "isKR", event.target.checked)
                    }
                    className="h-4 w-4 rounded border-input"
                  />
                  É Key Result (KR)
                </label>
              </div>

              <div className="space-y-2">
                <Label>Bugs por Usuário</Label>
                <Input
                  value={formData.cards.bugsPerUser.value}
                  onChange={(event) =>
                    handleCardChange("bugsPerUser", "value", event.target.value)
                  }
                  placeholder="Valor"
                />
                <Input
                  value={formData.cards.bugsPerUser.subtitle}
                  onChange={(event) =>
                    handleCardChange("bugsPerUser", "subtitle", event.target.value)
                  }
                  placeholder="Subtítulo"
                />
                <Input
                  value={formData.cards.bugsPerUser.goal}
                  onChange={(event) =>
                    handleCardChange("bugsPerUser", "goal", event.target.value)
                  }
                  placeholder="Meta"
                />
                <Input
                  value={formData.cards.bugsPerUser.trend}
                  onChange={(event) =>
                    handleCardChange("bugsPerUser", "trend", event.target.value)
                  }
                  placeholder="Tendência"
                />
                <Input
                  value={formData.cards.bugsPerUser.monthComparison ?? ""}
                  onChange={(event) =>
                    handleCardChange("bugsPerUser", "monthComparison", event.target.value)
                  }
                  placeholder="Comparação vs mês anterior (ex: -3%)"
                />
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.cards.bugsPerUser.status ?? "warning"}
                  onChange={(event) =>
                    handleCardChange("bugsPerUser", "status", event.target.value)
                  }
                >
                  <option value="critical">Crítico</option>
                  <option value="warning">Atenção</option>
                  <option value="success">Excelente</option>
                </select>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.cards.bugsPerUser.isKR ?? false}
                    onChange={(event) =>
                      handleCardChange("bugsPerUser", "isKR", event.target.checked)
                    }
                    className="h-4 w-4 rounded border-input"
                  />
                  É Key Result (KR)
                </label>
              </div>

              <div className="space-y-2">
                <Label>Eficiência</Label>
                <Input
                  value={formData.cards.efficiency.value}
                  onChange={(event) =>
                    handleCardChange("efficiency", "value", event.target.value)
                  }
                />
                <Input
                  value={formData.cards.efficiency.subtitle}
                  onChange={(event) =>
                    handleCardChange("efficiency", "subtitle", event.target.value)
                  }
                  placeholder="Subtítulo"
                />
                <Input
                  value={formData.cards.efficiency.goal}
                  onChange={(event) =>
                    handleCardChange("efficiency", "goal", event.target.value)
                  }
                  placeholder="Meta"
                />
                <Input
                  value={formData.cards.efficiency.trend ?? ""}
                  onChange={(event) =>
                    handleCardChange("efficiency", "trend", event.target.value)
                  }
                  placeholder="Tendência"
                />
                <Input
                  type="number"
                  value={formData.cards.efficiency.progress ?? 0}
                  onChange={(event) =>
                    handleCardChange(
                      "efficiency",
                      "progress",
                      ensureNumber(event.target.value, 0),
                    )
                  }
                  placeholder="Progresso (%)"
                />
              </div>

              <div className="space-y-2">
                <Label>Backlog Refinado</Label>
                <Input
                  value={formData.cards.refinedBacklog.value}
                  onChange={(event) =>
                    handleCardChange("refinedBacklog", "value", event.target.value)
                  }
                />
                <Input
                  value={formData.cards.refinedBacklog.subtitle}
                  onChange={(event) =>
                    handleCardChange("refinedBacklog", "subtitle", event.target.value)
                  }
                  placeholder="Subtítulo"
                />
                <Input
                  value={formData.cards.refinedBacklog.goal}
                  onChange={(event) =>
                    handleCardChange("refinedBacklog", "goal", event.target.value)
                  }
                  placeholder="Meta"
                />
                <Input
                  type="number"
                  value={formData.cards.refinedBacklog.progress ?? 0}
                  onChange={(event) =>
                    handleCardChange(
                      "refinedBacklog",
                      "progress",
                      ensureNumber(event.target.value, 0),
                    )
                  }
                  placeholder="Progresso (%)"
                />
              </div>

              <div className="space-y-2">
                <Label>Code Coverage API</Label>
                <Input
                  value={formData.cards.codeCoverage.value}
                  onChange={(event) =>
                    handleCardChange("codeCoverage", "value", event.target.value)
                  }
                />
                <Input
                  value={formData.cards.codeCoverage.subtitle}
                  onChange={(event) =>
                    handleCardChange("codeCoverage", "subtitle", event.target.value)
                  }
                  placeholder="Subtítulo"
                />
                <Input
                  value={formData.cards.codeCoverage.goal}
                  onChange={(event) =>
                    handleCardChange("codeCoverage", "goal", event.target.value)
                  }
                  placeholder="Meta"
                />
                <Input
                  value={formData.cards.codeCoverage.trend ?? ""}
                  onChange={(event) =>
                    handleCardChange("codeCoverage", "trend", event.target.value)
                  }
                  placeholder="Tendência"
                />
                <Input
                  type="number"
                  value={formData.cards.codeCoverage.progress ?? 0}
                  onChange={(event) =>
                    handleCardChange(
                      "codeCoverage",
                      "progress",
                      ensureNumber(event.target.value, 0),
                    )
                  }
                  placeholder="Progresso (%)"
                />
              </div>

              <div className="space-y-2">
                <Label>Disponibilidade</Label>
                <Input
                  value={formData.cards.availability.value}
                  onChange={(event) =>
                    handleCardChange("availability", "value", event.target.value)
                  }
                />
                <Input
                  value={formData.cards.availability.subtitle}
                  onChange={(event) =>
                    handleCardChange("availability", "subtitle", event.target.value)
                  }
                  placeholder="Subtítulo"
                />
                <Input
                  type="number"
                  value={formData.cards.availability.progress ?? 0}
                  onChange={(event) =>
                    handleCardChange(
                      "availability",
                      "progress",
                      ensureNumber(event.target.value, 0),
                    )
                  }
                  placeholder="Progresso (%)"
                />
              </div>

              <div className="space-y-2">
                <Label>MTTR</Label>
                <Input
                  value={formData.cards.mttr.value}
                  onChange={(event) =>
                    handleCardChange("mttr", "value", event.target.value)
                  }
                />
                <Input
                  value={formData.cards.mttr.subtitle}
                  onChange={(event) =>
                    handleCardChange("mttr", "subtitle", event.target.value)
                  }
                  placeholder="Subtítulo"
                />
              </div>

              <div className="space-y-2">
                <Label>Iniciativas Técnicas</Label>
                <Input
                  value={formData.cards.technicalInitiatives.value}
                  onChange={(event) =>
                    handleCardChange("technicalInitiatives", "value", event.target.value)
                  }
                />
                <Input
                  value={formData.cards.technicalInitiatives.subtitle}
                  onChange={(event) =>
                    handleCardChange("technicalInitiatives", "subtitle", event.target.value)
                  }
                  placeholder="Subtítulo"
                />
                <Input
                  value={formData.cards.technicalInitiatives.goal}
                  onChange={(event) =>
                    handleCardChange("technicalInitiatives", "goal", event.target.value)
                  }
                  placeholder="Meta"
                />
                <Input
                  value={formData.cards.technicalInitiatives.trend ?? ""}
                  onChange={(event) =>
                    handleCardChange("technicalInitiatives", "trend", event.target.value)
                  }
                  placeholder="Tendência"
                />
                <Input
                  type="number"
                  value={formData.cards.technicalInitiatives.progress ?? 0}
                  onChange={(event) =>
                    handleCardChange(
                      "technicalInitiatives",
                      "progress",
                      ensureNumber(event.target.value, 0),
                    )
                  }
                  placeholder="Progresso (%)"
                />
              </div>
            </div>
            </Card>

            <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Gestão de Crises</h2>
                <p className="text-muted-foreground text-sm">
                  Informe os meses e quantidades de crises. O último mês será destacado no dashboard.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={addCrisisRow}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar linha
              </Button>
            </div>

            <div className="space-y-4">
              {formData.charts.crisisManagement.map((entry, index) => (
                <div key={`crisis-${index}`} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="md:col-span-2 space-y-2">
                    <Label>Mês</Label>
                    <Input
                      value={entry.month}
                      onChange={(event) =>
                        handleCrisisChange(index, "month", event.target.value)
                      }
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      value={entry.count}
                      onChange={(event) =>
                        handleCrisisChange(index, "count", event.target.value)
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeCrisisRow(index)}
                      disabled={formData.charts.crisisManagement.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            </Card>

            <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">IR em Projetos por Squad</h2>
                <p className="text-muted-foreground text-sm">
                  Defina os squads e os valores por mês para o indicador de resposta.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={addIRRow}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar linha
              </Button>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Squads (separados por vírgula)</Label>
                <Input
                  value={formData.charts.irProjects.squads.join(", ")}
                  onChange={(event) => handleSquadsChange(event.target.value)}
                  placeholder="Ex: Controladoria, RH, Empresarial"
                />
              </div>

              {formData.charts.irProjects.data.map((entry, index) => (
                <div key={`ir-${index}`} className="border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Mês</Label>
                      <Input
                        value={entry.month}
                        onChange={(event) =>
                          handleIRDataChange(index, undefined, "month", event.target.value)
                        }
                      />
                    </div>
                    <div className="flex items-end md:justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeIRRow(index)}
                        disabled={formData.charts.irProjects.data.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {formData.charts.irProjects.squads.map((squad) => (
                      <div key={`${index}-${squad}`} className="space-y-2">
                        <Label>{squad}</Label>
                        <Input
                          type="number"
                          value={entry.values[squad] ?? 0}
                          onChange={(event) =>
                            handleIRDataChange(index, squad, "value", event.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            </Card>

            <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Acompanhamento Mensal</h2>
                <p className="text-muted-foreground text-sm">
                  Informe as quantidades de bugs e issues por mês.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={addMonthlyTrackingRow}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar linha
              </Button>
            </div>

            <div className="space-y-4">
              {formData.charts.monthlyTracking.map((entry, index) => (
                <div key={`monthly-${index}`} className="grid grid-cols-1 md:grid-cols-7 gap-3">
                  <div className="md:col-span-3 space-y-2">
                    <Label>Mês</Label>
                    <Input
                      value={entry.month}
                      onChange={(event) =>
                        handleMonthlyTrackingChange(index, "month", event.target.value)
                      }
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Bugs</Label>
                    <Input
                      type="number"
                      value={entry.bugs}
                      onChange={(event) =>
                        handleMonthlyTrackingChange(index, "bugs", event.target.value)
                      }
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Issues</Label>
                    <Input
                      type="number"
                      value={entry.issues}
                      onChange={(event) =>
                        handleMonthlyTrackingChange(index, "issues", event.target.value)
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeMonthlyTrackingRow(index)}
                      disabled={formData.charts.monthlyTracking.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            </Card>

            <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Bugs em Sustentação por Squad</h2>
                <p className="text-muted-foreground text-sm">
                  Informe a quantidade de bugs em sustentação por squad, comparando mês atual vs anterior.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={addSquadBugRow}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar squad
              </Button>
            </div>

            <div className="space-y-4">
              {formData.squadBugs.map((entry, index) => (
                <div key={`squad-bug-${index}`} className="border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="space-y-2">
                      <Label>Squad</Label>
                      <Input
                        value={entry.squad}
                        onChange={(event) =>
                          handleSquadBugChange(index, "squad", event.target.value)
                        }
                        placeholder="Nome do Squad"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mês Atual</Label>
                      <Input
                        type="number"
                        value={entry.currentMonth}
                        onChange={(event) =>
                          handleSquadBugChange(index, "currentMonth", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mês Anterior</Label>
                      <Input
                        type="number"
                        value={entry.previousMonth}
                        onChange={(event) =>
                          handleSquadBugChange(index, "previousMonth", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={entry.status}
                        onChange={(event) =>
                          handleSquadBugChange(index, "status", event.target.value)
                        }
                      >
                        <option value="critical">Crítico</option>
                        <option value="warning">Atenção</option>
                        <option value="success">Excelente</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tendência</Label>
                      <Input
                        value={entry.trend}
                        onChange={(event) =>
                          handleSquadBugChange(index, "trend", event.target.value)
                        }
                        placeholder="Ex: +10% ou -5%"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeSquadBugRow(index)}
                      disabled={formData.squadBugs.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            </Card>

            <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Cards de Bugs em Sustentação</h2>
                <p className="text-muted-foreground text-sm">
                  Informe a quantidade de bugs por score para cada mês.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={addSupportBugRow}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar linha
              </Button>
            </div>

            <div className="space-y-4">
              {formData.charts.supportBugs.map((entry, index) => (
                <div key={`support-${index}`} className="border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Mês</Label>
                      <Input
                        value={entry.month}
                        onChange={(event) =>
                          handleSupportBugChange(index, "month", event.target.value)
                        }
                      />
                    </div>
                    <div className="flex items-end md:justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeSupportBugRow(index)}
                        disabled={formData.charts.supportBugs.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    {["score0", "score1", "score2", "score3", "score4"].map((scoreKey) => (
                      <div key={`${index}-${scoreKey}`} className="space-y-2">
                        <Label>{scoreKey.toUpperCase()}</Label>
                        <Input
                          type="number"
                          value={entry[scoreKey as keyof SupportBugEntry] as number}
                          onChange={(event) =>
                            handleSupportBugChange(
                              index,
                              scoreKey as keyof SupportBugEntry,
                              event.target.value,
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={isSaving || isLoading}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Salvar dados
                  </>
                )}
              </Button>
            </div>
          </fieldset>
        </form>
      </div>
    </DashboardLayout>
  );
}
