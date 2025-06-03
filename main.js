// main.js - Versión Refactorizada COMPLETA con TOGGLE en desplegarItems

// --- Variables Globales ---
const today = new Date();
const anio = today.getFullYear();
const nextAnio = anio + 1;
const nextNextAnio = anio + 2;

const url = `/api/feriados?anio=${anio}&incluir=opcional`;
const urlNextYear = `/api/feriados?anio=${nextAnio}&incluir=opcional`;
const urlNextNextYear = `/api/feriados?anio=${nextNextAnio}&incluir=opcional`;

const HTMLResponse = document.getElementById("app");
let yearArr = [];
let mostrable = [2, 3, 4, 5, 6, 7, 8, 9];

const btnLimpiar = document.getElementById("btnLimpiar");
const btnCalcular = document.getElementById("btnCalcular");
const ulListado = document.getElementById("ulListado");

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
async function nextYear() {
  yearArr = [];
  const startDateInput = document.getElementById("startDate").value;

  if (!startDateInput) {
    console.warn("Fecha de inicio no seleccionada.");
    if (ulListado)
      ulListado.innerHTML =
        '<p class="error-message">Por favor, selecciona una fecha de inicio.</p>';
    return;
  }

  const initialStartDate = new Date(startDateInput);

  for (let i = 0; i < 731; i++) {
    const currentDate = new Date(initialStartDate);
    currentDate.setDate(initialStartDate.getDate() + i + 1);
    yearArr.push({
      isDate: currentDate,
      dia: 0,
      id: "",
      info: "",
      mes: 0,
      motivo: "",
      tipo: "",
      year: 0,
    });
  }

  if (ulListado)
    ulListado.innerHTML = "<p>Cargando feriados, por favor espera...</p>";
  if (btnLimpiar) btnLimpiar.disabled = true;

  try {
    const results = await Promise.all([
      getHolidaysData(url, anio),
      getHolidaysData(urlNextYear, nextAnio),
      getHolidaysData(urlNextNextYear, nextNextAnio),
    ]);

    if (results[0]) updateHolidayInfoInYearArr(yearArr, results[0]);
    if (results[1]) updateHolidayInfoInYearArr(yearArr, results[1]);
    if (results[2]) updateHolidayInfoInYearArr(yearArr, results[2]);

    agregarElementos(yearArr);
    if (btnLimpiar) btnLimpiar.removeAttribute("disabled");
  } catch (error) {
    console.error("Fallo una o más solicitudes de feriados:", error);
    if (ulListado)
      ulListado.innerHTML = `<p class="error-message">Error al cargar la información de feriados: ${error.message}. Por favor, intente más tarde.</p>`;
  }
}

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
    addHolidayYearProperty(holidaysArr, yearForHolidayData);
    return holidaysArr;
  } catch (error) {
    console.error(
      `Error obteniendo feriados para ${yearForHolidayData} desde ${fetchUrl}:`,
      error
    );
    throw error;
  }
}

function addHolidayYearProperty(holidaysArray, year) {
  if (!holidaysArray || !Array.isArray(holidaysArray)) return; // Verificar si es un array
  for (let i = 0; i < holidaysArray.length; i++) {
    if (holidaysArray[i]) holidaysArray[i].year = year;
  }
}

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
        dayObject.isDate.getFullYear() === holiday.year
      ) {
        dayObject.dia = holiday.dia;
        dayObject.id = holiday.id;
        dayObject.info = holiday.info;
        dayObject.mes = holiday.mes;
        dayObject.motivo = holiday.motivo;
        dayObject.tipo = holiday.tipo;
        dayObject.year = holiday.year;
      }
    }
  }
}

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

