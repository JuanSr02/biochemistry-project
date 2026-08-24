-- ==============================================================================
-- SCHEMA DE BASE DE DATOS SUPABASE / POSTGRESQL - BIOTOOLS LAB
-- ==============================================================================
-- REGLAS ARQUITECTÓNICAS Y DE AUDITORÍA INQUEBRANTABLES:
-- Toda tabla incluye obligatoriamente y únicamente estas 4 columnas de auditoría:
-- 1. created_at (TIMESTAMP WITH TIME ZONE)
-- 2. created_by (UUID)
-- 3. updated_at (TIMESTAMP WITH TIME ZONE)
-- 4. updated_by (UUID)
--
-- Los triggers para actualizar el updated_at son strictly FOR EACH ROW.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. ELIMINAR TABLAS EXISTENTES PARA RECREARLAS
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS public.tarjetas_estudio CASCADE;
DROP TABLE IF EXISTS public.tareas_laboratorio CASCADE;
DROP TABLE IF EXISTS public.laboratorios CASCADE;
DROP TABLE IF EXISTS public.trabajos_practicos CASCADE;
DROP TABLE IF EXISTS public.materias CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;

-- Habilitar extensión UUID si no está activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TABLA: usuarios
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre_completo VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'estudiante' NOT NULL,
    
    -- COLUMNAS OBLIGATORIAS DE AUDITORÍA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by UUID
);

-- ------------------------------------------------------------------------------
-- 2. TABLA: materias
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.materias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    profesor VARCHAR(255),
    cuatrimestre VARCHAR(100) NOT NULL,
    estado VARCHAR(50) DEFAULT 'cursando' NOT NULL CHECK (estado IN ('cursando', 'aprobada', 'pendiente')),
    estudiante_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    
    -- COLUMNAS OBLIGATORIAS DE AUDITORÍA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by UUID
);

-- ------------------------------------------------------------------------------
-- 3. TABLA: trabajos_practicos
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trabajos_practicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    materia_id UUID REFERENCES public.materias(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_entrega DATE NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente' NOT NULL CHECK (estado IN ('pendiente', 'en_progreso', 'entregado')),
    calificacion NUMERIC(4, 2),
    estudiante_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    
    -- COLUMNAS OBLIGATORIAS DE AUDITORÍA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by UUID
);

-- ------------------------------------------------------------------------------
-- 4. TABLA: laboratorios (NUEVA ENTIDAD COMPLEJA)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.laboratorios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    materia_id UUID REFERENCES public.materias(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    observaciones TEXT,
    estado VARCHAR(50) DEFAULT 'pendiente' NOT NULL CHECK (estado IN ('pendiente', 'en_progreso', 'completado')),
    estudiante_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    
    -- COLUMNAS OBLIGATORIAS DE AUDITORÍA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by UUID
);

-- ------------------------------------------------------------------------------
-- 5. TABLA: tareas_laboratorio (SUB-ENTIDAD DE CHECKLIST EN MESADA)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tareas_laboratorio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    laboratorio_id UUID NOT NULL REFERENCES public.laboratorios(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    completada BOOLEAN DEFAULT FALSE NOT NULL,
    orden INT DEFAULT 1 NOT NULL,
    estudiante_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    
    -- COLUMNAS OBLIGATORIAS DE AUDITORÍA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by UUID
);

-- ------------------------------------------------------------------------------
-- 6. TABLA: tarjetas_estudio (BIOFLASH)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tarjetas_estudio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    materia_id UUID REFERENCES public.materias(id) ON DELETE SET NULL,
    categoria VARCHAR(100) NOT NULL,
    pregunta TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    nivel_dificultad VARCHAR(50) DEFAULT 'media' NOT NULL CHECK (nivel_dificultad IN ('facil', 'media', 'dificil')),
    estado_repaso VARCHAR(50) DEFAULT 'nuevo' NOT NULL CHECK (estado_repaso IN ('nuevo', 'repasando', 'dominado')),
    repasos_correctos INT DEFAULT 0 NOT NULL,
    proximo_repaso DATE,
    estudiante_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    
    -- COLUMNAS OBLIGATORIAS DE AUDITORÍA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by UUID
);

-- ==============================================================================
-- FUNCIÓN DE AUDITORÍA Y TRIGGERS (ESTRICTAMENTE FOR EACH ROW)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Trigger para usuarios
DROP TRIGGER IF EXISTS trigger_actualizar_usuarios_updated_at ON public.usuarios;
CREATE TRIGGER trigger_actualizar_usuarios_updated_at
BEFORE UPDATE ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION public.actualizar_updated_at();

-- 2. Trigger para materias
DROP TRIGGER IF EXISTS trigger_actualizar_materias_updated_at ON public.materias;
CREATE TRIGGER trigger_actualizar_materias_updated_at
BEFORE UPDATE ON public.materias
FOR EACH ROW
EXECUTE FUNCTION public.actualizar_updated_at();

-- 3. Trigger para trabajos_practicos
DROP TRIGGER IF EXISTS trigger_actualizar_trabajos_practicos_updated_at ON public.trabajos_practicos;
CREATE TRIGGER trigger_actualizar_trabajos_practicos_updated_at
BEFORE UPDATE ON public.trabajos_practicos
FOR EACH ROW
EXECUTE FUNCTION public.actualizar_updated_at();

-- 4. Trigger para laboratorios
DROP TRIGGER IF EXISTS trigger_actualizar_laboratorios_updated_at ON public.laboratorios;
CREATE TRIGGER trigger_actualizar_laboratorios_updated_at
BEFORE UPDATE ON public.laboratorios
FOR EACH ROW
EXECUTE FUNCTION public.actualizar_updated_at();

-- 5. Trigger para tareas_laboratorio
DROP TRIGGER IF EXISTS trigger_actualizar_tareas_laboratorio_updated_at ON public.tareas_laboratorio;
CREATE TRIGGER trigger_actualizar_tareas_laboratorio_updated_at
BEFORE UPDATE ON public.tareas_laboratorio
FOR EACH ROW
EXECUTE FUNCTION public.actualizar_updated_at();

-- 6. Trigger para tarjetas_estudio
DROP TRIGGER IF EXISTS trigger_actualizar_tarjetas_estudio_updated_at ON public.tarjetas_estudio;
CREATE TRIGGER trigger_actualizar_tarjetas_estudio_updated_at
BEFORE UPDATE ON public.tarjetas_estudio
FOR EACH ROW
EXECUTE FUNCTION public.actualizar_updated_at();

-- ==============================================================================
-- POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trabajos_practicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laboratorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas_laboratorio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarjetas_estudio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso completo a usuarios autenticados" ON public.usuarios FOR ALL USING (true);
CREATE POLICY "Permitir acceso completo a materias" ON public.materias FOR ALL USING (true);
CREATE POLICY "Permitir acceso completo a trabajos_practicos" ON public.trabajos_practicos FOR ALL USING (true);
CREATE POLICY "Permitir acceso completo a laboratorios" ON public.laboratorios FOR ALL USING (true);
CREATE POLICY "Permitir acceso completo a tareas_laboratorio" ON public.tareas_laboratorio FOR ALL USING (true);
CREATE POLICY "Permitir acceso completo a tarjetas_estudio" ON public.tarjetas_estudio FOR ALL USING (true);
