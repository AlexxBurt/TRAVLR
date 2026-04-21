# TRAVLR
![Imagen del proyecto](./assets/images/egipto.webp)

## Ejemplo en vivo
- [Demo (pendiente de publicar)](https://example.com)
- [No aplica (sin API externa)](https://example.com)

## Descripción 📑
TRAVLR es una web para una agencia de viajes premium.
Se trata de un proyecto de maquetación hecha con HTML5, CSS3 y JavaScript.
La idea principal era crear una agencia organizadora de viajes con una página muy sencilla de usar, basando toda la navegación del usuario en el siguiente proceso o flujo:
1. Se elige el destino deseado
2. Se añaden tours vinculados a ese destino
3. Se escoge un hotel de alojamiento
4. Se establecen datos del viaje
5. Se finaliza el proceso de compra.

La aplicación trae la mayoría de la información desde archivos JSON locales y va actualizando el carrito de forma que el usuario conserva su selección entre páginas.

## ¿Qué he aprendido en este proyecto? 🙇🏻
- Arquitectura de sitio multipágina reutilizando `header` y `footer` con carga dinámica.
- Gestión de estado compartido en front-end sin frameworks (`AppData` + `sessionStorage`).
- Renderizado dinámico desde JSON (`countries`, `tours`, `hotels`).
- Control de navegación por pasos (bloqueo de páginas si faltan selecciones previas).
- Interacciones UI: slider vertical, galería, acordeón, checkout dinámico y popups.
- Organización de JavaScript en módulos IIFE para aislar scope y evitar contaminación global.

## Tecnologías 🛠
[![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://es.wikipedia.org/wiki/HTML5)
[![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://es.wikipedia.org/wiki/CSS)
[![JS](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://es.wikipedia.org/wiki/JavaScript)

## Vista previa del proyecto
Si quieres echar un vistazo rápido al diseño:

![Captura 1](./assets/images/egipto.webp)
![Captura 2](./assets/images/japan.webp)
![Captura 3](./assets/images/indonesia.webp)

## Estructura del proyecto

- `index.html`: slider selector de destinos de viaje.
- `tours.html`: tours disponibles en cada país.
- `hoteles.html`: selección de hoteles del país a elegir.
- `reserva.html`: checkout final y pasarela de pago.
- `header.html` / `footer.html`: web components común en toda la web.
- `sobre-nosotros.html`: página más enfocada a textos e info.
- `contacto.html`: típica página con formulario de contacto.
- /css/: estilos por vista y estilos globales.
- /js/: lógica por página + núcleo compartido.
- /assets/: recursos y elementos utilizados en el proyecto (imgs y fuentes)
- /data/: archivos .json con información de cada país (rutas de img, tours, textos, hoteles, precios...).

## Autor ✒️
**Alexx Burt**

- [Correo](mailto:alexxburt@gmail.com)
- [LinkedIn](https://www.linkedin.com/in/alexxburt/)
- [Portfolio](https://alexxburt.framer.website/)

## Instalación
Este proyecto no necesita instalación.

1. Clona o descarga el repositorio.
2. Abre la carpeta del proyecto.
3. Ejecuta `index.html` en tu navegador.