function agregarElementos(arr) {
  if (btnLimpiar) btnLimpiar.removeAttribute("disabled");
  if (!ulListado) return;

  ulListado.innerHTML = "";

  arr.forEach((data, index) => {
    const listItem = document.createElement("li");
    const dayIndexInYearArr = index;
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
      listItem.classList.add("holidayLi");
    }

    if (dayIndexInYearArr === 0) {
      listItem.classList.add("invisible");
    }

    if (dayIndexInYearArr % 10 === 0 && dayIndexInYearArr !== 0) {
      const btnDesplegar = document.createElement("button");
      btnDesplegar.setAttribute(
        "onclick",
        `desplegarItems(${dayIndexInYearArr})`
      );
      btnDesplegar.setAttribute("id", `btnDesplegar${dayIndexInYearArr}`);
      btnDesplegar.classList.add("btnDesplegar");

      const imgDesplegar = document.createElement("img");
      imgDesplegar.src = "desplegar.png";
      imgDesplegar.alt = "desplegar"; // Se podría cambiar el alt text dinámicamente
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
 * Muestra u oculta un bloque de ítems en la lista.
 * @param {number} indiceBase El índice del elemento que contiene el botón "desplegar" (ej. 0, 10, 20...).
 */
function desplegarItems(indiceBase) {
  const itemsDelBloque = [];
  for (let i = 1; i < 10; i++) {
    // Items del +1 al +9 del índice base
    const itemIndex = indiceBase + i;
    if (itemIndex < yearArr.length) {
      itemsDelBloque.push(itemIndex);
    } else {
      break;
    }
  }

  if (itemsDelBloque.length === 0) {
    agregarElementos(yearArr); // No hay items que mostrar/ocultar, pero re-renderizar por si acaso
    return;
  }

  // Verificar si el primer ítem del bloque (o cualquiera, en realidad) ya está en 'mostrable'
  // para determinar si la sección está actualmente expandida.
  const estaActualmenteExpandido = mostrable.includes(itemsDelBloque[0]);

  if (estaActualmenteExpandido) {
    // COLAPSAR LA SECCIÓN: Quitar estos ítems de 'mostrable'
    mostrable = mostrable.filter(
      (itemIdx) => !itemsDelBloque.includes(itemIdx)
    );
  } else {
    // EXPANDIR LA SECCIÓN: Añadir estos ítems a 'mostrable' (evitando duplicados)
    itemsDelBloque.forEach((itemIdx) => {
      if (!mostrable.includes(itemIdx)) {
        mostrable.push(itemIdx);
      }
    });
  }
  agregarElementos(yearArr); // Re-renderizar la lista para reflejar los cambios

  // Opcional: Cambiar el ícono del botón (necesitarías una imagen 'colapsar.png')
  const btn = document.getElementById(`btnDesplegar${indiceBase}`);
  if (btn) {
    const img = btn.querySelector("img");
    if (img) {
      if (estaActualmenteExpandido) {
        // Se acaba de colapsar
        img.src = "desplegar.png";
        img.alt = "Mostrar más";
      } else {
        // Se acaba de expandir
        // img.src = "colapsar.png"; // Suponiendo que tienes esta imagen
        // img.alt = "Mostrar menos";
        // Si no tienes imagen de colapsar, puedes dejarla igual o rotarla con CSS
      }
    }
  }
}

function limpiarListado() {
  mostrable = [2, 3, 4, 5, 6, 7, 8, 9];
  if (ulListado) {
    ulListado.innerHTML =
      '<img id="imgPlazos" src="plazos-tribunal.jpg" alt="Plazos Tribunal"><br></br>';
  }
  if (btnLimpiar) btnLimpiar.disabled = true;

  // Considera si necesitas llamar a agregarElementos() aquí.
  // Si yearArr está vacío después de limpiar, o si la imagen es el único estado deseado, no es necesario.
  // Si yearArr aún contiene datos y quieres que los ítems 2-9 se muestren según 'mostrable',
  // entonces SÍ deberías llamar a agregarElementos(yearArr);
  // Por ahora, se asume que la imagen es el estado deseado y 'nextYear' reconstruirá.
}

window.desplegarItems = desplegarItems;
