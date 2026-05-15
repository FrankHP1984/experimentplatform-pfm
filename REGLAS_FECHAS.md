# Reglas de Fechas en Seraphon

## 📅 Resumen de Campos de Fecha

### Experimento (Experiment)
- `createdAt` - **Automático, no editable** - Se establece al crear
- `updatedAt` - **Automático** - Se actualiza en cada modificación
- `startDate` - **Opcional** - Fecha de inicio del experimento
- `endDate` - **Opcional** - Fecha de fin del experimento

### Fase (Phase)
- `startDate` - **Opcional/Obligatorio según diseño** - Fecha de inicio de la fase
- `endDate` - **Opcional** - Fecha de fin de la fase

---

## 🔒 Reglas de Validación

### 1. Fechas del Experimento

#### Al crear un experimento:
```java
// La fecha de fin debe ser posterior a la de inicio (si ambas están definidas)
if (startDate != null && endDate != null && !endDate.isAfter(startDate)) {
    throw new BadRequestException("End date must be after start date");
}

// La fecha de finalización no puede ser en el pasado
if (endDate != null && endDate.isBefore(LocalDateTime.now())) {
    throw new BadRequestException("End date cannot be in the past");
}
```

#### Al editar un experimento:

**Estado FINISHED:**
- ❌ **No se pueden cambiar las fechas** de un experimento finalizado

**Estado ACTIVE:**
- ❌ **No se puede cambiar la fecha de inicio** de un experimento activo
- ✅ Se puede cambiar la fecha de fin

**Estado DRAFT:**
- ✅ Se pueden cambiar ambas fechas libremente

---

### 2. Fechas de las Fases

#### Regla general:
```java
// La fecha de fin debe ser posterior a la de inicio
if (startDate != null && endDate != null && !endDate.isAfter(startDate)) {
    throw new BadRequestException("La fecha de fin debe ser posterior a la de inicio");
}
```

#### Relación con el experimento:
```java
// La fase no puede empezar antes que el experimento
if (experiment.startDate != null && phase.startDate != null 
    && phase.startDate.isBefore(experiment.startDate)) {
    throw new BadRequestException("La fase no puede empezar antes que el experimento");
}

// La fase no puede terminar después del experimento
if (experiment.endDate != null && phase.endDate != null 
    && phase.endDate.isAfter(experiment.endDate)) {
    throw new BadRequestException("La fase no puede terminar después del experimento");
}
```

#### No solapamiento entre fases:
```java
// Las fases no pueden solaparse en el tiempo (solo si ambas tienen endDate)
if (newStart != null && newEnd != null) {
    for (Phase existingPhase : phases) {
        if (existingPhase.startDate != null && existingPhase.endDate != null) {
            boolean overlaps = newStart.isBefore(existingPhase.endDate) 
                            && newEnd.isAfter(existingPhase.startDate);
            if (overlaps) {
                throw new BadRequestException("Phase dates overlap with existing phase");
            }
        }
    }
}
```

---

## 📋 Requisitos por Tipo de Diseño

### LONGITUDINAL (Estudio Longitudinal)

**Requisitos obligatorios al activar:**
- ✅ Al menos **2 fases**
- ✅ **Todas las fases deben tener `startDate` configurada**
- ⚠️ `endDate` es opcional (se puede dejar abierta)

```java
if (designType == LONGITUDINAL) {
    if (phases.size() < 2) {
        throw new BadRequestException(
            "Un diseño longitudinal requiere al menos 2 fases. Actualmente tiene " + count);
    }
    
    boolean allHaveDates = phases.stream().allMatch(p -> p.getStartDate() != null);
    if (!allHaveDates) {
        throw new BadRequestException(
            "En un diseño longitudinal todas las fases deben tener fecha de inicio configurada.");
    }
}
```

**Propósito:**
- Cada fase representa un punto temporal (T1, T2, T3...)
- Las fechas controlan cuándo cada fase está disponible para los participantes

---

### PRETEST_POSTTEST

**Requisitos obligatorios al activar:**
- ✅ Exactamente **2 fases**
- ⚠️ Las fechas son **opcionales** (no se validan)

```java
if (designType == PRETEST_POSTTEST) {
    if (phases.size() != 2) {
        throw new BadRequestException(
            "Un diseño pretest-postest requiere exactamente 2 fases. Actualmente tiene " + count);
    }
}
```

