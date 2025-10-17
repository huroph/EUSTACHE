-- Supprimer les anciennes catégories et réinsérer toutes les catégories obligatoires
TRUNCATE TABLE depouillement_categories CASCADE;

-- Insérer toutes les catégories de dépouillement avec icônes
INSERT INTO depouillement_categories (name, icon, order_index) VALUES
  ('Rôles', '🎭', 1),
  ('Silhouettes & Doublures Image', '👥', 2),
  ('Figuration', '🚶', 3),
  ('Cascadeurs & Doublures Cascade', '🤸', 4),
  ('Cascades Physiques', '💥', 5),
  ('Cascades Mécaniques', '⚙️', 6),
  ('Conseillers Techniques', '👨‍🏫', 7),
  ('Lieux de Tournage', '📍', 8),
  ('Intitulés des Décors', '🏛️', 9),
  ('Décoration', '🪑', 10),
  ('Accessoires', '🎩', 11),
  ('Armes', '🔫', 12),
  ('Animaux', '🐕', 13),
  ('Véhicules', '🚗', 14),
  ('Documents Visuels', '📄', 15),
  ('Effets Speciaux Tournage', '✨', 16),
  ('Costumes', '👔', 17),
  ('Maquillage & Coiffure', '💄', 18),
  ('Maquillage Special', '🎨', 19),
  ('Caméra', '🎥', 20),
  ('Machinerie', '🎬', 21),
  ('Électriciens', '💡', 22),
  ('Son & Musique', '🎵', 23),
  ('VFX', '🌟', 24),
  ('Notes de Production & Régie', '📝', 25),
  ('Mise en Scène', '🎯', 26);
