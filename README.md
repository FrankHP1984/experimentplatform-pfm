# ExperimentPlatform

Plataforma web para diseñar, configurar y gestionar experimentos con participantes humanos en entornos académicos y de investigación. Cubre el ciclo de vida completo del estudio: diseño metodológico → captación de participantes → recogida de datos → exportación para análisis.

---

## Filosofía del proyecto

La plataforma nace de una premisa concreta: **los investigadores de ciencias sociales y del comportamiento necesitan herramientas que respeten el método científico, no que lo ignoren**.

La mayoría de soluciones existentes (Google Forms, Qualtrics, REDCap) permiten crear cuestionarios, pero no gestionan la estructura metodológica de un experimento: qué grupos existen, qué condición ve cada participante, en qué orden, con qué ventana temporal. El investigador acaba reconstruyendo esa lógica manualmente en hojas de cálculo.

Esta plataforma resuelve ese problema haciendo que el **diseño experimental sea una entidad de primer orden** en el sistema. No se crean formularios: se crean experimentos con diseño, fases, grupos y participantes. El cuestionario es solo la capa final de recogida de datos.

**Lo que la plataforma hace:**
- Gestiona la estructura metodológica completa (diseño, fases, grupos, condiciones)
- Controla qué participante ve qué, cuándo y en qué orden
- Recoge respuestas estructuradas ligadas a su contexto (fase, grupo, inscripción)
- Exporta los datos listos para análisis estadístico

**Lo que la plataforma no hace:**
- No realiza análisis estadísticos (eso corresponde a R, SPSS, Python)
- No reemplaza un protocolo ético (GDPR, consentimiento informado, sí; evaluación de riesgos, no)
- No es una herramienta clínica ni de diagnóstico

---

## Tipos de diseño experimental

El corazón de la plataforma es el soporte a cinco diseños experimentales establecidos en metodología de investigación. Cada diseño tiene sus propios requisitos de configuración y su propia lógica de comportamiento en el sistema.

### 1. Pretest–Postest

**Concepto:** Los mismos participantes son medidos antes y después de una intervención para detectar el cambio producido por ella.

**Requisitos:**
- Exactamente **2 fases**. La primera es el Pretest (medición basal), la segunda el Postest (medición final). El orden de creación importa; el sistema etiqueta automáticamente.
- Cada fase tiene sus propias preguntas. Pueden ser idénticas (para comparar directamente) o distintas según la hipótesis.
- La **intervención ocurre fuera de la plataforma**, entre las dos fases. La plataforma no la modela.

**Comportamiento del sistema:**
- Las fases se etiquetan automáticamente como Pretest / Postest en la vista del investigador.
- Los participantes responden el Pretest, esperan a la intervención y luego responden el Postest.
- Se pueden comparar las puntuaciones de ambas fases en el módulo de analíticas.

---

### 2. Entre grupos (Between-Subjects)

**Concepto:** Grupos distintos de participantes reciben condiciones experimentales distintas. Ningún participante está en más de un grupo, eliminando el efecto de contaminación entre condiciones.

**Requisitos:**
- **Al menos 2 grupos**, uno por condición (ej. "Control", "Experimental"). Los grupos se crean antes de invitar participantes.
- **Al menos una fase** con preguntas. Las fases pueden asignarse a un grupo concreto (solo la ven los miembros de ese grupo) o dejarse como comunes (las ven todos).
- Los grupos se configuran en la pestaña **Grupos** del experimento.

**Comportamiento del sistema:**
- Al aceptar la invitación, el participante se asigna a un grupo (manual o automáticamente).
- Una vez asignado, el participante solo ve las fases de su grupo más las fases comunes.
- Las analíticas permiten filtrar y comparar respuestas por grupo.

---

### 3. Longitudinal

**Concepto:** Los mismos participantes son seguidos a lo largo del tiempo y medidos en múltiples momentos (T1, T2, T3…). Permite estudiar la evolución de variables a lo largo de semanas, meses o años.

**Requisitos:**
- **Al menos 2 fases**, una por punto temporal (ej. T1 = semana 0, T2 = semana 4, T3 = semana 12).
- Cada fase debe tener **fecha de inicio y fecha de cierre** que define su ventana de respuesta.
- Sin fechas configuradas, la ventana no se controla y los participantes podrían responder en cualquier momento.

