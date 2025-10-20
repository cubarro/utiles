
Tres variantes de estilo, cada una con su propia filosofía de diseño y versiones para temas claro y oscuro.

Puedes usar estos archivos reemplazando tu `style.css` actual. No necesitas cambiar `index.html` ni `script.js`.

---

### Variante 1: Minimalista

Esta variante se centra en la simplicidad, el espacio en blanco y la funcionalidad. Usa colores suaves, tipografía limpia y evita elementos decorativos innecesarios.

#### 1a. Minimalista - Tema Claro

```css
/* --- VARIANTE 1A: MINIMALISTA - TEMA CLARO --- */
/* Estilos generales */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.7;
    color: #333; /* Gris oscuro para el texto */
    background-color: #fff; /* Fondo blanco puro */
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

/* Encabezado */
header {
    background-color: #f7f7f7; /* Gris muy claro */
    color: #333;
    padding: 2rem 1rem;
    text-align: center;
    border-bottom: 1px solid #e0e0e0; /* Línea sutil en lugar de sombra */
}

header h1 {
    font-size: 2.5rem;
    font-weight: 300;
    letter-spacing: 1px;
}

/* Contenido principal */
main {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 3rem 2rem;
    gap: 2rem;
}

/* Áreas de contenido */
.area {
    background-color: #ffffff;
    border: 1px solid #e0e0e0; /* Borde sutil para definir el área */
    border-radius: 4px; /* Bordes apenas redondeados */
    padding: 2rem;
    width: 300px;
    transition: border-color 0.3s ease;
}

.area:hover {
    border-color: #bbb; /* El borde se oscurece al hover */
}

.area h2 {
    color: #111;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.area p {
    font-size: 1rem;
    color: #666;
    margin-bottom: 1.5rem;
}

.area-btn {
    background-color: transparent;
    color: #333;
    border: 1px solid #333;
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
}

.area-btn:hover {
    background-color: #333;
    color: #fff;
}

/* Pie de página */
footer {
    background-color: #f7f7f7;
    color: #777;
    text-align: center;
    padding: 1.5rem;
    border-top: 1px solid #e0e0e0;
}

footer p {
    font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 768px) {
    .area {
        width: 100%;
        max-width: 400px;
    }
}
```

#### 1b. Minimalista - Tema Oscuro

```css
/* --- VARIANTE 1B: MINIMALISTA - TEMA OSCURO --- */
/* Estilos generales */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.7;
    color: #e0e0e0; /* Texto gris claro */
    background-color: #1a1a1a; /* Fondo negro suave */
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

/* Encabezado */
header {
    background-color: #2a2a2a; /* Gris oscuro */
    color: #f0f0f0;
    padding: 2rem 1rem;
    text-align: center;
    border-bottom: 1px solid #444;
}

header h1 {
    font-size: 2.5rem;
    font-weight: 300;
    letter-spacing: 1px;
}

/* Contenido principal */
main {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 3rem 2rem;
    gap: 2rem;
}

/* Áreas de contenido */
.area {
    background-color: #252525;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 2rem;
    width: 300px;
    transition: border-color 0.3s ease;
}

.area:hover {
    border-color: #666;
}

.area h2 {
    color: #f0f0f0;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.area p {
    font-size: 1rem;
    color: #b0b0b0;
    margin-bottom: 1.5rem;
}

.area-btn {
    background-color: transparent;
    color: #e0e0e0;
    border: 1px solid #e0e0e0;
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
}

.area-btn:hover {
    background-color: #e0e0e0;
    color: #1a1a1a;
}

/* Pie de página */
footer {
    background-color: #2a2a2a;
    color: #888;
    text-align: center;
    padding: 1.5rem;
    border-top: 1px solid #444;
}

footer p {
    font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 768px) {
    .area {
        width: 100%;
        max-width: 400px;
    }
}
```

---

### Variante 2: Diseño Vistoso

Esta variante busca captar la atención con colores vibrantes, degradados, sombras llamativas y efectos modernos. Es ideal para portfolios o páginas creativas.

#### 2a. Vistoso - Tema Claro

