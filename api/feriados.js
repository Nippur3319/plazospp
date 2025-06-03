// Contenido del archivo: /api/feriados.js

export default async function handler(request, response) {
  const { anio, incluir } = request.query;

  if (!anio) {
    return response
      .status(400)
      .json({ error: 'El parámetro "anio" es requerido.' });
  }

  const incluirOpcional = incluir === "opcional";
  const apiUrl = `https://nolaborables.com.ar/api/v2/feriados/${anio}${
    incluirOpcional ? "?incluir=opcional" : ""
  }`;

  try {
    console.log(`[PROXY] Solicitando a URL externa: ${apiUrl}`);
    const apiRespuestaExterna = await fetch(apiUrl);

    // --- Sección de Depuración Adicional ---
    console.log(`[PROXY] Status de API externa: ${apiRespuestaExterna.status}`);
    console.log(
      `[PROXY] StatusText de API externa: ${apiRespuestaExterna.statusText}`
    );
    console.log(
      `[PROXY] Content-Type de API externa: ${apiRespuestaExterna.headers.get(
        "content-type"
      )}`
    );

    // Obtenemos la respuesta como TEXTO para poder verla, sea JSON o HTML
    const respuestaComoTexto = await apiRespuestaExterna.text();
    console.log(
      `[PROXY] Respuesta TEXTUAL de API externa: ${respuestaComoTexto}`
    );
    // --- Fin Sección de Depuración Adicional ---

    // Ahora, verificamos si la respuesta de la API externa fue exitosa DESPUÉS de obtener el texto
    if (!apiRespuestaExterna.ok) {
      console.error(
        `[PROXY] Error de la API externa (status no OK): ${apiRespuestaExterna.status}. Respuesta: ${respuestaComoTexto}`
      );
      // Intentamos devolver la respuesta textual si no es JSON, o un error genérico
      // No intentamos parsear como JSON aquí si ya sabemos que no es 'ok', podría ser HTML de error
      return response
        .status(apiRespuestaExterna.status)
        .send(
          respuestaComoTexto ||
            `Error ${apiRespuestaExterna.status} de la API externa.`
        );
    }

    // Si la respuesta fue 'ok' (status 200-299), AHORA intentamos convertir el texto a JSON
    // Este es el punto donde originalmente ocurría el error si el texto no era JSON válido.
    const datos = JSON.parse(respuestaComoTexto);

    // Cabeceras CORS
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET");

    console.log(
      `[PROXY] Enviando datos JSON procesados para el año ${anio} al cliente.`
    );
    response.status(200).json(datos);
  } catch (error) {
    // Este bloque catch ahora capturará errores como el de JSON.parse si 'respuestaComoTexto'
    // (incluso con status ok) no es un JSON válido, o cualquier otro error de ejecución.
    console.error(
      "[PROXY] Error interno en la función (puede ser al parsear JSON o error de ejecución):",
      error.message
    );
    console.error("[PROXY] Stack del error:", error.stack); // Muestra más detalles del error

    response.status(500).json({
      error: "Error interno en el servidor proxy al procesar la respuesta.",
      details: error.message,
    });
  }
}
