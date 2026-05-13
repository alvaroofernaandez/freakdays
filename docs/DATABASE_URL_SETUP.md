# Configuración de DATABASE_URL para Prisma con Supabase

Esta guía te ayudará a obtener y configurar la URL de conexión del connection pooler de Supabase para usar con Prisma.

## 📍 Obtener la URL del Connection Pooler

### Paso 1: Acceder al Dashboard de Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Haz clic en el botón **"Connect"** en la parte superior de la página
   - O ve a **Settings → Database → Connection pooling**

### Paso 2: Copiar la URL de Transaction Mode

Para Prisma en entornos serverless (como Nuxt), usa el **Transaction mode** (puerto 6543):

1. En la sección **"Connection pooling"**, selecciona **"Transaction"** mode
2. Copia la connection string que se muestra
3. Debe tener el formato:
   ```
   postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

### Paso 3: Agregar Parámetros de Prisma

Añade los siguientes parámetros a la URL:

```
?pgbouncer=true&connection_limit=1
```

**URL final completa:**

```
postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

## 🔧 Configurar en el Proyecto

### Crear/Actualizar archivo `.env`

En la raíz del proyecto, crea o actualiza el archivo `.env`:

```env
# Supabase
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_anon_key

# Prisma Database Connection (Transaction Mode para serverless)
DATABASE_URL=postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**Importante:**

- Reemplaza `[PROJECT-REF]` con el ID de tu proyecto (ej: `apbkobhfnmcqqzqeeqss`)
- Reemplaza `[PASSWORD]` con tu contraseña de base de datos
- Reemplaza `[REGION]` con tu región (ej: `us-east-1`)

## 📝 Explicación de Parámetros

### `pgbouncer=true`

- Desactiva prepared statements en Prisma
- Requerido para Transaction mode (puerto 6543)
- Evita el error: `prepared statement already exists`

### `connection_limit=1`

- Limita las conexiones de Prisma a 1
- Recomendado para entornos serverless
- Evita el error: `Max client connections reached`
- Puedes aumentar este valor si es necesario (ej: `connection_limit=5`)

## 🔄 Modos de Conexión

### Transaction Mode (Puerto 6543) - **RECOMENDADO para Prisma**

- ✅ Ideal para serverless/edge functions
- ✅ Soporta más conexiones simultáneas
- ✅ Mejor rendimiento para aplicaciones con muchas conexiones transitorias
- ⚠️ No soporta prepared statements (usa `pgbouncer=true`)

### Session Mode (Puerto 5432)

- ✅ Soporta prepared statements
- ✅ Mejor para migraciones de Prisma
- ⚠️ Menos conexiones simultáneas
- ⚠️ No recomendado para producción en serverless

### Direct Connection (Puerto 5432)

- ✅ Mejor latencia
- ⚠️ Solo funciona con IPv6 (o requiere IPv4 add-on)
- ⚠️ No recomendado para serverless

## 🧪 Verificar la Conexión

Después de configurar `DATABASE_URL`, verifica que funciona:

```bash
# Generar el cliente de Prisma
pnpm prisma:generate

# Probar la conexión (opcional)
pnpm prisma studio
```

## 🐛 Troubleshooting

### Error: "Can't reach database server at `localhost` on port `5432`"

**Causa:** Prisma está intentando conectarse directamente al puerto 5432 en lugar del pooler.

**Solución:**

1. Verifica que `DATABASE_URL` use el puerto **6543** (Transaction mode)
2. Verifica que la URL incluya `pooler.supabase.com` (no `db.supabase.co`)
3. Asegúrate de que la URL tenga el formato correcto con `pgbouncer=true`

### Error: "prepared statement already exists"

**Causa:** Transaction mode no soporta prepared statements.

**Solución:**

- Añade `pgbouncer=true` a la URL de conexión

### Error: "Max client connections reached"

**Causa:** Demasiadas conexiones simultáneas.

**Solución:**

- Añade `connection_limit=1` a la URL (o un valor más bajo)
- Considera aumentar el pool size en Supabase Dashboard

### Error: "Missing DATABASE_URL environment variable"

**Causa:** La variable de entorno no está configurada.

**Solución:**

1. Crea un archivo `.env` en la raíz del proyecto
2. Añade `DATABASE_URL=...` con la URL completa
3. Reinicia el servidor de desarrollo

## 📚 Referencias

- [Supabase Connection Pooling Docs](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Prisma + Supabase Guide](https://supabase.com/docs/guides/database/prisma)
- [Prisma Troubleshooting](https://supabase.com/docs/guides/database/prisma/prisma-troubleshooting)