```css
/* --- VARIANTE 2A: VISTOSO - TEMA CLARO --- */
/* Sugerencia: Importa una fuente moderna como 'Poppins' o 'Montserrat' desde Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

/* Estilos generales */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Poppins', sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); /* Degradado de fondo */
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

/* Encabezado */
header {
    background: linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%); /* Degradado vibrante */
    color: white;
    padding: 2rem 1rem;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

header h1 {
    font-size: 2.8rem;
    font-weight: 700;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

/* Contenido principal */
main {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 3rem 2rem;
    gap: 2rem;
}

/* Áreas de contenido */
.area {
    background-color: #ffffff;
    border-radius: 20px;
    padding: 2rem;
    width: 300px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border-top: 5px solid #3F5EFB; /* Acento de color en la parte superior */
}

.area:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
}

.area h2 {
    color: #3F5EFB;
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.area p {
    font-size: 1rem;
    color: #555;
    margin-bottom: 1.5rem;
}

.area-btn {
    background: linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%);
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    font-size: 0.9rem;
    border-radius: 50px; /* Botón de píldora */
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    font-weight: 600;
}

.area-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(63, 94, 251, 0.4);
}

/* Pie de página */
footer {
    background-color: #2c3e50;
    color: #ecf0f1;
    text-align: center;
    padding: 1.5rem;
    box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.1);
}

footer p {
    font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 768px) {
    header h1 {
        font-size: 2.2rem;
    }
    .area {
        width: 100%;
        max-width: 400px;
    }
}
```

#### 2b. Vistoso - Tema Oscuro

```css
/* --- VARIANTE 2B: VISTOSO - TEMA OSCURO --- */
/* Sugerencia: Importa una fuente moderna como 'Poppins' o 'Montserrat' desde Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

/* Estilos generales */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Poppins', sans-serif;
    line-height: 1.6;
    color: #f0f0f0;
    background: linear-gradient(to right, #0f0c29, #302b63, #24243e); /* Degradado espacial */
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

/* Encabezado */
header {
    background-color: rgba(15, 12, 41, 0.7); /* Fondo semitransparente */
    color: white;
    padding: 2rem 1rem;
    text-align: center;
    backdrop-filter: blur(10px); /* Efecto cristal */
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

header h1 {
    font-size: 2.8rem;
    font-weight: 700;
    background: linear-gradient(90deg, #00dbde 0%, #fc00ff 100%); /* Texto con degradado */
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* Contenido principal */
main {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 3rem 2rem;
    gap: 2rem;
}

/* Áreas de contenido */
.area {
    background-color: rgba(36, 36, 46, 0.8);
    border-radius: 20px;
    padding: 2rem;
    width: 300px;
    box-shadow: 0 0 20px rgba(0, 217, 222, 0.3), 0 0 40px rgba(252, 0, 255, 0.1); /* Sombra de neón */
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.area:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 0 25px rgba(0, 217, 222, 0.5), 0 0 50px rgba(252, 0, 255, 0.2);
}

.area h2 {
    color: #00dbde;
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.area p {
    font-size: 1rem;
    color: #b0b0b0;
    margin-bottom: 1.5rem;
}

.area-btn {
    background: linear-gradient(90deg, #00dbde 0%, #fc00ff 100%);
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    font-size: 0.9rem;
    border-radius: 50px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(252, 0, 255, 0.4);
}

.area-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 20px rgba(0, 217, 222, 0.6);
}

/* Pie de página */
footer {
    background-color: rgba(15, 12, 41, 0.7);
    color: #888;
    text-align: center;
    padding: 1.5rem;
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

footer p {
    font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 768px) {
    header h1 {
        font-size: 2.2rem;
    }
    .area {
        width: 100%;
        max-width: 400px;
    }
}
```



La **Variante 3: Estilo Orgánico/Terroso**, que busca una sensación más natural, cálida y acogedora, tanto en su versión clara como oscura.

---

### Variante 3: Estilo Orgánico / Terroso

Esta variante utiliza una paleta de colores inspirada en la naturaleza, tipografía con serifa para un toque clásico y formas suaves que evocan calidez y confort.

#### 3a. Orgánico - Tema Claro

