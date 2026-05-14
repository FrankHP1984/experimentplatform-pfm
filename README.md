# ExperimentPlatform

Plataforma web para la gestión de experimentos de comportamiento en entornos académicos. Permite a investigadores diseñar experimentos con múltiples fases y grupos, y a los participantes acceder a ellos mediante invitación.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Java 21 · Spring Boot 3 · Spring Security · JPA/Hibernate |
| Frontend | React 18 · Vite · React Router · CSS Modules |
| Base de datos | PostgreSQL (Supabase) |
| Autenticación | Supabase Auth (JWT) |

## Estructura del repositorio

```
experimentplatform-pfm/
  backend/    Spring Boot REST API
  frontend/   React SPA
```

## Requisitos previos

- Java 21
- Node.js 18+
- Cuenta en [Supabase](https://supabase.com) con un proyecto creado

## Configuración del backend

1. Copia el fichero de ejemplo:
   ```
   cp backend/src/main/resources/application.properties.example \
      backend/src/main/resources/application.properties
   ```
2. Rellena los valores de tu proyecto Supabase en `application.properties`.

## Configuración del frontend

1. Copia el fichero de ejemplo:
   ```
   cp frontend/.env.example frontend/.env
   ```
2. Rellena `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los valores de tu proyecto.

## Arrancar en local

**Backend:**
```bash
cd backend
./mvnw spring-boot:run
```
La API queda disponible en `http://localhost:8080`.

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
La app queda disponible en `http://localhost:5173`.

## Roles de usuario

- **Investigador** — crea y gestiona experimentos, fases, grupos y preguntas; consulta analíticas de respuestas.
- **Participante** — se une a experimentos mediante código de invitación y responde cuestionarios.
