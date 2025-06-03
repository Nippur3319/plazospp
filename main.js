// main.js - Versión con CONSOLE.LOGS para Depuración

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
  console.log("--- Iniciando nextYear() ---"); // DEBUG
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
  console.log("yearArr creado con", yearArr.length, "elementos."); // DEBUG

  if (ulListado)
    ulListado.innerHTML = "<p>Cargando feriados, por favor espera...</p>";
  if (btnLimpiar) btnLimpiar.disabled = true;

  try {
    console.log("Intentando obtener datos de feriados..."); // DEBUG
    const results = await Promise.all([
      getHolidaysData(url, anio),
      getHolidaysData(urlNextYear, nextAnio),
      getHolidaysData(urlNextNextYear, nextNextAnio),
    ]);
    console.log("Datos de feriados obtenidos:", results); // DEBUG

    if (results[0]) updateHolidayInfoInYearArr(yearArr, results[0]);
    if (results[1]) updateHolidayInfoInYearArr(yearArr, results[1]);
    if (results[2]) updateHolidayInfoInYearArr(yearArr, results[2]);
    console.log("yearArr actualizado con información de feriados."); // DEBUG

    agregarElementos(yearArr);
    if (btnLimpiar) btnLimpiar.removeAttribute("disabled");
  } catch (error) {
    console.error("Fallo una o más solicitudes de feriados:", error);
    if (ulListado)
      ulListado.innerHTML = `<p class="error-message">Error al cargar la información de feriados: ${error.message}. Por favor, intente más tarde.</p>`;
  }
  console.log("--- Finalizando nextYear() ---"); // DEBUG
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
  if (!holidaysArray || !Array.isArray(holidaysArray)) return;
  for (let i = 0; i < holidaysArray.length; i++) {
    if (holidaysArray[i]) {
      holidaysArray[i].year = year;
    }
  }
}

function updateHolidayInfoInYearArr(targetYearArr, holidaysFromApi) {
  if (!holidaysFromApi || !Array.isArray(holidaysFromApi)) {
    console.warn(
      "Conjunto de feriados inválido o vacío en updateHolidayInfoInYearArr."
    ); // DEBUG
    return;
  }
  for (let i = 0; i < targetYearArr.length; i++) {
    const dayObject = targetYearArr[i];
    for (let z = 0; z < holidaysFromApi.length; z++) {
      const holiday = holidaysFromApi[z];
      if (
        holiday &&
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

  console.log("--- Entrando a agregarElementos ---"); // DEBUG
  console.log(
    "Estado actual de 'mostrable' al inicio de agregarElementos:",
    JSON.parse(JSON.stringify(mostrable))
  ); // DEBUG

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
      // listItem.classList.add("holidayLi"); // Se añade más abajo
    }

    let clasesAplicadasLog = []; // Para loguear

    if (dayIndexInYearArr === 0) {
      listItem.classList.add("invisible");
      clasesAplicadasLog.push("invisible (día 0)");
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
      imgDesplegar.width = 10;
      imgDesplegar.classList.add("icono-desplegable");

      const primerItemDelBloque = dayIndexInYearArr + 1;
      const estaSeccionExpandida = mostrable.includes(primerItemDelBloque);
      clasesAplicadasLog.push(
        `btnDesplegar (sección ${
          estaSeccionExpandida ? "expandida" : "contraída"
        })`
      );

      if (estaSeccionExpandida) {
        imgDesplegar.classList.add("icono-rotado");
        imgDesplegar.alt = "Mostrar menos";
      } else {
        imgDesplegar.classList.remove("icono-rotado");
        imgDesplegar.alt = "Mostrar más";
      }

      btnDesplegar.appendChild(imgDesplegar);
      listItem.appendChild(btnDesplegar);
    } else if (
      // Para días que no son múltiplos de 10 y no son el día 0
      !mostrable.includes(dayIndexInYearArr) &&
      dayIndexInYearArr !== 0
    ) {
      listItem.classList.add("regularLi", "invisible");
      clasesAplicadasLog.push("regularLi", "invisible (NO en mostrable)");
    } else if (dayIndexInYearArr !== 0) {
      // Si está en mostrable (y no es día 0 ni múltiplo de 10)
      listItem.classList.add("smallLi");
      clasesAplicadasLog.push("smallLi (en mostrable o default visible)");
    }

    // Aplicar clases de fin de semana y feriado independientemente de la visibilidad
    if (currentWeekDayName === "Sábado" || currentWeekDayName === "Domingo") {
      listItem.classList.add("weekendLi");
      clasesAplicadasLog.push("weekendLi");
    }
    if (data.motivo && data.motivo !== "") {
      listItem.classList.add("holidayLi");
      clasesAplicadasLog.push("holidayLi");
    }

    console.log(
      `Día ${dayIndexInYearArr}: Fecha: ${data.isDate.toLocaleDateString()}, En mostrable? ${mostrable.includes(
        dayIndexInYearArr
      )}. Clases: [${clasesAplicadasLog.join(", ")}]`
    ); // DEBUG

    ulListado.appendChild(listItem);
  });
  console.log("--- Saliendo de agregarElementos ---"); // DEBUG
}

function desplegarItems(indiceBase) {
  console.log(`--- Entrando a desplegarItems(${indiceBase}) ---`); // DEBUG
  console.log(
    "Antes de modificar, 'mostrable':",
    JSON.parse(JSON.stringify(mostrable))
  ); // DEBUG

  const itemsDelBloque = [];
  for (let i = 1; i < 10; i++) {
    const itemIndex = indiceBase + i;
    if (itemIndex < yearArr.length) {
      itemsDelBloque.push(itemIndex);
    } else {
      break;
    }
  }

  if (itemsDelBloque.length === 0) {
    console.log("desplegarItems: No hay ítems en el bloque para alternar."); // DEBUG
    agregarElementos(yearArr);
    return;
  }

  const estaActualmenteExpandido = mostrable.includes(itemsDelBloque[0]);
  console.log(
    `Ítems del bloque a alternar: [${itemsDelBloque.join(
      ", "
    )}]. ¿Está sección expandida? ${estaActualmenteExpandido}`
  ); // DEBUG

  if (estaActualmenteExpandido) {
    console.log("Intentando COLAPSAR sección."); // DEBUG
    mostrable = mostrable.filter(
      (itemIdx) => !itemsDelBloque.includes(itemIdx)
    );
  } else {
    console.log("Intentando EXPANDIR sección."); // DEBUG
    itemsDelBloque.forEach((itemIdx) => {
      if (!mostrable.includes(itemIdx)) {
        mostrable.push(itemIdx);
      }
    });
  }
  console.log(
    "Después de modificar, 'mostrable':",
    JSON.parse(JSON.stringify(mostrable))
  ); // DEBUG
  agregarElementos(yearArr);
  console.log("--- Saliendo de desplegarItems ---"); // DEBUG
}

function limpiarListado() {
  console.log("--- Entrando a limpiarListado ---"); // DEBUG
  mostrable = [2, 3, 4, 5, 6, 7, 8, 9];
  console.log(
    "'mostrable' reseteado a:",
    JSON.parse(JSON.stringify(mostrable))
  ); // DEBUG
  if (ulListado) {
    ulListado.innerHTML =
      '<img id="imgPlazos" src="plazos-tribunal.jpg" alt="Plazos Tribunal"><br></br>';
  }
  if (btnLimpiar) btnLimpiar.disabled = true;
}

window.desplegarItems = desplegarItems;