```css
/* --- VARIANTE 3A: ORGÁNICO - TEMA CLARO --- */
/* Sugerencia: Importa una fuente con serifa como 'Lora' o 'Merriweather' desde Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

/* Estilos generales */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Lora', serif;
    line-height: 1.7;
    color: #5d4037; /* Marrón tierra para el texto */
    background-color: #f5f5dc; /* Color beige (llamado 'wheat') */
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

/* Encabezado */
header {
    background-color: #8d6e63; /* Marrón claro */
    color: #f5f5dc;
    padding: 2rem 1rem;
    text-align: center;
    box-shadow: 0 3px 10px rgba(93, 64, 55, 0.2);
}

header h1 {
    font-size: 2.6rem;
    font-weight: 600;
    font-style: italic;
}

/* Contenido principal */
main {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 3rem 2rem;
    gap: 2rem;
}

/* Áreas de contenido */
.area {
    background-color: #fff8e1; /* Un amarillo crema muy suave */
    border-radius: 15px;
    padding: 2rem;
    width: 300px;
    box-shadow: 0 6px 18px rgba(141, 110, 99, 0.15); /* Sombra suave y cálida */
    border: 1px solid #d7ccc8; /* Borde en un tono rosado tierra */
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.area:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 25px rgba(141, 110, 99, 0.25);
}

.area h2 {
    color: #3e2723; /* Marrón oscuro */
    font-size: 1.7rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.area p {
    font-size: 1rem;
    color: #6d4c41; /* Marrón medio */
    margin-bottom: 1.5rem;
}

.area-btn {
    background-color: #a1887f; /* Un gris rosado suave */
    color: #fff;
    border: none;
    padding: 0.7rem 1.5rem;
    font-size: 0.9rem;
    font-family: 'Lora', serif;
    border-radius: 25px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    font-weight: 600;
}

.area-btn:hover {
    background-color: #8d6e63; /* Marrón más oscuro al hover */
}

/* Pie de página */
footer {
    background-color: #3e2723; /* Marrón oscuro */
    color: #d7ccc8;
    text-align: center;
    padding: 1.5rem;
}

footer p {
    font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 768px) {
    .area {
        width: 100%;
        max-width: 400px;
    }
}
```

#### 3b. Orgánico - Tema Oscuro

```css
/* --- VARIANTE 3B: ORGÁNICO - TEMA OSCURO --- */
/* Sugerencia: Importa una fuente con serifa como 'Lora' o 'Merriweather' desde Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

/* Estilos generales */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Lora', serif;
    line-height: 1.7;
    color: #d7ccc8; /* Texto en un beige claro */
    background-color: #263238; /* Un azul-gris muy oscuro, como la roca mojada */
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

/* Encabezado */
header {
    background-color: #1b5e20; /* Verde bosque oscuro */
    color: #f5f5dc;
    padding: 2rem 1rem;
    text-align: center;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
}

header h1 {
    font-size: 2.6rem;
    font-weight: 600;
    font-style: italic;
}

/* Contenido principal */
main {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 3rem 2rem;
    gap: 2rem;
}

/* Áreas de contenido */
.area {
    background-color: #37474f; /* Gris azulado oscuro */
    border-radius: 15px;
    padding: 2rem;
    width: 300px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3); /* Sombra profunda */
    border: 1px solid #4e5a61;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.area:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
}

.area h2 {
    color: #a5d6a7; /* Verde salvia claro */
    font-size: 1.7rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.area p {
    font-size: 1rem;
    color: #b0bec5; /* Gris azulado claro */
    margin-bottom: 1.5rem;
}

.area-btn {
    background-color: #558b2f; /* Verde oliva */
    color: #f5f5dc;
    border: none;
    padding: 0.7rem 1.5rem;
    font-size: 0.9rem;
    font-family: 'Lora', serif;
    border-radius: 25px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    font-weight: 600;
}

.area-btn:hover {
    background-color: #689f38; /* Verde oliva más brillante */
}

/* Pie de página */
footer {
    background-color: #1b5e20; /* Verde bosque oscuro */
    color: #a5d6a7;
    text-align: center;
    padding: 1.5rem;
}

footer p {
    font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 768px) {
    .area {
        width: 100%;
        max-width: 400px;
    }
}
```
