import { supabase } from '../lib/supabase';

interface ShootingDay {
  id: string;
  date: string;
  day_number: number;
  project_id: string;
}

/**
 * Recalcule les day_numbers de tous les jours de tournage d'un projet
 * en fonction de l'ordre chronologique des dates
 */
export async function recalculateDayNumbers(projectId: string): Promise<void> {
  console.log('🔢 [RECALCULATE] Début recalcul des day_numbers pour projet:', projectId);

  // 1. Récupérer tous les jours du projet
  const { data: days, error: fetchError } = await supabase
    .from('shooting_days')
    .select('id, date, day_number, project_id')
    .eq('project_id', projectId)
    .order('date', { ascending: true });

  if (fetchError) {
    console.error('❌ [RECALCULATE] Erreur récupération:', fetchError);
    throw fetchError;
  }

  if (!days || days.length === 0) {
    console.log('ℹ️ [RECALCULATE] Aucun jour à recalculer');
    return;
  }

  console.log('📊 [RECALCULATE] Jours trouvés:', days.length);

  // 2. Trier par date (normalement déjà fait par la query)
  const sortedDays = days.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // 3. Mettre à jour les day_numbers
  const updates = sortedDays.map((day, index) => ({
    id: day.id,
    day_number: index + 1, // Commence à 1
  }));

  console.log('📝 [RECALCULATE] Mises à jour:', updates.map(u => `${u.id.slice(0, 8)}→${u.day_number}`));

  // 4. Exécuter les mises à jour
  const updatePromises = updates.map((update) =>
    supabase
      .from('shooting_days')
      .update({ day_number: update.day_number })
      .eq('id', update.id)
  );

  const results = await Promise.all(updatePromises);
  const errors = results.filter(r => r.error);

  if (errors.length > 0) {
    console.error('❌ [RECALCULATE] Erreurs lors des mises à jour:', errors);
    throw new Error('Erreur lors du recalcul des numéros de jours');
  }

  console.log('✅ [RECALCULATE] Recalcul terminé avec succès');
}

/**
 * Crée un nouveau jour de tournage et recalcule tous les day_numbers
 */
export async function createShootingDay(
  projectId: string,
  date: string,
  additionalData?: Partial<Omit<ShootingDay, 'id' | 'project_id' | 'date' | 'day_number'>>
): Promise<ShootingDay> {
  console.log('➕ [CREATE DAY] Création nouveau jour:', date);

  // 1. Créer le jour avec un day_number temporaire (sera recalculé)
  const { data, error } = await supabase
    .from('shooting_days')
    .insert({
      project_id: projectId,
      date,
      day_number: 999, // Temporaire
      ...additionalData,
    })
    .select()
    .single();

  if (error) {
    console.error('❌ [CREATE DAY] Erreur création:', error);
    throw error;
  }

  console.log('✅ [CREATE DAY] Jour créé:', data.id);

  // 2. Recalculer tous les day_numbers
  await recalculateDayNumbers(projectId);

  // 3. Récupérer le jour avec son nouveau day_number
  const { data: updatedDay, error: fetchError } = await supabase
    .from('shooting_days')
    .select('*')
    .eq('id', data.id)
    .single();

  if (fetchError || !updatedDay) {
    console.error('❌ [CREATE DAY] Erreur récupération jour mis à jour:', fetchError);
    throw fetchError || new Error('Jour non trouvé après création');
  }

  console.log('🎉 [CREATE DAY] Jour créé avec day_number:', updatedDay.day_number);
  return updatedDay;
}

/**
 * Supprime un jour de tournage et recalcule tous les day_numbers
 */
export async function deleteShootingDay(dayId: string, projectId: string): Promise<void> {
  console.log('🗑️ [DELETE DAY] Suppression jour:', dayId);

  // 1. Supprimer toutes les séquences du jour
  const { error: deleteSeqError } = await supabase
    .from('sequences')
    .delete()
    .eq('shooting_day_id', dayId);

  if (deleteSeqError) {
    console.error('❌ [DELETE DAY] Erreur suppression séquences:', deleteSeqError);
    throw deleteSeqError;
  }

  // 2. Supprimer le jour
  const { error: deleteDayError } = await supabase
    .from('shooting_days')
    .delete()
    .eq('id', dayId);

  if (deleteDayError) {
    console.error('❌ [DELETE DAY] Erreur suppression jour:', deleteDayError);
    throw deleteDayError;
  }

  console.log('✅ [DELETE DAY] Jour supprimé');

  // 3. Recalculer les day_numbers des jours restants
  await recalculateDayNumbers(projectId);

  console.log('🎉 [DELETE DAY] Suppression et recalcul terminés');
}

/**
 * Modifie la date d'un jour de tournage et recalcule tous les day_numbers
 */
export async function updateShootingDayDate(dayId: string, newDate: string, projectId: string): Promise<void> {
  console.log('📝 [UPDATE DAY] Modification date du jour:', dayId, '→', newDate);

  // 1. Mettre à jour la date
  const { error: updateError } = await supabase
    .from('shooting_days')
    .update({ date: newDate })
    .eq('id', dayId);

  if (updateError) {
    console.error('❌ [UPDATE DAY] Erreur mise à jour:', updateError);
    throw updateError;
  }

  console.log('✅ [UPDATE DAY] Date mise à jour');

  // 2. Recalculer tous les day_numbers
  await recalculateDayNumbers(projectId);

  console.log('🎉 [UPDATE DAY] Modification et recalcul terminés');
}