**Comportamiento del sistema:**
- El badge de estado de cada fase (Próxima / Ventana abierta / Cerrada) se actualiza en tiempo real según la fecha actual.
- Los participantes solo pueden acceder a una fase dentro de su ventana activa. Fuera de ella, ven un mensaje de espera con la fecha de apertura de la siguiente.
- El historial de respuestas queda ligado al punto temporal en que se recogieron.

---

### 4. Intra-sujeto (Within-Subjects)

**Concepto:** Los mismos participantes pasan por todas las condiciones experimentales, cada una representada por una fase. Al exponer a todos a las mismas condiciones se eliminan las diferencias individuales como variable de confusión.

**Requisitos:**
- **Al menos 2 fases**, una por condición experimental (ej. "Condición A — con música", "Condición B — en silencio").
- No es necesario crear grupos. El sistema gestiona el orden automáticamente.

**Comportamiento del sistema:**
- Al inscribirse, el sistema asigna automáticamente a cada participante una **secuencia rotada** de condiciones (contrabalanceo). El esquema es: participante 1 → A-B-C, participante 2 → B-C-A, participante 3 → C-A-B, etc.
- El contrabalanceo neutraliza el **efecto de orden** (que los resultados estén influenciados por el hecho de haber respondido una condición antes que otra).
- La secuencia asignada a cada participante es visible en la pestaña **Participantes** del experimento.
- Importante: hay que considerar el **efecto de arrastre** (carry-over), especialmente si las condiciones implican aprendizaje o fatiga. Si este efecto es crítico, el diseño entre-grupos puede ser más apropiado.

---

### 5. Transversal (Cross-Sectional)

**Concepto:** Todos los participantes son medidos en un único momento, sin seguimiento temporal ni condiciones distintas. Es el diseño más sencillo y el más rápido de configurar.

**Requisitos:**
- **Al menos una fase** con todas las preguntas del estudio.
- No es necesario configurar grupos ni fechas de ventana.

**Comportamiento del sistema:**
- Todos los participantes ven exactamente el mismo cuestionario.
- En cuanto un participante responde todas las preguntas de la fase, su inscripción pasa automáticamente a **Completada**. No puede volver a modificar sus respuestas.
- Ideal para encuestas de prevalencia, cuestionarios de perfil o estudios de corte transversal.

---

## Funcionalidades implementadas

### Gestión de experimentos
- [x] Crear, editar y eliminar experimentos
- [x] Ciclo de vida: `DRAFT → ACTIVE → PAUSED → FINISHED`
- [x] Wizard de creación guiada (selección de diseño + fases + preguntas en un flujo)
- [x] Vista detallada del experimento con pestañas: Fases, Grupos, Participantes, Invitaciones, Respuestas
- [x] Banners explicativos por tipo de diseño en la pestaña de Fases
- [x] Reordenación de fases por drag & drop

### Fases
- [x] Crear, editar y eliminar fases
- [x] Asignar grupo concreto a una fase (Between-Subjects)
- [x] Configurar ventana temporal con fecha de inicio y cierre (Longitudinal)
- [x] Etiquetado automático Pretest/Postest (Pretest-Postest)
- [x] Badge de estado temporal en tiempo real (Próxima / Ventana abierta / Cerrada)
- [x] Texto de debriefing por fase (mostrado al participante al completar)

### Preguntas
- [x] Cinco tipos de pregunta: `TEXT`, `NUMBER`, `SCALE` (1–10), `MULTIPLE_CHOICE`, `BOOLEAN`
- [x] Crear, editar, eliminar y reordenar preguntas dentro de una fase
- [x] Campo de opciones para preguntas de opción múltiple

### Grupos
- [x] Crear, editar y eliminar grupos
- [x] Asignar color identificativo a cada grupo
- [x] Asignar un participante a un grupo manualmente desde la vista de participantes

### Participantes e inscripciones
- [x] Sistema de invitación por enlace con token único
- [x] Página pública de aceptación de invitación (`/invite/:token`)
- [x] Registro de consentimiento informado por fase
- [x] Estados de inscripción: `PENDING → ACTIVE → COMPLETED / WITHDRAWN`
- [x] Contrabalanceo automático de secuencias en diseño Within-Subjects
- [x] Vista de secuencia asignada por participante
- [x] Retirar participante (withdraw) desde la vista del investigador

