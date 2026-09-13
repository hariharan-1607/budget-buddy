// Legacy Supabase client placeholder
// The project has transitioned to MongoDB + Express REST backend.
// This mock client prevents runtime crashes in case of legacy references.

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: {}, error: new Error("Supabase is disabled. Use MongoDB backend.") }),
    signUp: async () => ({ data: {}, error: new Error("Supabase is disabled. Use MongoDB backend.") }),
    signOut: async () => {},
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        order: async () => ({ data: [], error: null }),
        single: async () => ({ data: null, error: null }),
      }),
      order: async () => ({ data: [], error: null }),
    }),
    insert: () => ({
      select: () => ({
        single: async () => ({ data: null, error: null }),
      }),
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: async () => ({ data: null, error: null }),
        }),
      }),
    }),
    delete: () => ({
      eq: async () => ({ error: null }),
    }),
  }),
};
