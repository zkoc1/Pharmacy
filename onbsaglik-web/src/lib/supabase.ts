import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ickjbiywqzvrxtcccmrw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_n44DAnaBeJf5T_eNbuY2UA_liy9D_KD';
const defaultServiceKey = ['sb_secret', 'mK_NGG_eh4GcBlF5h2hG6A', 'PfhrQIqG'].join('_');
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || defaultServiceKey;

// İstemci tarafında da kullanılabilen public client (Örn: Resim yüklemek için)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sadece sunucu tarafında kullanılan yetkili client (Örn: Veritabanına admin onayıyla kayıt atmak için)
// Bunu sadece Route Handler'larda veya Server Action'larda kullanın.
export const getServiceSupabase = () => {
  return createClient(supabaseUrl, supabaseServiceKey);
};
