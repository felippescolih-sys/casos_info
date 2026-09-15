import { AREAS_ESPECIALIDADE, areaEspecialidadeLabel } from '@/lib/labels';
import type { AreaEspecialidade } from '@/types/database';

/** Seleção múltipla das especialidades clínicas de um membro (ex.: cárdio-tórax + TMO). */
export function EspecialidadesCheckboxes({
  selecionadas,
  onToggle,
  disabled,
}: {
  selecionadas: AreaEspecialidade[];
  onToggle: (area: AreaEspecialidade, ativo: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
      {AREAS_ESPECIALIDADE.map((area) => (
        <label key={area} className="flex items-center gap-2 text-sm text-gray-800">
          <input
            type="checkbox"
            className="size-4 rounded border-gray-300 text-brand-700 focus:ring-brand-600"
            checked={selecionadas.includes(area)}
            disabled={disabled}
            onChange={(e) => onToggle(area, e.target.checked)}
          />
          {areaEspecialidadeLabel[area]}
        </label>
      ))}
    </div>
  );
}
