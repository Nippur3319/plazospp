// Contenido del archivo: /api/feriados.js

export default async function handler(request, response) {
  const { anio, incluir } = request.query;

  if (!anio) {
    return response
      .status(400)
      .json({ error: 'El parámetro "anio" es requerido.' });
  }

  const incluirOpcional = incluir === "opcional";
  const apiUrl = `https://api.argentinadatos.com/v1/feriados/${anio}`;

  try {
    console.log(`[PROXY] Solicitando a URL externa: ${apiUrl}`);
    const apiRespuestaExterna = await fetch(apiUrl);

    console.log(`[PROXY] Status de API externa: ${apiRespuestaExterna.status}`);
    const respuestaComoTexto = await apiRespuestaExterna.text();

    if (!apiRespuestaExterna.ok) {
      console.warn(
        `[PROXY] Error de la API externa (status ${apiRespuestaExterna.status}) al obtener feriados de ${anio}. Retornando lista vacía.`
      );
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.setHeader("Access-Control-Allow-Methods", "GET");
      return response.status(200).json([]);
    }

    const datosOriginales = JSON.parse(respuestaComoTexto);

    // Filtrar si no se solicitan opcionales (no_laborable)
    let datosFiltrados = datosOriginales;
    if (!incluirOpcional) {
      datosFiltrados = datosOriginales.filter(item => item.tipo !== 'no_laborable');
    }

    // Mapear al formato esperado por el frontend
    const datosMapeados = datosFiltrados.map(item => {
      const partes = item.fecha.split('-');
      const mesFeriado = parseInt(partes[1], 10);
      const diaFeriado = parseInt(partes[2], 10);
      
      return {
        dia: diaFeriado,
        mes: mesFeriado,
        motivo: item.nombre,
        tipo: item.tipo,
        info: "https://argentinadatos.com",
        id: item.nombre.toLowerCase().replace(/[^a-z0-9]/g, "-")
      };
    });

    // Cabeceras CORS
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET");

    console.log(
      `[PROXY] Enviando datos JSON procesados para el año ${anio} al cliente.`
    );
    response.status(200).json(datosMapeados);
  } catch (error) {
    console.error(
      `[PROXY] Error al procesar la respuesta para el año ${anio}:`,
      error.message
    );
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET");
    response.status(200).json([]);
  }
}