### Cuestionario (vista participante)
- [x] Presentación pregunta a pregunta con navegación
- [x] Guardado de respuesta individual al avanzar (no se pierde si se interrumpe)
- [x] Detección de preguntas ya respondidas (no se re-envían)
- [x] Pantalla de espera con fecha cuando la siguiente fase aún no ha abierto (Longitudinal)
- [x] Pantalla de completado con texto de debriefing
- [x] Soporte para todos los tipos de pregunta en la UI

### Respuestas y analíticas
- [x] Módulo de analíticas por experimento (`/experiments/:id/analytics`)
- [x] Tarjetas de estadísticas: participantes activos, total de respuestas, tasa de completación, pendientes
- [x] Gráficos de barras: media por grupo para preguntas numéricas y de escala (Recharts)
- [x] Gráficos horizontales para preguntas de opción múltiple
- [x] Lista de respuestas de texto libre (hasta 10 más recientes)
- [x] Tabla de estado individual por participante
- [x] Filtros por fase y por grupo
- [x] Exportación a CSV con columnas: Participante, Grupo, Pregunta, Fase, Tipo, Respuesta

### Autenticación y usuarios
- [x] Autenticación con Supabase Auth (OAuth / magic link)
- [x] Dos roles diferenciados: `RESEARCHER` y `PARTICIPANT`
- [x] Sincronización de usuario con la base de datos propia al primer login (`/api/users/sync`)
- [x] Onboarding para nuevos investigadores
- [x] Perfil editable para investigadores y participantes

### Páginas legales
- [x] Aviso legal
- [x] Política de cookies

---

## Modelo de datos

```
User (supabaseId, email, role: RESEARCHER|PARTICIPANT|ADMIN)
 │
 ├─ Researcher owns ──► Experiment (title, description, designType, status)
 │                           │
 │                           ├──► Phase (name, order, startDate, endDate, groupId?, debriefingText)
 │                           │         └──► Question (text, type, options, order)
 │                           │                   └──► Response (enrollmentId, numericValue|textValue|booleanValue)
 │                           │
 │                           ├──► Group (name, color)
 │                           │
 │                           └──► Invitation (token, status: PENDING|ACCEPTED|DECLINED)
 │
 └─ Participant ──► Enrollment (experimentId, groupId?, status, phaseSequence, consentSignedAt)
                         └──► Response (questionId, numericValue|textValue|booleanValue)
```

**Entidades principales:**

| Entidad | Descripción |
|---|---|
| `User` | Cuenta de usuario vinculada a Supabase Auth. Tiene rol `RESEARCHER`, `PARTICIPANT` o `ADMIN`. |
| `Experiment` | Unidad central. Define el diseño, el estado y el propietario. |
| `Phase` | Etapa temporal del experimento. Puede tener ventana de fechas y asignación a grupo. |
| `Question` | Pregunta dentro de una fase. Cinco tipos soportados. |
| `Group` | Condición experimental dentro de un diseño entre-grupos. |
| `Enrollment` | Inscripción de un participante en un experimento. Rastrea el estado y la secuencia (Within-Subjects). |
| `Response` | Respuesta de un participante a una pregunta concreta, en el contexto de su inscripción. |
| `Invitation` | Token único enviado a un participante para unirse a un experimento. |

---

## Arquitectura técnica

### Backend

| Componente | Tecnología |
|---|---|
| Lenguaje | Java 21 |
| Framework | Spring Boot 4.0 |
| Persistencia | Spring Data JPA / Hibernate |
| Base de datos | PostgreSQL (gestionado por Supabase) |
| Seguridad | Spring Security + filtro JWT personalizado |
| Validación | Jakarta Bean Validation |
| API docs | SpringDoc OpenAPI (Swagger UI en `/swagger-ui.html`) |
| Despliegue | Railway |

### Frontend

| Componente | Tecnología |
|---|---|
| Framework | React 18 + Vite |
| Enrutado | React Router v6 |
| Estilos | CSS Modules |
| Gráficos | Recharts |
| Auth client | Supabase JS SDK |
| HTTP client | Axios con interceptor de JWT |
| Despliegue | Netlify |

