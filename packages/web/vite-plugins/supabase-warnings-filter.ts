interface VitePlugin {
  name: string;
  configResolved?: () => void;
  buildStart?: () => void;
  [key: string]: any;
}

const supabaseWarningPatterns = [
  "PostgrestError",
  "FunctionsError",
  "FunctionsFetchError",
  "FunctionsHttpError",
  "FunctionsRelayError",
  "FunctionRegion",
];

function isSupabaseWarning(message: string): boolean {
  if (
    message.includes("is imported from external module") &&
    message.includes("but never used")
  ) {
    return (
      message.includes("@supabase/postgrest-js") ||
      message.includes("@supabase/functions-js") ||
      message.includes("@supabase/supabase-js")
    );
  }

  return supabaseWarningPatterns.some((pattern) => message.includes(pattern));
}

export function supabaseWarningsFilter(): VitePlugin {
  let originalWarn: typeof console.warn | null = null;

  return {
    name: "supabase-warnings-filter",
    configResolved() {
      if (!originalWarn) {
        originalWarn = console.warn;
        console.warn = (...args: any[]) => {
          const message = args[0]?.toString() || "";
          if (isSupabaseWarning(message)) {
            return;
          }
          originalWarn!.apply(console, args);
        };
      }
    },
    buildStart() {
      if (!originalWarn) {
        originalWarn = console.warn;
        console.warn = (...args: any[]) => {
          const message = args[0]?.toString() || "";
          if (isSupabaseWarning(message)) {
            return;
          }
          originalWarn!.apply(console, args);
        };
      }
    },
  };
}
