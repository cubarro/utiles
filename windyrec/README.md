# WindyRec - Grabador de Interacciones Meteorológicas

**Autor:** MiniMax Agent  
**Versión:** 1.0.0  
**Tecnologías:** HTML5, CSS3, JavaScript ES6+

## Descripción

WindyRec es una aplicación web moderna que permite a los usuarios grabar sus interacciones con mapas meteorológicos de Windy.com y generar videos de alta calidad. La aplicación utiliza únicamente tecnologías web nativas, sin dependencias externas pesadas.

## Características Principales

### 🎥 Grabación de Pantalla Avanzada
- **Screen Capture API**: Utiliza la API nativa del navegador para captura de pantalla
- **MediaRecorder API**: Grabación de video con control de calidad personalizable
- **Múltiples opciones de calidad**: Alta (2.5 Mbps), Media (1.5 Mbps), Baja (800 Kbps)
- **Audio del sistema**: Opción para incluir audio durante la grabación

### 🗺️ Integración con Windy.com
- **Mapa embebido**: Integración completa con el mapa meteorológico de Windy.com
- **Interacciones fluidas**: El usuario puede interactuar libremente con el mapa
- **Configuración optimizada**: Mapa preconfigurado para mejor experiencia de grabación

### 🎨 Interfaz Moderna
- **Diseño responsivo**: Compatible con desktop, tablet y móvil
- **Paleta de colores profesional**: Azules y grises con acentos visuales
- **Tipografía Inter**: Fuente moderna y legible
- **Animaciones suaves**: Transiciones CSS para mejor experiencia de usuario

### 🔧 Funcionalidades Técnicas
- **Formato WebM**: Videos optimizados con códec VP9/VP8
- **Gestión de estado centralizada**: Arquitectura modular y mantenible
- **Sistema de notificaciones**: Toast notifications para feedback del usuario
- **Atajos de teclado**: Ctrl+R para grabar, Escape para detener

## Arquitectura Técnica

### Estructura de Archivos
```
/
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos principales con variables CSS
└── js/
    ├── main.js             # Orquestador principal de la aplicación
    ├── state.js            # Gestión centralizada del estado
    ├── recorder.js         # Lógica de grabación (Screen Capture + MediaRecorder)
    └── ui.js               # Gestión de interfaz y notificaciones
```

### Componentes Principales

#### 1. StateManager (`state.js`)
- Gestión centralizada del estado de la aplicación
- Configuraciones de calidad de video
- Control del timer de grabación
- Actualización automática de la UI

#### 2. RecorderManager (`recorder.js`)
- Implementación de Screen Capture API
- Configuración de MediaRecorder
- Manejo de errores de captura
- Procesamiento de video final

#### 3. UIManager (`ui.js`)
- Gestión de eventos de interfaz
- Sistema de notificaciones toast
- Atajos de teclado
- Modales de procesamiento

#### 4. WindyRecApp (`main.js`)
- Inicialización de la aplicación
- Configuración del mapa embebido
- Manejo de errores globales
- Limpieza de recursos

## Compatibilidad de Navegadores

### Soporte Completo
- **Chrome 72+**: Soporte completo de todas las funciones
- **Firefox 66+**: Soporte completo con limitaciones menores en WebCodecs
- **Edge 79+**: Soporte completo basado en Chromium

### Soporte Limitado
- **Safari**: Funcionalidad de grabación limitada
- **Navegadores móviles**: Screen Capture API no disponible

### APIs Requeridas
- Screen Capture API (`getDisplayMedia()`)
- MediaRecorder API
- Web Workers (para procesamiento)
- Blob y URL APIs

## Guía de Uso

### Instrucciones Básicas
1. **Configurar calidad**: Selecciona la calidad de grabación deseada
2. **Iniciar grabación**: Haz clic en "Iniciar Grabación" y selecciona la pantalla/ventana
3. **Interactuar**: Navega y experimenta con el mapa de Windy como desees
4. **Detener grabación**: Presiona "Detener" cuando hayas terminado
5. **Descargar**: Usa el botón "Descargar Video" para obtener tu grabación

