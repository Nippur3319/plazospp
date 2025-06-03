// main.js - Versión Refactorizada

// --- Variables Globales ---
const today = new Date();
const anio = today.getFullYear();
const nextAnio = anio + 1;
const nextNextAnio = anio + 2;

// URLs apuntando al proxy en Vercel (o Netlify)
const url = `/api/feriados?anio=${anio}&incluir=opcional`;
const urlNextYear = `/api/feriados?anio=${nextAnio}&incluir=opcional`;
const urlNextNextYear = `/api/feriados?anio=${nextNextAnio}&incluir=opcional`;

const HTMLResponse = document.getElementById("app"); // Considera si realmente usas esta variable
let yearArr = []; // Array principal que contendrá los objetos de fecha e información de feriados
let mostrable = [2, 3, 4, 5, 6, 7, 8, 9]; // Días inicialmente visibles (lógica de UI)

const btnLimpiar = document.getElementById("btnLimpiar");
const btnCalcular = document.getElementById("btnCalcular");
const ulListado = document.getElementById("ulListado"); // Obtener una vez para reutilizar

// --- Event Listeners ---
if (btnCalcular) {
  btnCalcular.onclick = function () {
    nextYear();
  };
}

if (btnLimpiar) {
  btnLimpiar.onclick = function () {
    limpiarListado();
  };
}

// --- Lógica Principal ---

/**
 * Prepara el array de días y luego obtiene y procesa los feriados.
 */
async function nextYear() {
  yearArr = []; // Reiniciar el array global de días
  const startDateInput = document.getElementById("startDate").value;

  if (!startDateInput) {
    console.warn("Fecha de inicio no seleccionada.");
    ulListado.innerHTML =
      '<p class="error-message">Por favor, selecciona una fecha de inicio.</p>';
    return;
  }

  const initialStartDate = new Date(startDateInput); // Fecha base para los cálculos

  // Crear el array base de días (731 días para cubrir 2 años completos desde el día siguiente)
  for (let i = 0; i < 731; i++) {
    // Loop 731 veces para incluir el día final
    const currentDate = new Date(initialStartDate);
    currentDate.setDate(initialStartDate.getDate() + i + 1); // Sumar i+1 días a la fecha de inicio

    yearArr.push({
      isDate: currentDate,
      dia: 0,
      id: "",
      info: "",
      mes: 0,
      motivo: "",
      tipo: "",
      year: 0, // Inicializar propiedades
    });
  }

  // Mostrar mensaje de carga y deshabilitar botón de limpiar
  ulListado.innerHTML = "<p>Cargando feriados, por favor espera...</p>";
  btnLimpiar.disabled = true;

  try {
    // Ejecutar todas las solicitudes de feriados en paralelo
    const results = await Promise.all([
      getHolidaysData(url, anio),
      getHolidaysData(urlNextYear, nextAnio),
      getHolidaysData(urlNextNextYear, nextNextAnio),
    ]);

    // Actualizar la información en yearArr con todos los feriados obtenidos.
    // results[0] son los feriados del año actual, results[1] del siguiente, etc.
    if (results[0]) updateHolidayInfoInYearArr(yearArr, results[0]);
    if (results[1]) updateHolidayInfoInYearArr(yearArr, results[1]);
    if (results[2]) updateHolidayInfoInYearArr(yearArr, results[2]);

    // Dibujar la lista UNA SOLA VEZ con toda la información
    agregarElementos(yearArr);
    if (btnLimpiar) btnLimpiar.removeAttribute("disabled"); // Habilitar después de cargar
  } catch (error) {
    console.error("Fallo una o más solicitudes de feriados:", error);
    ulListado.innerHTML = `<p class="error-message">Error al cargar la información de feriados: ${error.message}. Por favor, intente más tarde.</p>`;
  }
}

/**
 * Función genérica para obtener datos de feriados desde una URL.
 * @param {string} fetchUrl La URL del proxy para obtener los feriados.
 * @param {number} yearForHolidayData El año para el cual se solicitan los feriados.
 * @returns {Promise<Array<Object>>} Una promesa que resuelve con el array de feriados procesado.
 */
async function getHolidaysData(fetchUrl, yearForHolidayData) {
  try {
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Respuesta no JSON del servidor" }));
      throw new Error(
        `Error ${
          response.status
        } de la API para el año ${yearForHolidayData}: ${
          errorData.error || response.statusText
        }`
      );
    }
    const holidaysArr = await response.json();
    addHolidayYearProperty(holidaysArr, yearForHolidayData); // Añade la propiedad 'year' a cada feriado
    return holidaysArr;
  } catch (error) {
    console.error(
      `Error obteniendo feriados para ${yearForHolidayData} desde ${fetchUrl}:`,
      error
    );
    throw error; // Re-lanzar para que Promise.all lo capture y maneje centralizadamente.
  }
}

/**
 * Añade la propiedad 'year' a cada objeto en un array de feriados.
 * @param {Array<Object>} holidaysArray Array de objetos de feriados.
 * @param {number} year El año a asignar.
 */
function addHolidayYearProperty(holidaysArray, year) {
  for (let i = 0; i < holidaysArray.length; i++) {
    holidaysArray[i].year = year;
  }
}

/**
 * Actualiza el array principal `yearArr` con la información de los feriados.
 * @param {Array<Object>} targetYearArr El array de días a actualizar (normalmente el global `yearArr`).
 * @param {Array<Object>} holidaysFromApi Array de feriados obtenidos de la API para un año específico.
 */
