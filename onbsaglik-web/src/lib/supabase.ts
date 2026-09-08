import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

// İstemci tarafında da kullanılabilen public client (Örn: Resim yüklemek için)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sadece sunucu tarafında kullanılan yetkili client (Örn: Veritabanına admin onayıyla kayıt atmak için)
// Bunu sadece Route Handler'larda veya Server Action'larda kullanın.
export const getServiceSupabase = () => {
  return createClient(supabaseUrl, supabaseServiceKey);
};
