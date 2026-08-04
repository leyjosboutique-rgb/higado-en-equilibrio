// middleware.js — va en la RAÍZ del repo (mismo nivel que el archivo HTML de la landing).
// Vercel lo detecta y lo ejecuta automáticamente en el Edge, sin configuración extra.
//
// Qué hace: si el visitante entra desde México, reescribe el precio (texto) de la
// landing antes de servirla. Colombia y cualquier otro país ven la página tal cual.
// El botón de compra queda IGUAL para los dos países — confirmado con captura real
// de checkout: el mismo link de Hotmart ya auto-convierte a MXN con IVA incluido
// (~$261 MXN), así que no hace falta una segunda oferta ni un segundo link.
//
// ANTES DE SUBIR: confirmá el nombre del archivo HTML real que sirve Vercel en
// NOMBRE_ARCHIVO_HTML. Probá abriendo esa URL directo en el navegador — si carga
// la landing completa, está bien apuntado. Si da 404, probá con "/index.html".

export const config = {
  matcher: '/',
};

const NOMBRE_ARCHIVO_HTML = '/index.html';

export default async function middleware(request) {
  const country =
    request.geo?.country ||
    request.headers.get('x-vercel-ip-country') ||
    '';

  // Colombia y el resto del mundo: no se toca nada.
  if (country !== 'MX') {
    return;
  }

  // México: se trae el HTML original y se reescribe solo el texto del precio.
  const origen = await fetch(new URL(NOMBRE_ARCHIVO_HTML, request.url));
  let html = await origen.text();

  html = html
    .replaceAll('Precio normal: $79.900', 'Precio normal: $520 MXN')
    .replaceAll('Después vuelve a $79.900.', 'Después vuelve a $520 MXN.')
    .replaceAll('$39.900', '$260 MXN');
  // El link de Hotmart NO se toca — mismo link para los dos países,
  // Hotmart ya convierte solo según la IP del comprador.

  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
