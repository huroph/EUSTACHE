import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KanbanBoard } from '../kanban';
import { BaguetteView } from '../planning';
import { LayoutGrid, List } from 'lucide-react';

type ViewMode = 'kanban' | 'baguette';

export function PlanningView() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('baguette');

  if (!projectId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-lg">ID de projet manquant</div>
      </div>
    );
  }

  const handleOpenDepouillement = (sequenceId?: string) => {
    if (sequenceId) {
      navigate(`/projects/${projectId}/depouillement?sequence=${sequenceId}`);
    } else {
      navigate(`/projects/${projectId}/depouillement`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Sélecteur de vue */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center gap-2">
         
          
          <button
            onClick={() => setViewMode('baguette')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'baguette'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="font-medium">Baguette</span>
          </button>

          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'kanban'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="font-medium">Kanban</span>
          </button>
        </div>
      </div>

      {/* Vue sélectionnée */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'kanban' ? (
          <KanbanBoard
            projectId={projectId}
            onOpenDepouillement={handleOpenDepouillement}
          />
        ) : (
          <BaguetteView
            projectId={projectId}
            onOpenDepouillement={handleOpenDepouillement}
          />
        )}
      </div>
    </div>
  );
}
