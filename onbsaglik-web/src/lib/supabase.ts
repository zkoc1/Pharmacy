import { createClient } from '@supabase/supabase-js';

// İstemci tarafında da kullanılabilen public client (Örn: Resim yüklemek için)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Sadece sunucu tarafında kullanılan yetkili client (Örn: Veritabanına admin onayıyla kayıt atmak için)
// Bunu sadece Route Handler'larda veya Server Action'larda kullanın.
export const getServiceSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};
