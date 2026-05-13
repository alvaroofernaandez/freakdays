# Guía de Contribución - FreakDays

¡Gracias por tu interés en contribuir a FreakDays! Esta guía te ayudará a entender cómo contribuir de manera efectiva.

## 🚀 Inicio Rápido

1. **Fork** el repositorio
2. Crea una **rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'feat: Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. Abre un **Pull Request**

## 📋 Proceso de Desarrollo

### 1. Configuración del Entorno

Sigue la [Guía de Desarrollo](./docs/development.md) para configurar tu entorno local.

### 2. Estructura de Ramas

- `main`: Código de producción estable
- `develop`: Código en desarrollo
- `feature/*`: Nuevas funcionalidades
- `fix/*`: Correcciones de bugs
- `docs/*`: Cambios en documentación

### 3. Convenciones de Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: añade nueva funcionalidad
fix: corrige bug
docs: actualiza documentación
style: cambios de formato
refactor: refactorización de código
test: añade o modifica tests
chore: tareas de mantenimiento
```

### 4. Checklist Antes de PR

- [ ] Código sigue las convenciones del proyecto
- [ ] Tests pasan (`pnpm test`)
- [ ] No hay errores de TypeScript
- [ ] No hay errores de linter
- [ ] Documentación actualizada si es necesario
- [ ] Código revisado por ti mismo

## 🎯 Áreas de Contribución

### Nuevas Funcionalidades

1. Crea tipos en `domain/types/`
2. Escribe tests primero (TDD)
3. Implementa lógica en `domain/modules/` o `app/composables/`
4. Crea componentes en `app/components/`
5. Añade página si es necesario
6. Actualiza documentación

### Corrección de Bugs

1. Reproduce el bug
2. Escribe un test que falle
3. Corrige el bug
4. Verifica que el test pase
5. Añade tests adicionales si es necesario

### Mejoras de UI/UX

1. Diseña siguiendo el sistema de diseño existente
2. Usa componentes de shadcn-vue
3. Verifica responsive design
4. Verifica accesibilidad
5. Añade skeleton loaders si carga datos

### Documentación

1. Actualiza `docs/` con cambios relevantes
2. Añade ejemplos de código
3. Verifica que los enlaces funcionen
4. Mantén el tono consistente

## 🧪 Testing

### Escribir Tests

```typescript
// tests/unit/domain/feature.test.ts
import { describe, it, expect } from 'vitest';
import { functionToTest } from '~~/domain/modules/feature';

describe('functionToTest', () => {
  it('should do something', () => {
    const result = functionToTest(input);
    expect(result).toBe(expected);
  });
});
```

### Ejecutar Tests

```bash
# Todos los tests
pnpm test

# Modo watch
pnpm test:watch

# Con cobertura
pnpm test:coverage
```

## 📝 Code Review

### Para Revisores

- Sé constructivo y respetuoso
- Explica el "por qué" de tus sugerencias
- Reconoce buenas prácticas
- Aproba rápidamente si está bien

### Para Autores

- Responde a todos los comentarios
- Explica tus decisiones si es necesario
- Acepta feedback constructivo
- Haz cambios solicitados o explica por qué no

## 🐛 Reportar Bugs

Usa el template de issue de GitHub e incluye:

- Descripción clara del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si aplica
- Información del entorno

## 💡 Sugerir Funcionalidades

Abre un issue con:

- Descripción de la funcionalidad
- Casos de uso
- Beneficios
- Posibles implementaciones

## 📚 Recursos

- [Documentación Completa](./docs/README.md)
- [Guías para IA](./docs/ai-guidelines.md)
- [Convenciones de Código](./AGENTS.md)
- [Ejemplos de Código](./docs/code-examples.md)

## ❓ Preguntas

Si tienes preguntas:

1. Revisa la documentación
2. Busca en issues existentes
3. Abre un nuevo issue con la etiqueta `question`

---

**¡Gracias por contribuir a FreakDays!** 🎉
