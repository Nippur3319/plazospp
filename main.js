

let today = new Date();
let anio = today.getFullYear();
let url = `http://nolaborables.com.ar/api/v2/feriados/${anio}?incluir=opcional`
let urlNextYear = `http://nolaborables.com.ar/api/v2/feriados/${anio + 1}?incluir=opcional`

let HTMLResponse = document.getElementById("app")
let yearArr = [];
let weekDayName;
document.getElementById("btn").onclick = function() {nextYear()};


function nextYear() {
    
    yearArr = [];
    let startDate = new Date(document.getElementById("startDate").value)
    for (let i = 0; i <= 365 ; i++) {
        let newDate = {
            isDate: new Date(startDate.setDate(startDate.getDate() + 1)),
            dia: 0,
            id: "",
            info: "",
            mes: 0,
            motivo: "",
            tipo: ""
            }; 
        
        yearArr.push(newDate);
    }
    getHolidays();
    
}

function getDayName(value){
    switch (value) {
        case 0:
            weekDayName = "Domingo";
            break;
        case 1:
            weekDayName = "Lunes";
            break;
        case 2:
            weekDayName = "Martes";
            break;
        case 3:
            weekDayName = "Miércoles";
            break;
        case 4:
            weekDayName = "Jueves";
            break;
        case 5:
            weekDayName = "Viernes";
            break;
        case 6:
            weekDayName = "Sábado";
            break;
    }

}



async function getHolidays() {
    // ya funciona bien trae el array falta llenar el dom
    
    
    fetch(url)
    .then(response => response.json())
    .then(holidaysArr => {
        updateNextYearInfo(yearArr,holidaysArr);
    })

}

function updateNextYearInfo(year,holidays){
    for (let i = 0; i < year.length; i++) {
        for (let z = 0; z < holidays.length; z++) {
            
            if (year[i].isDate.getMonth() + 1 == holidays[z].mes && year[i].isDate.getDate() ==  holidays[z].dia ) {
                year[i].dia = holidays[z].dia;
                year[i].id = holidays[z].id;
                year[i].info = holidays[z].info;
                year[i].mes = holidays[z].mes;
                year[i].motivo = holidays[z].motivo;
                year[i].tipo = holidays[z].tipo;

                
            }
            
                   }
        
    }
    yearArr = year;
    console.log(JSON.stringify(yearArr));
    agregarElementos(yearArr) ;
    
} 






function agregarElementos(arr){ 
    console.log("a vergaston " + JSON.stringify(arr))
    document.getElementById("ulListado").innerHTML = "";
    var lista=document.getElementById("ulListado"); 
    
    
    arr.forEach(function(data,index){
        var linew= document.createElement("li");    
        getDayName(data.isDate.getDay());
        var contenido = document.createTextNode(
            `${yearArr.indexOf(data)} días: ${weekDayName}, ${data.isDate.getDate()}/${data.isDate.getMonth() + 1}/${data.isDate.getFullYear()} ${data.id}  ${data.info}`) 

        if (arr.indexOf(data) % 5 == 0 ) {
                linew.className = "boldLi";
        } else {
            linew.className = "regularLi";
        }

        lista.appendChild(linew);
        linew.appendChild(contenido);

    })
}
