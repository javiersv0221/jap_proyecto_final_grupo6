const ORDER_ASC_BY_NAME = "AZ";
const ORDER_DESC_BY_NAME = "ZA";
const ORDER_BY_PROD_COUNT = "Cant.";
let currentCategoriesArray = [];
let currentSortCriteria = undefined;
let minCount = undefined;
let maxCount = undefined;

function sortCategories(criteria, array){
    let result = [];
    if (criteria === ORDER_ASC_BY_NAME)
    {
        result = array.sort(function(a, b) {
            if ( a.name < b.name ){ return -1; }
            if ( a.name > b.name ){ return 1; }
            return 0;
        });
    }else if (criteria === ORDER_DESC_BY_NAME){
        result = array.sort(function(a, b) {
            if ( a.name > b.name ){ return -1; }
            if ( a.name < b.name ){ return 1; }
            return 0;
        });
    }else if (criteria === ORDER_BY_PROD_COUNT){
        result = array.sort(function(a, b) {
            let aCount = parseInt(a.productCount);
            let bCount = parseInt(b.productCount);

            if ( aCount > bCount ){ return -1; }
            if ( aCount < bCount ){ return 1; }
            return 0;
        });
    }

    return result;
}

function setCatID(id) {
    localStorage.setItem("catID", id);
    window.location = "products.html"
}

function showCategoriesList() {
  const container = document.getElementById("cat-list-container");
  let html = "";

  for (let i = 0; i < currentCategoriesArray.length; i++) {
    const category = currentCategoriesArray[i];
    const count = parseInt(category.productCount);

    const passMin = (minCount == undefined) || (count >= minCount);
    const passMax = (maxCount == undefined) || (count <= maxCount);

    if (passMin && passMax) {
      html += `
        <li class="category-card">
          <a class="category-link" href="products.html" onclick="setCatID(${category.id})">
            <img class="category-media" src="${category.imgSrc}" alt="${category.name}">
            <div class="category-body">
              <div class="category-head">
                <h3 class="category-title">${category.name}</h3>
                <span class="category-count">${category.productCount} artículos</span>
              </div>
              <p class="category-desc">${category.description}</p>
            </div>
          </a>
        </li>
      `;
    }
  }

  container.innerHTML = html || `
    <li class="category-card">
      <div class="category-body">
        <h3 class="category-title">Sin resultados</h3>
        <p class="category-desc">No hay categorías que coincidan con el filtro.</p>
      </div>
    </li>
  `;
}

const toggleView = document.getElementById("list-grid");
const catList = document.getElementById("cat-list-container");
const icon = document.getElementById("icon-list-grid");

// Vista inicial (grid)
catList.classList.add("grid-view");

toggleView.addEventListener("change", () => {
  if (toggleView.checked) {
    catList.classList.remove("grid-view");
    catList.classList.add("list-view");
    icon.textContent = "view_list"; // cambia el ícono
  } else {
    catList.classList.remove("list-view");
    catList.classList.add("grid-view");
    icon.textContent = "grid_view"; // vuelve a cuadritos
  }
});




function sortAndShowCategories(sortCriteria, categoriesArray){
    currentSortCriteria = sortCriteria;

    if(categoriesArray != undefined){
        currentCategoriesArray = categoriesArray;
    }

    currentCategoriesArray = sortCategories(currentSortCriteria, currentCategoriesArray);

    //Muestro las categorías ordenadas
    showCategoriesList();
}

//Función que se ejecuta una vez que se haya lanzado el evento de
//que el documento se encuentra cargado, es decir, se encuentran todos los
//elementos HTML presentes.
document.addEventListener("DOMContentLoaded", function(e){
    getJSONData(CATEGORIES_URL).then(function(resultObj){
        if (resultObj.status === "ok"){
            currentCategoriesArray = resultObj.data
            showCategoriesList()
            //sortAndShowCategories(ORDER_ASC_BY_NAME, resultObj.data);
        }
    });

    document.getElementById("sortAsc").addEventListener("click", function(){
        sortAndShowCategories(ORDER_ASC_BY_NAME);
    });

    document.getElementById("sortDesc").addEventListener("click", function(){
        sortAndShowCategories(ORDER_DESC_BY_NAME);
    });

});