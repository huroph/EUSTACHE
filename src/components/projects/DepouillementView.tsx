import { useParams, useSearchParams } from 'react-router-dom';
import { DepouillementPage } from '../depouillement';

export function DepouillementView() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const sequenceId = searchParams.get('sequence');

  if (!projectId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-lg">ID de projet manquant</div>
      </div>
    );
  }

  return (
    <DepouillementPage
      projectId={projectId}
      initialSequenceId={sequenceId}
    />
  );
}