function updateHolidayInfoInYearArr(targetYearArr, holidaysFromApi) {
  if (!holidaysFromApi) {
    console.warn(
      "Conjunto de feriados vacío o con error, omitiendo actualización para este conjunto."
    );
    return;
  }
  for (let i = 0; i < targetYearArr.length; i++) {
    const dayObject = targetYearArr[i];
    for (let z = 0; z < holidaysFromApi.length; z++) {
      const holiday = holidaysFromApi[z];
      if (
        dayObject.isDate.getMonth() + 1 === holiday.mes &&
        dayObject.isDate.getDate() === holiday.dia &&
        dayObject.isDate.getFullYear() === holiday.year // holiday.year fue añadido por addHolidayYearProperty
      ) {
        dayObject.dia = holiday.dia;
        dayObject.id = holiday.id;
        dayObject.info = holiday.info;
        dayObject.mes = holiday.mes;
        dayObject.motivo = holiday.motivo;
        dayObject.tipo = holiday.tipo;
        dayObject.year = holiday.year; // Asignar también el año del feriado al objeto día
      }
    }
  }
}

/**
 * Obtiene el nombre del día de la semana.
 * @param {number} dayIndex El índice del día (0 para Domingo, 1 para Lunes, etc.).
 * @returns {string} El nombre del día.
 */
function getDayName(dayIndex) {
  const dayNames = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  return dayNames[dayIndex] || "Día Desconocido";
}

/**
 * Renderiza los elementos de la lista en el DOM.
 * @param {Array<Object>} arr El array de días (`yearArr`) a mostrar.
 */
function agregarElementos(arr) {
  if (btnLimpiar) btnLimpiar.removeAttribute("disabled");
  if (!ulListado) return; // Salir si el elemento de la lista no existe

  ulListado.innerHTML = ""; // Limpiar contenido anterior

  arr.forEach((data, index) => {
    // El segundo parámetro de forEach es el índice
    const listItem = document.createElement("li");
    const dayIndexInYearArr = index; // Usar el índice del forEach que es más fiable que indexOf en arrays de objetos

    const currentWeekDayName = getDayName(data.isDate.getDay());

    const contenidoP = document.createElement("p");
    contenidoP.innerHTML = `${dayIndexInYearArr} días: ${currentWeekDayName}, ${data.isDate.getDate()}/${
      data.isDate.getMonth() + 1
    }/${data.isDate.getFullYear()}`;
    listItem.appendChild(contenidoP);

    if (data.motivo && data.motivo !== "") {
      const infoFeriadoP = document.createElement("p");
      infoFeriadoP.innerHTML = `<a href="${data.info}" target="_blank" rel="noopener noreferrer">${data.motivo}</a> (${data.tipo})`;
      listItem.appendChild(infoFeriadoP);
      listItem.classList.add("holidayLi"); // Clase específica para feriados
    }

    // Lógica de visibilidad y formato
    if (dayIndexInYearArr === 0) {
      listItem.classList.add("invisible");
    }

    if (dayIndexInYearArr % 10 === 0 && dayIndexInYearArr !== 0) {
      // No añadir botón al día 0
      const btnDesplegar = document.createElement("button");
      btnDesplegar.setAttribute(
        "onclick",
        `desplegarItems(${dayIndexInYearArr})`
      );
      btnDesplegar.setAttribute("id", `btnDesplegar${dayIndexInYearArr}`);
      btnDesplegar.classList.add("btnDesplegar");

      const imgDesplegar = document.createElement("img");
      imgDesplegar.src = "desplegar.png"; // Asegúrate que esta imagen exista en la ruta correcta
      imgDesplegar.alt = "desplegar";
      imgDesplegar.width = 10;
      btnDesplegar.appendChild(imgDesplegar);
      listItem.appendChild(btnDesplegar);
    } else if (
      mostrable.indexOf(dayIndexInYearArr) === -1 &&
      dayIndexInYearArr !== 0
    ) {
      listItem.classList.add("regularLi", "invisible");
    } else if (dayIndexInYearArr !== 0) {
      listItem.classList.add("smallLi");
    }

    if (currentWeekDayName === "Sábado" || currentWeekDayName === "Domingo") {
      listItem.classList.add("weekendLi");
    }

    ulListado.appendChild(listItem);
  });
}

/**
 * Muestra más ítems en la lista (lógica de UI para desplegar).
 * @param {number} indice El índice base desde el cual mostrar más ítems.
 */
function desplegarItems(indice) {
  // Añadir los próximos 9 días (del indice+1 al indice+9) al array 'mostrable'
  // sin duplicados y asegurándose de no exceder los límites de yearArr.
  for (let i = 1; i < 10; i++) {
    const itemIndexToShow = indice + i;
    if (
      itemIndexToShow < yearArr.length &&
      mostrable.indexOf(itemIndexToShow) === -1
    ) {
      mostrable.push(itemIndexToShow);
    }
  }
  // Reordenar 'mostrable' puede ser útil si el orden importa para otra lógica, aunque aquí no parece crucial.
  // mostrable.sort((a, b) => a - b);
  agregarElementos(yearArr); // Re-renderizar la lista con los nuevos ítems visibles
}

/**
 * Limpia el listado y resetea el estado de visibilidad.
 */
function limpiarListado() {
  mostrable = [2, 3, 4, 5, 6, 7, 8, 9]; // Resetear al estado inicial
  if (ulListado) {
    ulListado.innerHTML =
      '<img id="imgPlazos" src="plazos-tribunal.jpg" alt="Plazos Tribunal"><br></br>'; // Asegúrate que esta imagen exista
  }
  if (btnLimpiar) btnLimpiar.disabled = true;
  // También podrías limpiar el input de fecha si lo deseas:
  // const startDateInputEl = document.getElementById("startDate");
  // if (startDateInputEl) startDateInputEl.value = "";
}

// Para que desplegarItems sea accesible globalmente si se usa en `onclick` en HTML generado dinámicamente
window.desplegarItems = desplegarItems;