### Autenticación

El flujo de autenticación usa **Supabase Auth** como proveedor de identidad y la base de datos propia para la gestión de roles y perfil:

1. El usuario se autentica en Supabase (OAuth, magic link, etc.).
2. Supabase emite un **JWT firmado con clave EC (ECDSA)**.
3. El frontend adjunta ese JWT como `Authorization: Bearer <token>` en cada petición al backend.
4. El backend valida la firma del JWT cargando la clave pública desde el endpoint JWKS de Supabase (`/auth/v1/.well-known/jwks.json`).
5. Si el JWT es válido, busca el usuario en la base de datos propia para obtener su rol. Si no existe, devuelve el rol `ROLE_AUTHENTICATED` (usuario sin sincronizar).
6. Al primer login, el frontend llama a `POST /api/users/sync` para crear o actualizar el perfil en la base de datos propia con el rol elegido.

---

## API REST — resumen de endpoints

### Experimentos (`/api/experiments`)
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| `POST` | `/` | RESEARCHER | Crear experimento |
| `GET` | `/` | — | Listar todos los experimentos (paginado) |
| `GET` | `/my` | RESEARCHER | Listar mis experimentos |
| `GET` | `/:id` | — | Obtener experimento |
| `PUT` | `/:id` | RESEARCHER | Editar experimento |
| `PATCH` | `/:id/status` | RESEARCHER | Cambiar estado |
| `POST` | `/:id/finish` | RESEARCHER | Finalizar experimento |
| `DELETE` | `/:id` | RESEARCHER | Eliminar experimento |
| `GET` | `/:id/participants` | RESEARCHER | Listar inscripciones (paginado) |
| `GET` | `/:id/responses` | RESEARCHER | Todas las respuestas del experimento |
| `POST` | `/:id/groups` | RESEARCHER | Crear grupo |
| `GET` | `/:id/groups` | — | Listar grupos |
| `PUT` | `/groups/:groupId` | RESEARCHER | Editar grupo |
| `DELETE` | `/groups/:groupId` | RESEARCHER | Eliminar grupo |
| `POST` | `/:id/phases` | RESEARCHER | Crear fase |
| `GET` | `/:id/phases` | — | Listar fases |
| `PUT` | `/phases/:phaseId` | RESEARCHER | Editar fase |
| `DELETE` | `/phases/:phaseId` | RESEARCHER | Eliminar fase |

### Preguntas y respuestas (`/api/questions`)
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| `POST` | `/phases/:phaseId` | RESEARCHER | Crear pregunta |
| `GET` | `/phases/:phaseId` | — | Preguntas de una fase |
| `PUT` | `/:id` | RESEARCHER | Editar pregunta |
| `DELETE` | `/:id` | RESEARCHER | Eliminar pregunta |
| `POST` | `/enrollments/:enrollmentId/responses` | PARTICIPANT | Enviar respuesta |
| `GET` | `/enrollments/:enrollmentId/responses` | — | Respuestas de una inscripción |
| `GET` | `/enrollments/:enrollmentId/phases/:phaseId/responses` | — | Respuestas por inscripción y fase |
| `GET` | `/:questionId/responses` | RESEARCHER | Respuestas a una pregunta |
| `DELETE` | `/responses/:id` | RESEARCHER | Eliminar respuesta |

### Inscripciones (`/api/enrollments`)
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| `GET` | `/me` | PARTICIPANT | Mis inscripciones |
| `GET` | `/:enrollmentId` | — | Obtener inscripción |
| `POST` | `/participants/:participantId` | PARTICIPANT | Inscribirse en experimento |
| `PUT` | `/:enrollmentId/status` | RESEARCHER | Cambiar estado de inscripción |
| `PATCH` | `/:enrollmentId/group` | RESEARCHER | Asignar grupo a inscripción |
| `PUT` | `/:enrollmentId/complete` | PARTICIPANT | Marcar inscripción como completada |
| `DELETE` | `/:enrollmentId` | PARTICIPANT | Retirarse del experimento |

