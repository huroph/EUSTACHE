import { useState, useEffect } from 'react';
import { FileText, Download, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import jsPDF from 'jspdf';

interface ShootingDay {
  id: string;
  day_number: number;
  date: string;
  location_global: string | null;
  weather_forecast: string | null;
}

interface Sequence {
  id: string;
  sequence_number: string;
  int_ext: 'INT' | 'EXT' | null;
  day_night: 'Jour' | 'Nuit' | null;
  main_decor: string | null;
  physical_location: string | null;
  start_time: string | null;
  end_time: string | null;
  characters: string[];
  effect: string | null;
}

interface CallSheetGeneratorProps {
  dayId: string;
  onClose: () => void;
}

export function CallSheetGenerator({ dayId, onClose }: CallSheetGeneratorProps) {
  const [day, setDay] = useState<ShootingDay | null>(null);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [productionTitle, setProductionTitle] = useState('');
  const [director, setDirector] = useState('');
  const [producer, setProducer] = useState('');

  useEffect(() => {
    loadData();
  }, [dayId]);

  const loadData = async () => {
    const [dayResult, sequencesResult] = await Promise.all([
      supabase.from('shooting_days').select('*').eq('id', dayId).single(),
      supabase.from('sequences').select('*').eq('shooting_day_id', dayId).order('order_in_day'),
    ]);

    if (dayResult.data) setDay(dayResult.data);
    if (sequencesResult.data) setSequences(sequencesResult.data);
    setLoading(false);
  };

  const generatePDF = () => {
    if (!day) return;

    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(18);
    doc.text('FEUILLE DE SERVICE', 105, yPos, { align: 'center' });
    yPos += 10;

    if (productionTitle) {
      doc.setFontSize(14);
      doc.text(productionTitle, 105, yPos, { align: 'center' });
      yPos += 10;
    }

    doc.setFontSize(10);
    const formattedDate = new Date(day.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    doc.text(`Jour ${day.day_number} - ${formattedDate}`, 105, yPos, { align: 'center' });
    yPos += 15;

    if (director || producer) {
      doc.setFontSize(9);
      if (director) {
        doc.text(`Réalisateur: ${director}`, 20, yPos);
        yPos += 5;
      }
      if (producer) {
        doc.text(`Producteur: ${producer}`, 20, yPos);
        yPos += 5;
      }
      yPos += 5;
    }

    if (day.location_global) {
      doc.setFontSize(10);
      doc.text(`Lieu: ${day.location_global}`, 20, yPos);
      yPos += 7;
    }

    if (day.weather_forecast) {
      doc.text(`Météo: ${day.weather_forecast}`, 20, yPos);
      yPos += 10;
    } else {
      yPos += 5;
    }

    doc.setFontSize(12);
    doc.text('SÉQUENCES', 20, yPos);
    yPos += 7;

    doc.setFontSize(9);
    sequences.forEach((seq, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont(undefined, 'bold');
      doc.text(`${seq.sequence_number}`, 20, yPos);
      doc.setFont(undefined, 'normal');

      let info = '';
      if (seq.int_ext) info += seq.int_ext;
      if (seq.day_night) info += (info ? ' / ' : '') + seq.day_night;
      if (seq.main_decor) info += (info ? ' - ' : '') + seq.main_decor;

      if (info) {
        doc.text(info, 50, yPos);
      }
      yPos += 5;

      if (seq.physical_location) {
        doc.text(`  Lieu: ${seq.physical_location}`, 25, yPos);
        yPos += 5;
      }

      if (seq.start_time || seq.end_time) {
        const timeInfo = `  Horaire: ${seq.start_time || '--:--'} - ${seq.end_time || '--:--'}`;
        doc.text(timeInfo, 25, yPos);
        yPos += 5;
      }

      if (seq.effect) {
        doc.text(`  Effet: ${seq.effect}`, 25, yPos);
        yPos += 5;
      }

      if (seq.characters.length > 0) {
        doc.text(`  Rôles: ${seq.characters.join(', ')}`, 25, yPos);
        yPos += 5;
      }

      yPos += 3;
    });

    yPos += 10;
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(10);
    doc.text('_'.repeat(80), 20, yPos);
    yPos += 10;
    doc.text('Notes:', 20, yPos);

    const filename = `feuille_service_jour_${day.day_number}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-xl p-8">
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-2xl border border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Générer feuille de service</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Titre de production
            </label>
            <input
              type="text"
              value={productionTitle}
              onChange={e => setProductionTitle(e.target.value)}
              placeholder="Nom du film"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Réalisateur
            </label>
            <input
              type="text"
              value={director}
              onChange={e => setDirector(e.target.value)}
              placeholder="Nom du réalisateur"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Producteur
            </label>
            <input
              type="text"
              value={producer}
              onChange={e => setProducer(e.target.value)}
              placeholder="Nom du producteur"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-700">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Aperçu</h3>
            <div className="bg-slate-700 rounded-lg p-4 space-y-2 text-sm text-slate-300">
              <p>
                <strong>Jour:</strong> {day?.day_number}
              </p>
              <p>
                <strong>Date:</strong>{' '}
                {day && new Date(day.date).toLocaleDateString('fr-FR')}
              </p>
              <p>
                <strong>Séquences:</strong> {sequences.length}
              </p>
              {day?.location_global && (
                <p>
                  <strong>Lieu:</strong> {day.location_global}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={generatePDF}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Télécharger PDF
          </button>
        </div>
      </div>
    </div>
  );
}
