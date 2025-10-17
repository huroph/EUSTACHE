import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log l'environnement pour le debugging (uniquement en dev)
if (import.meta.env.DEV) {
  console.log('🔧 Environment:', import.meta.env.MODE);
  console.log('🔗 Supabase URL:', supabaseUrl ? '✅ Configured' : '❌ Missing');
  console.log('🔑 Supabase Key:', supabaseAnonKey ? '✅ Configured' : '❌ Missing');
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing Supabase environment variables. 
    Please check your .env file or Vercel environment settings.
    URL: ${supabaseUrl ? 'OK' : 'MISSING'}
    Key: ${supabaseAnonKey ? 'OK' : 'MISSING'}`
  );
}

// Créer le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Récupérer un client Supabase avec le token d'authentification personnalisé
 * Utilisé pour les requêtes authentifiées avec ton API
 */
export function getAuthenticatedSupabaseClient() {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    console.warn('⚠️ [SUPABASE] Aucun token d\'authentification trouvé');
    return supabase;
  }

  // Créer un client avec le token personnalisé
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'admin' | 'editor';
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'admin' | 'editor';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'admin' | 'editor';
          created_at?: string;
        };
      };
      shooting_days: {
        Row: {
          id: string;
          day_number: number;
          date: string;
          location_global: string | null;
          weather_forecast: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          day_number: number;
          date: string;
          location_global?: string | null;
          weather_forecast?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          day_number?: number;
          date?: string;
          location_global?: string | null;
          weather_forecast?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      departments: {
        Row: {
          id: string;
          name: string;
          head_of_department: string | null;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          head_of_department?: string | null;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          head_of_department?: string | null;
          color?: string;
          created_at?: string;
        };
      };
      decors: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sequences: {
        Row: {
          id: string;
          shooting_day_id: string | null;
          sequence_number: string;
          scene_part1: string | null;
          scene_part2: string | null;
          scene_part3: string | null;
          decor_id: string | null;
          int_ext: 'INT' | 'EXT' | null;
          day_night: 'Jour' | 'Nuit' | null;
          effect: string | null;
          main_decor: string | null;
          sub_decor: string | null;
          physical_location: string | null;
          resume: string | null;
          team: string;
          work_plan: string | null;
          chronology: number | null;
          ett_minutes: number;
          pages_count: number;
          pre_timing_seconds: number;
          start_time: string | null;
          end_time: string | null;
          estimated_duration: number;
          characters: string[];
          authorizations: string[];
          status: 'to_prepare' | 'in_progress' | 'completed';
          notes_ad: string | null;
          order_in_day: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shooting_day_id?: string | null;
          sequence_number: string;
          scene_part1?: string | null;
          scene_part2?: string | null;
          scene_part3?: string | null;
          decor_id?: string | null;
          int_ext?: 'INT' | 'EXT' | null;
          day_night?: 'Jour' | 'Nuit' | null;
          effect?: string | null;
          main_decor?: string | null;
          sub_decor?: string | null;
          physical_location?: string | null;
          resume?: string | null;
          team?: string;
          work_plan?: string | null;
          chronology?: number | null;
          ett_minutes?: number;
          pages_count?: number;
          pre_timing_seconds?: number;
          start_time?: string | null;
          end_time?: string | null;
          estimated_duration?: number;
          characters?: string[];
          authorizations?: string[];
          status?: 'to_prepare' | 'in_progress' | 'completed';
          notes_ad?: string | null;
          order_in_day?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shooting_day_id?: string | null;
          sequence_number?: string;
          scene_part1?: string | null;
          scene_part2?: string | null;
          scene_part3?: string | null;
          decor_id?: string | null;
          int_ext?: 'INT' | 'EXT' | null;
          day_night?: 'Jour' | 'Nuit' | null;
          effect?: string | null;
          main_decor?: string | null;
          sub_decor?: string | null;
          physical_location?: string | null;
          resume?: string | null;
          team?: string;
          work_plan?: string | null;
          chronology?: number | null;
          ett_minutes?: number;
          pages_count?: number;
          pre_timing_seconds?: number;
          start_time?: string | null;
          end_time?: string | null;
          estimated_duration?: number;
          characters?: string[];
          authorizations?: string[];
          status?: 'to_prepare' | 'in_progress' | 'completed';
          notes_ad?: string | null;
          order_in_day?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      sequence_departments: {
        Row: {
          id: string;
          sequence_id: string;
          department_id: string;
          needs: string | null;
          is_validated: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sequence_id: string;
          department_id: string;
          needs?: string | null;
          is_validated?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          sequence_id?: string;
          department_id?: string;
          needs?: string | null;
          is_validated?: boolean;
          created_at?: string;
        };
      };
      depouillement_categories: {
        Row: {
          id: string;
          name: string;
          icon: string | null;
          color: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon?: string | null;
          color?: string;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string | null;
          color?: string;
          order_index?: number;
          created_at?: string;
        };
      };
      depouillement_items: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          description: string | null;
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          description?: string | null;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          description?: string | null;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      sequence_depouillement: {
        Row: {
          id: string;
          sequence_id: string;
          item_id: string;
          quantity: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sequence_id: string;
          item_id: string;
          quantity?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          sequence_id?: string;
          item_id?: string;
          quantity?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