### Invitaciones
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| `POST` | `/api/experiments/:id/invitations` | RESEARCHER | Crear invitación |
| `GET` | `/api/experiments/:id/invitations` | RESEARCHER | Listar invitaciones del experimento |
| `GET` | `/api/invitations/:token` | — | Obtener invitación por token |
| `POST` | `/api/invitations/:token/accept` | PARTICIPANT | Aceptar invitación |
| `POST` | `/api/invitations/:token/decline` | PARTICIPANT | Rechazar invitación |

### Usuarios y participantes
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| `GET` | `/api/users/me` | — | Perfil del usuario autenticado |
| `PUT` | `/api/users/me` | — | Actualizar perfil |
| `POST` | `/api/users/sync` | — | Sincronizar usuario con la BD propia |
| `POST` | `/api/participants` | PARTICIPANT | Crear perfil de participante |
| `GET` | `/api/participants/me` | PARTICIPANT | Mi perfil de participante |
| `PUT` | `/api/participants/:id` | PARTICIPANT | Actualizar perfil de participante |

---

## Rutas del frontend

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Público | Landing page |
| `/auth/callback` | Público | Callback de Supabase Auth |
| `/invite/:token` | Público | Página de aceptación de invitación |
| `/aviso-legal` | Público | Aviso legal |
| `/politica-cookies` | Público | Política de cookies |
| `/onboarding` | RESEARCHER | Onboarding para nuevos investigadores |
| `/dashboard` | RESEARCHER | Panel principal con lista de experimentos |
| `/experiments/:id` | RESEARCHER | Vista detallada del experimento |
| `/experiments/:id/wizard` | RESEARCHER | Wizard de configuración guiada |
| `/experiments/:id/analytics` | RESEARCHER | Analíticas y exportación de respuestas |
| `/profile` | RESEARCHER | Perfil del investigador |
| `/participant/dashboard` | PARTICIPANT | Panel del participante con sus estudios |
| `/participant/study/:enrollmentId/questionnaire` | PARTICIPANT | Cuestionario de una fase |
| `/participant/profile` | PARTICIPANT | Perfil del participante |

---

## Despliegue

El proyecto se despliega en dos servicios cloud:

**Backend → Railway**
- Servicio de Spring Boot desplegado automáticamente desde el repositorio.
- La URL actual del servicio se configura en `netlify.toml` como proxy.
- Variables de entorno necesarias en Railway: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`.

**Frontend → Netlify**
- Build desde `frontend/`, publicando `dist/`.
- El fichero `netlify.toml` en la raíz configura:
  - **Proxy de API**: todas las peticiones a `/api/*` se redirigen al backend en Railway, evitando CORS.
  - **SPA routing**: cualquier ruta no encontrada devuelve `index.html` para que React Router gestione la navegación.

```toml
[[redirects]]
  from   = "/api/*"
  to     = "https://<railway-service>.up.railway.app/api/:splat"
  status = 200
  force  = true

[[redirects]]
  from   = "/*"
  to     = "/index.html"
  status = 200
```

---

## Requisitos previos para desarrollo local

- Java 21
- Node.js 18+
- Maven (o usar el wrapper `./mvnw`)
- Cuenta en [Supabase](https://supabase.com) con un proyecto creado y una base de datos PostgreSQL

## Configuración y arranque local

### Backend

1. Copia el fichero de configuración:
   ```bash
   cp backend/src/main/resources/application.properties.example \
      backend/src/main/resources/application.properties
   ```

2. Rellena en `application.properties`:
   ```properties
   supabase.url=https://<tu-proyecto>.supabase.co
   spring.datasource.url=jdbc:postgresql://db.<tu-proyecto>.supabase.co:5432/postgres
   spring.datasource.username=postgres
   spring.datasource.password=<tu-password>
   ```

3. Arranca:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   La API queda en `http://localhost:8080`. Swagger UI en `http://localhost:8080/swagger-ui.html`.

### Frontend

1. Copia el fichero de entorno:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. Rellena en `frontend/.env`:
   ```env
   VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
   VITE_SUPABASE_ANON_KEY=<tu-anon-key>
   ```

3. Arranca:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   La app queda en `http://localhost:5173`. Las llamadas a `/api` se dirigen automáticamente al backend en `localhost:8080` a través del proxy de Vite.
