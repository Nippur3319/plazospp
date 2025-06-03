// Contenido del archivo: /api/feriados.js

export default async function handler(request, response) {
  const { anio, incluir } = request.query; // Ej: /api/feriados?anio=2024&incluir=opcional

  if (!anio) {
    return response
      .status(400)
      .json({ error: 'El parámetro "anio" es requerido.' });
  }

  const incluirOpcional = incluir === "opcional";
  const apiUrl = `https://nolaborables.com.ar/api/v2/feriados/<span class="math-inline">\{anio\}</span>{incluirOpcional ? '?incluir=opcional' : ''}`;

  try {
    console.log(`[PROXY] Solicitando a: ${apiUrl}`);
    const apiRespuestaExterna = await fetch(apiUrl);
    const datos = await apiRespuestaExterna.json();

    if (!apiRespuestaExterna.ok) {
      console.error(
        `[PROXY] Error API externa: ${apiRespuestaExterna.status}`,
        datos
      );
      return response.status(apiRespuestaExterna.status).json(datos);
    }

    // Cabeceras CORS (útiles si llamas desde un dominio diferente, como GitHub Pages temporalmente)
    // Si todo está en Vercel (frontend y API), son menos críticas para llamadas mismo-origen.
    response.setHeader("Access-Control-Allow-Origin", "*"); // O tu dominio específico
    response.setHeader("Access-Control-Allow-Methods", "GET");

    console.log(`[PROXY] Enviando datos para ${anio}`);
    response.status(200).json(datos);
  } catch (error) {
    console.error("[PROXY] Error interno:", error);
    response
      .status(500)
      .json({ error: "Error interno en el proxy.", details: error.message });
  }
}
