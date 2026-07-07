import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  UserX,
  Settings,
  Plus,
  Minus,
} from "lucide-react";

const STATUS_STYLE = {
  agendado: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  confirmado: { bg: "#bfdbfe", border: "#2563eb", text: "#1e3a8a" },
  chegou: { bg: "#fef9c3", border: "#eab308", text: "#713f12" },
  concluido: { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
  cancelado: { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
  faltou: { bg: "#ffedd5", border: "#f97316", text: "#7c2d12" },
};

const HOUR_HEIGHT_BASE = 60; // px por hora (base)
const GRID_START_H = 7;
const HOURS_COUNT = 15; // 07:00 → 21:00
const MIN_SLOT_HEIGHT = 78;
const MIN_EVENT_HEIGHT = 72;

function timeToMinutes(t) {
  const [h, m] = (t || "00:00").split(":").map(Number);
  return h * 60 + m;
}

function addMinutes(time, minutes) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function getDayLabel(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return {
    dayNum: d.getDate(),
    weekDay: d
      .toLocaleDateString("pt-BR", { weekday: "short" })
      .replace(".", ""),
    isToday: dateStr === new Date().toISOString().split("T")[0],
  };
}

function getWeekDays(baseDate) {
  const days = [];
  const d = new Date(baseDate + "T12:00:00");
  const dow = d.getDay();
  d.setDate(d.getDate() - dow);
  for (let i = 0; i < 7; i++) {
    days.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function getLocalDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

// Gera os slots de hora de acordo com o intervalo
function buildHourSlots(intervalMin) {
  const slots = [];
  const totalMin = HOURS_COUNT * 60;
  for (let m = 0; m < totalMin; m += intervalMin) {
    const absMin = GRID_START_H * 60 + m;
    const h = Math.floor(absMin / 60);
    const min = absMin % 60;
    slots.push({
      label: `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
      absMin,
    });
  }
  return slots;
}

function ProfAvatar({ prof }) {
  const [imgError, setImgError] = useState(false);
  if (prof.foto_url && !imgError) {
    return (
      <img
        src={prof.foto_url}
        alt={prof.nome}
        onError={() => setImgError(true)}
        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
      />
    );
  }
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
      style={{ backgroundColor: "var(--company-primary, #f43f5e)" }}
    >
      {(prof.nome || "?")[0].toUpperCase()}
    </div>
  );
}

export default function AgendaColunas({
  agendamentos,
  profissionais,
  onEdit,
  onStatusChange,
  onFaltou,
  selectedDate,
  onDateChange,
}) {
  const [viewMode, setViewMode] = useState("day");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [colWidth, setColWidth] = useState(160);
  const [autoWidth, setAutoWidth] = useState(true);
  const [intervalMin, setIntervalMin] = useState(30);
  const [profVisiveis, setProfVisiveis] = useState({});
  const [hoveredSlot, setHoveredSlot] = useState(null); // { colId, absMin }
  const gridRef = useRef(null);
  const containerRef = useRef(null);

  // Init profVisiveis
  useEffect(() => {
    const init = {};
    profissionais.forEach((p) => {
      init[p.id] = true;
    });
    init["__sem_prof__"] = true;
    setProfVisiveis((prev) => {
      const merged = { ...init };
      Object.keys(prev).forEach((k) => {
        if (k in merged) merged[k] = prev[k];
      });
      return merged;
    });
  }, [profissionais]);

  // Scroll to 8h
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTop = (8 - GRID_START_H) * HOUR_HEIGHT_BASE - 10;
    }
  }, []);

  // Auto width
  useEffect(() => {
    if (!autoWidth || !containerRef.current) return;
    const updateWidth = () => {
      if (!containerRef.current) return;
      const sideW = sidebarOpen ? 220 : 0;
      const available = containerRef.current.offsetWidth - 56 - sideW - 8;
      const count =
        viewMode === "week"
          ? 7
          : colunasBase.filter((c) => profVisiveis[c.id] !== false).length ||
            1;
      setColWidth(Math.max(140, Math.floor(available / count)));
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [autoWidth, sidebarOpen, profissionais, profVisiveis, viewMode]);

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  const colunasBase = useMemo(() => {
    const cols = profissionais.map((p) => ({
      id: p.id,
      nome: p.nome,
      especialidade: p.especialidade,
      foto_url: p.foto_url,
    }));
    const semProf = agendamentos.filter(
      (a) => !a.profissional_id && a.status !== "cancelado",
    );
    if (semProf.length > 0)
      cols.push({ id: "__sem_prof__", nome: "Sem prof.", especialidade: "" });
    return cols.length > 0
      ? cols
      : [{ id: "__sem_prof__", nome: "Geral", especialidade: "" }];
  }, [agendamentos, profissionais]);

  const colunasVisiveis = useMemo(
    () => colunasBase.filter((c) => profVisiveis[c.id] !== false),
    [colunasBase, profVisiveis],
  );

  const getAgs = (colId, date) =>
    agendamentos.filter((a) => {
      const matchDate = !date || a.data === date;
      const matchProf =
        colId === "__sem_prof__"
          ? !a.profissional_id
          : a.profissional_id === colId;
      return matchDate && matchProf && a.status !== "cancelado";
    });

  const prevDay = () => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split("T")[0]);
  };
  const nextDay = () => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split("T")[0]);
  };
  const prevWeek = () => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() - 7);
    onDateChange(d.toISOString().split("T")[0]);
  };
  const nextWeek = () => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + 7);
    onDateChange(d.toISOString().split("T")[0]);
  };

  const colunas = useMemo(() => {
    if (viewMode === "day") {
      return colunasVisiveis.map((col) => ({
        ...col,
        date: selectedDate,
        label: col.nome,
        sublabel: col.especialidade,
        ags: getAgs(col.id, selectedDate),
      }));
    } else {
      return weekDays.map((date) => {
        const info = getDayLabel(date);
        return {
          id: date,
          date,
          nome: `${info.weekDay} ${info.dayNum}`,
          sublabel: "",
          isToday: info.isToday,
          label: `${info.weekDay} ${info.dayNum}`,
          ags: agendamentos.filter(
            (a) => a.data === date && a.status !== "cancelado",
          ),
        };
      });
    }
  }, [viewMode, colunasVisiveis, agendamentos, selectedDate, weekDays]);

  // Slots de acordo com intervalo
  const hourSlots = useMemo(() => buildHourSlots(intervalMin), [intervalMin]);
  // Escala visual por intervalo: slots menores ganham altura suficiente
  // para mostrar hora, cliente e serviço dentro do bloco.
  const slotHeight = useMemo(
    () => Math.max(MIN_SLOT_HEIGHT, (HOUR_HEIGHT_BASE / 60) * intervalMin),
    [intervalMin],
  );
  const pxPerMin = useMemo(
    () => slotHeight / intervalMin,
    [slotHeight, intervalMin],
  );
  const totalGrid = HOURS_COUNT * 60 * pxPerMin;
  const GRID_START_MIN = GRID_START_H * 60;
  const todayDate = getLocalDateValue();

  const isPastEmptySlot = (date, absMin) =>
    date === todayDate && absMin < getCurrentMinutes();

  const handleSlotClick = (col, absMin) => {
    if (isPastEmptySlot(col.date, absMin)) return;

    const hora = `${String(Math.floor(absMin / 60)).padStart(2, "0")}:${String(absMin % 60).padStart(2, "0")}`;
    const prof = colunasBase.find((c) => c.id === col.id);
    onEdit({
      _novo: true,
      hora,
      profissional_id:
        viewMode === "day" && col.id !== "__sem_prof__" ? col.id : "",
      profissional_nome: prof?.nome || "",
      data: col.date,
    });
  };

  const changeInterval = (delta) => {
    setIntervalMin((prev) => {
      const next = prev + delta * 30;
      return Math.min(120, Math.max(15, next));
    });
  };

  const intervalLabel =
    intervalMin === 60
      ? "60 minutos"
      : intervalMin === 15
        ? "15 minutos"
        : `${intervalMin} minutos`;

  return (
    <div
      ref={containerRef}
      className="flex bg-white rounded-xl border shadow-sm overflow-hidden"
      style={{ maxHeight: "82vh", minHeight: 400 }}
    >
      {/* Sidebar de configurações */}
      {sidebarOpen && (
        <div className="w-52 flex-shrink-0 border-r bg-slate-50 flex flex-col overflow-y-auto">
          <div className="px-4 py-3 border-b bg-white">
            <p className="text-sm font-semibold text-slate-700">
              Configurações
            </p>
          </div>
          <div className="p-4 space-y-5 flex-1">
            {/* Largura das colunas */}
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">
                Largura das colunas
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={100}
                  max={320}
                  step={10}
                  value={colWidth}
                  onChange={(e) => {
                    setAutoWidth(false);
                    setColWidth(Number(e.target.value));
                  }}
                  disabled={autoWidth}
                  className="flex-1 accent-rose-500 h-1"
                />
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoWidth}
                    onChange={(e) => setAutoWidth(e.target.checked)}
                    className="accent-rose-500 w-3.5 h-3.5"
                  />
                  <span className="text-xs text-slate-600">Auto</span>
                </label>
              </div>
            </div>

            {/* Intervalo de tempo */}
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">
                Intervalo de tempo
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-700 flex-1">
                  {intervalLabel} {intervalMin === 30 ? "(Padrão)" : ""}
                </p>
                <button
                  onClick={() => changeInterval(-1)}
                  className="p-1 rounded-lg border bg-white hover:bg-slate-100 transition-colors"
                >
                  <Minus className="w-3 h-3 text-slate-600" />
                </button>
                <button
                  onClick={() => changeInterval(1)}
                  className="p-1 rounded-lg border bg-white hover:bg-slate-100 transition-colors"
                >
                  <Plus className="w-3 h-3 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Profissionais */}
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">
                Profissionais
              </p>
              <div className="space-y-1.5">
                {colunasBase.map((col) => (
                  <label
                    key={col.id}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={profVisiveis[col.id] !== false}
                      onChange={(e) =>
                        setProfVisiveis((prev) => ({
                          ...prev,
                          [col.id]: e.target.checked,
                        }))
                      }
                      className="accent-rose-500 w-3.5 h-3.5 flex-shrink-0"
                    />
                    <span className="text-xs text-slate-700 truncate group-hover:text-slate-900">
                      {col.nome}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-white flex-wrap flex-shrink-0">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            title="Configurações"
          >
            <Settings className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={viewMode === "day" ? prevDay : prevWeek}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                onDateChange(new Date().toISOString().split("T")[0])
              }
              className="px-3 py-1 text-xs font-medium rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            >
              Hoje
            </button>
            <button
              onClick={viewMode === "day" ? nextDay : nextWeek}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-sm font-semibold text-slate-700 flex-1 capitalize">
            {viewMode === "day"
              ? (() => {
                  const l = getDayLabel(selectedDate);
                  return `${l.weekDay}, ${new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}`;
                })()
              : `Semana de ${new Date(weekDays[0] + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} – ${new Date(weekDays[6] + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}`}
          </span>

          <div className="flex border rounded-lg overflow-hidden bg-slate-50 text-xs flex-shrink-0">
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1.5 font-medium transition-colors ${viewMode === "day" ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600"}`}
            >
              Dia
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1.5 font-medium transition-colors ${viewMode === "week" ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600"}`}
            >
              Semana
            </button>
          </div>
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-3 px-4 py-2 border-b bg-slate-50/50 flex-shrink-0 flex-wrap">
          {Object.entries(STATUS_STYLE)
            .filter(([k]) => k !== "cancelado")
            .map(([status, s]) => (
              <span
                key={status}
                className="flex items-center gap-1 text-xs"
                style={{ color: s.text }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-sm inline-block"
                  style={{
                    backgroundColor: s.bg,
                    border: `1.5px solid ${s.border}`,
                  }}
                />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            ))}
        </div>

        {/* Grid scrollável */}
        <div className="overflow-auto flex-1" ref={gridRef}>
          <div
            className="flex"
            style={{ minWidth: `${56 + colunas.length * colWidth}px` }}
          >
            {/* Coluna de horas */}
            <div
              className="flex-shrink-0 w-14 bg-white sticky left-0 z-20"
              style={{ borderRight: "1px solid #e2e8f0" }}
            >
              <div style={{ height: 70, borderBottom: "1px solid #e2e8f0" }} />
              {hourSlots.map((slot, i) => (
                <div
                  key={i}
                  style={{
                    height: slotHeight,
                    borderBottom: slot.label.endsWith(":00")
                      ? "1px solid #e2e8f0"
                      : "1px dashed #f1f5f9",
                    position: "relative",
                  }}
                >
                  <span
                    className="text-xs text-slate-400 font-mono absolute"
                    style={{ top: 8, left: 4, fontSize: 10 }}
                  >
                    {slot.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Colunas */}
            {colunas.map((col) => (
              <div
                key={col.id}
                className="flex-shrink-0"
                style={{ width: colWidth, borderRight: "1px solid #e2e8f0" }}
              >
                {/* Header */}
                <div
                  className="flex flex-col items-center justify-center gap-0.5 sticky top-0 z-10 bg-white"
                  style={{ height: 70, borderBottom: "1px solid #e2e8f0" }}
                >
                  {viewMode === "week" ? (
                    <>
                      <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                        {col.nome.split(" ")[0]}
                      </span>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${col.isToday ? "text-white" : "text-slate-700"}`}
                        style={
                          col.isToday
                            ? {
                                backgroundColor:
                                  "var(--company-primary, #f43f5e)",
                              }
                            : {}
                        }
                      >
                        {col.nome.split(" ")[1]}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 px-2 w-full">
                      <ProfAvatar prof={col} />
                      <div className="text-center min-w-0 w-full px-1">
                        <p className="text-xs font-semibold text-slate-800 truncate leading-tight">
                          {col.nome}
                        </p>
                        {col.sublabel && (
                          <p className="text-xs text-slate-400 truncate leading-none">
                            {col.sublabel}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Grade */}
                <div className="relative" style={{ height: totalGrid }}>
                  {/* Slots clicáveis */}
                  {hourSlots.map((slot, i) => (
                    <div
                      key={i}
                      className={`absolute left-0 right-0 group/slot ${
                        isPastEmptySlot(col.date, slot.absMin)
                          ? "cursor-not-allowed bg-slate-100/60"
                          : "cursor-pointer"
                      }`}
                      style={{
                        top: i * slotHeight,
                        height: slotHeight,
                        borderBottom: slot.label.endsWith(":00")
                          ? "1px solid #e2e8f0"
                          : "1px dashed #f1f5f9",
                        zIndex: 0,
                      }}
                      onMouseEnter={() =>
                        setHoveredSlot({
                          colId: col.id,
                          slotIdx: i,
                          label: slot.label,
                          blocked: isPastEmptySlot(col.date, slot.absMin),
                        })
                      }
                      onMouseLeave={() => setHoveredSlot(null)}
                      onClick={() => handleSlotClick(col, slot.absMin)}
                    >
                      {/* Tooltip hover */}
                      {hoveredSlot?.colId === col.id &&
                        hoveredSlot?.slotIdx === i &&
                        !hoveredSlot.blocked && (
                          <div
                            className="absolute left-1/2 -translate-x-1/2 z-30 px-2 py-1 rounded-lg text-xs font-semibold border shadow-md pointer-events-none flex items-center gap-1.5"
                            style={{
                              top: "50%",
                              transform: "translate(-50%, -50%)",
                              backgroundColor: "white",
                              borderColor: "var(--company-primary, #f43f5e)",
                              color: "var(--company-primary, #f43f5e)",
                              borderStyle: "dashed",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Plus className="w-3 h-3" />
                            {slot.label} · Adicionar
                          </div>
                        )}
                    </div>
                  ))}

                  {/* Cards de agendamento */}
                  {col.ags.map((ag) => {
                    const startMin = timeToMinutes(ag.hora);
                    const dur = ag.duracao_minutos || 60;
                    const top = (startMin - GRID_START_MIN) * pxPerMin;
                    const height = Math.max(dur * pxPerMin, MIN_EVENT_HEIGHT);
                    const style =
                      STATUS_STYLE[ag.status] || STATUS_STYLE.agendado;

                    return (
                      <div
                        key={ag.id}
                        className="absolute rounded-md overflow-hidden cursor-pointer group transition-all hover:brightness-95 hover:shadow-md select-none"
                        style={{
                          top: top + 1,
                          left: 3,
                          right: 3,
                          height: height - 2,
                          backgroundColor: style.bg,
                          border: `1px solid ${style.border}`,
                          borderLeft: `3px solid ${style.border}`,
                          zIndex: 2,
                        }}
                        onClick={() => onEdit(ag)}
                      >
                        <div className="px-2 py-1 h-full flex flex-col overflow-hidden gap-0.5">
                          {/* Linha hora */}
                          <p
                            className="text-[11px] font-semibold leading-4 truncate"
                            style={{ color: style.text }}
                          >
                            {ag.hora}
                            {dur >= 60 ? ` – ${addMinutes(ag.hora, dur)}` : ""}
                          </p>
                          {/* Nome cliente — sempre visível se height >= 28 */}
                          <p
                            className="text-xs font-bold leading-4 truncate"
                            style={{ color: style.text }}
                            title={ag.cliente_nome}
                          >
                            {ag.cliente_nome}
                          </p>
                          {/* Serviço — aparece se tem espaço */}
                          <p
                            className="text-[11px] leading-4 truncate"
                            style={{ color: style.border }}
                            title={ag.servico_nome}
                          >
                            {ag.servico_nome}
                          </p>
                          {height >= 92 &&
                            viewMode === "week" &&
                            ag.profissional_nome && (
                              <p
                                className="text-[11px] leading-tight truncate opacity-70"
                                style={{ color: style.text }}
                              >
                                {ag.profissional_nome}
                              </p>
                            )}
                          {height >= 92 && (
                            <div className="flex gap-0.5 mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                              {ag.status !== "concluido" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onStatusChange(ag.id, "concluido");
                                  }}
                                  className="p-0.5 rounded hover:bg-emerald-200 text-emerald-700"
                                  title="Concluir"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                              {ag.status !== "faltou" && onFaltou && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onFaltou(ag);
                                  }}
                                  className="p-0.5 rounded hover:bg-orange-200 text-orange-600"
                                  title="Faltou"
                                >
                                  <UserX className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStatusChange(ag.id, "cancelado");
                                }}
                                className="p-0.5 rounded hover:bg-red-200 text-red-600"
                                title="Cancelar"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