### Atajos de Teclado
- **Ctrl/Cmd + R**: Iniciar o detener grabación
- **Escape**: Detener grabación activa

### Configuraciones Disponibles
- **Calidad de video**: Alta, Media, Baja
- **Audio del sistema**: Activar/desactivar captura de audio
- **Selección de pantalla**: Pestaña actual, ventana completa, o monitor

## Especificaciones Técnicas

### Formatos de Video
- **Contenedor**: WebM (preferido), MP4 (fallback)
- **Códec de video**: VP9 (preferido), VP8, H.264
- **Códec de audio**: Opus (preferido), AAC

### Configuraciones de Calidad
| Calidad | Resolución | Bitrate Video | Bitrate Audio | FPS |
|---------|------------|---------------|---------------|-----|
| Alta    | 1920x1080  | 2.5 Mbps      | 128 Kbps      | 30  |
| Media   | 1280x720   | 1.5 Mbps      | 96 Kbps       | 30  |
| Baja    | 854x480    | 800 Kbps      | 64 Kbps       | 24  |

### Límites y Restricciones
- **Duración máxima**: 10 minutos por grabación
- **Advertencia**: Se muestra a los 9 minutos
- **Tamaño de archivo**: Varía según duración y calidad seleccionada

## Desarrollo y Personalización

### Variables CSS Principales
```css
:root {
  --primary-color: #0D6EFD;
  --secondary-color: #212529;
  --background-color: #F8F9FA;
  --surface-color: #FFFFFF;
  /* ... más variables disponibles */
}
```

### Configuración del Mapa
El mapa de Windy se puede personalizar modificando `AppConfig.defaultMapConfig` en `main.js`:

```javascript
defaultMapConfig: {
  lat: 40.4,           // Latitud inicial
  lon: -3.7,           // Longitud inicial
  zoom: 6,             // Nivel de zoom
  overlay: 'wind',     // Capa meteorológica
  product: 'ecmwf'     // Modelo meteorológico
}
```

### Debugging y Diagnóstico
La aplicación incluye herramientas de debugging accesibles desde la consola:

```javascript
// Obtener estado actual
WindyRecDebug.getState()

// Información de diagnóstico
WindyRecDebug.getDiagnostics()

// Exportar diagnósticos
WindyRecDebug.exportDiagnostics()
```

## Resolución de Problemas

### Problemas Comunes

**Error "Permisos denegados"**
- Asegúrate de permitir la captura de pantalla cuando el navegador lo solicite
- Verifica que la página se ejecute en HTTPS

**Mapa no carga**
- Verifica la conexión a internet
- Recarga la página si el mapa tarda más de 15 segundos

**Video no se genera**
- Verifica que hay espacio suficiente en disco
- Comprueba que el navegador soporta MediaRecorder API

**Calidad de video baja**
- Aumenta la configuración de calidad en el panel de control
- Verifica que la conexión a internet sea estable

### Limitaciones Conocidas
- La captura de audio puede no funcionar en todos los sistemas
- La grabación de pestañas en segundo plano puede tener limitaciones
- Los navegadores móviles no soportan Screen Capture API

## Privacidad y Seguridad

- **Procesamiento local**: Toda la grabación se procesa localmente en el navegador
- **Sin envío de datos**: No se envían datos a servidores externos
- **Permisos explícitos**: El usuario controla qué contenido se graba
- **Limpieza automática**: Los recursos se liberan automáticamente al cerrar

## Licencia y Créditos

**Desarrollado por:** MiniMax Agent  
**Tecnologías utilizadas:**
- Windy.com (mapas meteorológicos)
- Screen Capture API (W3C)
- MediaRecorder API (W3C)
- Inter Font (Google Fonts)

---

*WindyRec v1.0.0 - Una aplicación web moderna para grabación de interacciones meteorológicas*
