# Documentación de FreakDays

Bienvenido a la documentación completa del proyecto FreakDays. Esta documentación está diseñada para desarrolladores que quieren entender, contribuir o extender la aplicación.

## 📚 Índice de Documentación

### Documentación Principal

1. **[Arquitectura](./architecture.md)**
   - Principios arquitectónicos
   - Estructura del proyecto
   - Patrones de diseño utilizados
   - Separación de responsabilidades

2. **[Base de Datos](./database.md)**
   - Esquema completo de la base de datos
   - Tablas y relaciones
   - Políticas de seguridad (RLS)
   - Migraciones disponibles
   - Índices y optimizaciones

3. **[Composables](./composables.md)**
   - Documentación de todos los composables Vue
   - Funciones y métodos disponibles
   - Ejemplos de uso
   - Tipos TypeScript

4. **[Componentes](./components.md)**
   - Componentes UI reutilizables
   - Componentes de módulos
   - Componentes de layout
   - Guía de uso y props

5. **[Páginas y Rutas](./pages.md)**
   - Estructura de rutas
   - Páginas principales
   - Middleware y protección de rutas
   - Navegación

6. **[Integración de APIs](./api-integration.md)**
   - Integración con Supabase
   - Integración con Jikan API (MyAnimeList)
   - Manejo de errores
   - Autenticación

7. **[Guía de Desarrollo](./development.md)**
   - Configuración del entorno
   - Convenciones de código
   - Testing
   - Debugging
   - Mejores prácticas

8. **[Despliegue](./deployment.md)**
   - Preparación para producción
   - Variables de entorno
   - Build y optimización
   - Configuración de Supabase

## 🎯 Módulos de la Aplicación

FreakDays está organizado en los siguientes módulos principales:

- **🎮 Gamificación**: Sistema de niveles, EXP y recompensas
- **📺 Anime**: Gestión de lista de anime con integración Jikan API
- **📚 Manga**: Colección física, wishlist y tracking de volúmenes
- **💪 Workouts**: Registro de entrenamientos y ejercicios
- **✅ Quests**: Sistema de misiones diarias con dificultades
- **👥 Party**: Sistema de grupos con códigos de invitación y gestión de miembros
- **📅 Calendar**: Calendario mensual completo con drag and drop para eventos

## 🚀 Inicio Rápido

Si eres nuevo en el proyecto, te recomendamos seguir este orden:

1. Lee la [Guía de Desarrollo](./development.md) para configurar tu entorno
2. Revisa la [Arquitectura](./architecture.md) para entender la estructura
3. Explora los [Composables](./composables.md) para ver cómo funciona la lógica
4. Consulta la [Base de Datos](./database.md) para entender el modelo de datos

## 📖 Convenciones

- **TypeScript**: Strict mode, sin tipos `any`
- **Vue**: Composition API con `<script setup>`
- **Naming**: kebab-case para archivos, PascalCase para componentes
- **Testing**: TDD, cobertura mínima 80% en lógica de negocio
- **Sin comentarios**: El código debe ser auto-documentado

Para más detalles, consulta [AGENTS.md](../AGENTS.md) en la raíz del proyecto.

## 🤝 Contribuir

Antes de contribuir, asegúrate de:

1. Leer esta documentación completa
2. Seguir las convenciones del proyecto
3. Escribir tests para nuevas funcionalidades
4. Actualizar la documentación si es necesario

## 📝 Notas

- Esta documentación se actualiza constantemente
- Si encuentras información desactualizada, por favor abre un issue
- Las contribuciones a la documentación son bienvenidas

---

**Última actualización**: Enero 2025

## 📦 Nuevas Funcionalidades

### Calendario con Drag and Drop

- Calendario mensual completo con grid de días
- Arrastrar y soltar eventos entre días
- Mini cards compactas dentro de cada día
- Normalización de fechas para evitar problemas de zona horaria
- Diseño responsive y mobile-first

### Sistema de Party Mejorado

- Códigos de invitación únicos
- Gestión completa de miembros (añadir, eliminar, roles)
- Regeneración de códigos de invitación
- Modales para crear, unirse y gestionar parties
- Diseño responsive y mobile-first

### Refactorización de Páginas

- Separación de lógica en composables de página
- Componentes modulares para register, profile, party, calendar
- Mejora de mantenibilidad y escalabilidad
- Composables genéricos: `usePageData`, `useModal`