**Propósito:**
- Primera fase = Pretest (medición inicial)
- Segunda fase = Postest (medición final)
- La intervención ocurre fuera de la plataforma

---

### BETWEEN_SUBJECTS (Entre Grupos)

**Requisitos obligatorios al activar:**
- ✅ Al menos **2 grupos** creados
- ✅ Al menos **1 fase** con preguntas
- ⚠️ Las fechas son **opcionales**

```java
if (designType == BETWEEN_SUBJECTS) {
    if (groups.size() < 2) {
        throw new BadRequestException(
            "Un diseño entre grupos requiere al menos 2 grupos. Actualmente tiene " + count);
    }
    if (phases.isEmpty()) {
        throw new BadRequestException("El experimento debe tener al menos una fase.");
    }
}
```

---

### WITHIN_SUBJECTS (Intra-Sujeto)

**Requisitos obligatorios al activar:**
- ✅ Al menos **2 fases** (cada fase = una condición)
- ⚠️ Las fechas son **opcionales**

```java
if (designType == WITHIN_SUBJECTS) {
    if (phases.size() < 2) {
        throw new BadRequestException(
            "Un diseño intra-sujeto requiere al menos 2 fases. Actualmente tiene " + count);
    }
}
```

**Propósito:**
- Cada fase es una condición experimental
- Todos los participantes pasan por todas las condiciones
- El sistema asigna automáticamente secuencias contrabalanceadas

---

### CROSS_SECTIONAL (Transversal)

**Requisitos obligatorios al activar:**
- ✅ Al menos **1 fase** con preguntas
- ⚠️ Las fechas son **opcionales**

```java
if (designType == CROSS_SECTIONAL) {
    if (phases.isEmpty()) {
        throw new BadRequestException("El experimento debe tener al menos una fase.");
    }
}
```

**Propósito:**
- Medición única en un momento dado
- Suele bastar con una sola fase

---

## 🎯 Resumen de Obligatoriedad de Fechas

| Diseño | startDate Experimento | endDate Experimento | startDate Fases | endDate Fases |
|--------|----------------------|---------------------|-----------------|---------------|
| **LONGITUDINAL** | Opcional | Opcional | **OBLIGATORIO** | Opcional |
| **PRETEST_POSTTEST** | Opcional | Opcional | Opcional | Opcional |
| **BETWEEN_SUBJECTS** | Opcional | Opcional | Opcional | Opcional |
| **WITHIN_SUBJECTS** | Opcional | Opcional | Opcional | Opcional |
| **CROSS_SECTIONAL** | Opcional | Opcional | Opcional | Opcional |

---

## ⚠️ Restricciones Adicionales

### Fechas en el pasado
- ❌ **La fecha de finalización del experimento no puede ser anterior a la fecha actual**
- ⚠️ Esto previene crear experimentos que ya hayan terminado

### Orden de fases (phaseOrder)
- ✅ Debe ser **único** dentro del experimento
- ✅ Se valida al crear y actualizar fases

### Cambios según estado del experimento

| Estado | Cambiar fechas experimento | Cambiar fechas fases | Crear/editar fases |
|--------|---------------------------|---------------------|-------------------|
| **DRAFT** | ✅ Sí | ✅ Sí | ✅ Sí |
| **ACTIVE** | ⚠️ Solo endDate | ✅ Sí | ⚠️ Limitado |
| **FINISHED** | ❌ No | ❌ No | ❌ No |

---

## 💡 Recomendaciones

### Para diseños LONGITUDINAL:
1. Definir siempre `startDate` en todas las fases
2. Considerar dejar `endDate` abierta si no se conoce la duración exacta
3. Asegurar que no hay solapamiento entre fases

### Para otros diseños:
1. Las fechas son opcionales pero útiles para:
   - Controlar cuándo se abre/cierra la recogida de datos
   - Establecer plazos para participantes
2. Si no se definen fechas, las fases están siempre disponibles

### Al activar un experimento:
1. Verificar que cumple los requisitos de su tipo de diseño
2. Revisar que las fechas de las fases estén dentro del rango del experimento
3. Comprobar que no hay solapamientos no deseados

---

## 🔍 Código de Referencia

**Validación de fechas del experimento:**
- `ExperimentService.java` línea 256-260

**Validación de fechas de fases:**
- `PhaseService.java` líneas 154-176

**Validación de no solapamiento:**
- `PhaseService.java` líneas 193-207

**Validación por tipo de diseño:**
- `ExperimentService.java` líneas 204-254
