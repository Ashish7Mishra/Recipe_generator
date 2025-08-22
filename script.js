// element xelectors
const searchBtn = document.querySelector(".search-btn");
const searchInput = document.getElementById("search-input");
const recipeGrid = document.querySelector(".recipe-grid");
const myList = document.querySelector(".my-list");
const randomRecipeBtn = document.getElementById("random-recipe-btn");

const savedModal = document.getElementById("saved-modal");
const closeSavedModalBtn = document.querySelector(".close-btn");

const recipeModal = document.getElementById("recipe-modal");
const closeRecipeModalBtn = document.querySelector(".close-recipe-modal");
const resultSecHead = document.getElementById("results-heading");
const areaSelect = document.getElementById('area-select');
const categorySelect = document.getElementById('category-select');

const shoppingListLink = document.getElementById("shopping-list-link");
const shopListModal = document.getElementById("shop-list-modal");
const closeShopListModalBtn = shopListModal.querySelector(".close-btn");

const addToShopListBtn = document.getElementById('add-to-shop-list-btn');
const clearShopListBtn = document.getElementById('clear-shop-list-btn');

const STORAGE_KEY = "savedRecipes";

let currentRecipeIngredients = [];
let lastSearchResults = [];
let currentSearchItem = "";


async function fetchInitialRecipes() {

    try {
        currentSearchItem = "Chicken";

        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${currentSearchItem}`);
        const data = await response.json();

        if (data.meals) {

            lastSearchResults = data.meals;
            applyFilters();
        } else {

            lastSearchResults = [];
            showMessage("Welcome! Please search for a recipe to get started.");
        }
    } catch (error) {
        console.error("Error fetching initial recipes:", error);
        lastSearchResults = [];
        showMessage("Could not load recipes. Please check your connection and try searching.");
    } finally {
        hideLoader();
    }
}


function showMessage(message) {

    recipeGrid.innerHTML = "";
    recipeGrid.innerHTML = `<p class="recipe-message">${message}</p>`;
}


// Shopping lpst Functions

clearShopListBtn.addEventListener('click', () => {
    localStorage.removeItem("shoppingList");

    populateShopList();
});




shoppingListLink.addEventListener("click", (e) => {
    e.preventDefault();
    shopListModal.classList.remove("hidden");
    populateShopList();
});

closeShopListModalBtn.addEventListener("click", () => {
    shopListModal.classList.add("hidden");
});

addToShopListBtn.addEventListener('click', () => {
    if (currentRecipeIngredients.length > 0) {
        saveIngredientsToShopList(currentRecipeIngredients);
    } else {
        alert("No ingredients to add.");
    }
});

function getShopList() {
    const list = localStorage.getItem("shoppingList");
    return list ? JSON.parse(list) : [];
}

function saveIngredientsToShopList(ingredients) {
    let currentList = getShopList();

    const ingredientsSet = new Set(currentList);
    ingredients.forEach(ingredient => ingredientsSet.add(ingredient));

    localStorage.setItem("shoppingList", JSON.stringify([...ingredientsSet]));

    alert("Ingredients have been added to your shopping list!");
}

function populateShopList() {
    const shopListContent = document.getElementById("shop-list-content");
    const ingredients = getShopList();
    shopListContent.innerHTML = "";

    if (ingredients.length === 0) {
        shopListContent.innerHTML = "<p>Your shopping list is empty.</p>";
        return;
    }

    ingredients.forEach(ingredient => {
        const item = document.createElement("div");
        item.classList.add("shop-list-item");
        item.innerHTML = `
            <span>${ingredient}</span>
            <button class="remove-ingredient-btn" data-ingredient="${ingredient}">&times;</button>
        `;
        shopListContent.appendChild(item);
    });

    document.querySelectorAll('.remove-ingredient-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const ingredientToRemove = e.target.dataset.ingredient;
            removeIngredientFromShopList(ingredientToRemove);
        });
    });
}

function removeIngredientFromShopList(ingredientToRemove) {
    let currentList = getShopList();
    currentList = currentList.filter(item => item !== ingredientToRemove);
    localStorage.setItem("shoppingList", JSON.stringify(currentList));
    populateShopList();
}







document.addEventListener('DOMContentLoaded', () => {
    // Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');
    if (hamburger && navList) {
        hamburger.addEventListener('click', () => {
            navList.classList.toggle('active');
        });
    }
    fetchInitialRecipes();

    document.querySelectorAll('.nav-list a').forEach(link => {
        link.addEventListener('click', () => {
            if (navList.classList.contains('active')) {
                navList.classList.remove('active');
            }
        });
    });
});

searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    findRecipeByName(searchInput.value.trim());
});

randomRecipeBtn.addEventListener("click", async () => {
    recipeModal.style.display = "flex";
    const response = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const data = await response.json();
    const meal = data.meals[0];
    if (meal) {
        populateRecipeModal(meal);
    }
});

myList.addEventListener("click", (e) => {
    e.preventDefault();
    savedModal.classList.remove("hidden");
    populateSavedList();
});

closeSavedModalBtn.addEventListener("click", () => {
    savedModal.classList.add("hidden");
});

closeRecipeModalBtn.addEventListener("click", () => {
    recipeModal.style.display = "none";
});

//working of filter section

areaSelect.addEventListener('change', applyFilters);

categorySelect.addEventListener('change', applyFilters);

// API & Data Functions
async function findRecipeByName(mealName) {
    if (!mealName) return;
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${mealName}`);
        const data = await response.json();

        currentSearchItem = mealName;
        recipeGrid.innerHTML = "";
        if (data.meals) {
            lastSearchResults = data.meals;
            areaSelect.value = "";
            categorySelect.value = "";
            applyFilters();

        }
        else {
            lastSearchResults = [];
            resultSecHead.textContent = `No results for "${mealName}"`;
            showMessage("Sorry, we couldn't find any recipes. Please try another search.");
        }
        syncBookmarkIcons();
        document.getElementById('results-heading').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        lastSearchResults = [];
        showMessage("An error occurred. Please try again later.");
    }
}

function applyFilters() {
    const selectedArea = areaSelect.value;
    const selectedCategory = categorySelect.value;
    const heading = document.getElementById('results-heading');

    let headingText = `Showing results for "${currentSearchItem}"`;
    let filteredResults = lastSearchResults;

    if (selectedArea) {
        categorySelect.value = "";
        filteredResults = filteredResults.filter(meal => meal.strArea === selectedArea);
        headingText = `Showing ${selectedArea} recipes from "${currentSearchItem}"`;
    }

    if (selectedCategory) {
        areaSelect.value = "";
        filteredResults = filteredResults.filter(meal => meal.strCategory === selectedCategory);
        headingText = `Showing ${selectedCategory} recipes from "${currentSearchItem}"`;
    }
    heading.textContent = headingText;
    recipeGrid.innerHTML = "";

    if (filteredResults.length > 0) {
        filteredResults.forEach(meal => createRecipeCard(meal));
    } else {
        showMessage("No recipes match your filter criteria.");
    }
    syncBookmarkIcons();
}



//recipe card 
function createRecipeCard(mealData) {
    let card = document.createElement("div");
    card.classList.add("recipe-card");
    card.dataset.id = mealData.idMeal;

    const tagsHTML = `<p class="meal-tags">Category: ${mealData.strCategory} | Area: ${mealData.strArea}</p>`;

    card.innerHTML = `
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" />
        <h3>${mealData.strMeal}</h3>
          ${tagsHTML}     
         <div class="card-buttons">
            <button class="recipe-btn">View Recipe</button>
            <i class="fa-regular fa-bookmark bookmark-icon"></i>
        </div>
    `;
    recipeGrid.appendChild(card);

    card.querySelector(".recipe-btn").addEventListener("click", () => {
        recipeModal.style.display = "flex";
        populateRecipeModal(mealData);
    });

    const bookMark = card.querySelector(".bookmark-icon");
    bookMark.addEventListener("click", () => {
        const savedRecipes = getSavedRecipes();
        const exists = savedRecipes.find(r => r.idMeal === mealData.idMeal);

        if (exists) {
            removeRecipe(mealData.idMeal);
            updateBookmarkIcon(mealData.idMeal, false);
        } else {
            saveRecipe(mealData);
            updateBookmarkIcon(mealData.idMeal, true);
        }
        populateSavedList();
    });
}

function populateRecipeModal(mealData) {

    currentRecipeIngredients = [];

    const leftDivImg = recipeModal.querySelector(".recipe-left img");
    leftDivImg.setAttribute("src", mealData.strMealThumb);
    leftDivImg.setAttribute("alt", mealData.strMeal);

    const rightDiv = recipeModal.querySelector(".recipe-right");
    rightDiv.querySelector("h2").textContent = mealData.strMeal;
    rightDiv.querySelector("p").textContent = `${mealData.strCategory || ''} | ${mealData.strArea || ''}`;

    const ingList = rightDiv.querySelector(".ingredients-section ul");
    ingList.innerHTML = "";
    for (let i = 1; i <= 20; i++) {
        const ingredient = mealData[`strIngredient${i}`];
        const measure = mealData[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== "") {

            const ingredientString = `${ingredient} - ${measure}`;
            currentRecipeIngredients.push(ingredientString);


            const li = document.createElement("li");
            li.textContent = `${ingredient} - ${measure}`;
            ingList.appendChild(li);
        }
    }

    rightDiv.querySelector(".instruction-section p").textContent = mealData.strInstructions;
}

function populateSavedList() {
    const savedList = document.getElementById("saved-list");
    savedList.innerHTML = "";
    const savedRecipes = getSavedRecipes();

    if (savedRecipes.length === 0) {
        savedList.innerHTML = `<p class="recipe-message">You have no saved recipes yet.</p>`;
        return;
    }

    savedRecipes.forEach(mealData => {
        const savedItem = document.createElement("div");
        savedItem.classList.add("saved-item");
        savedItem.dataset.id = mealData.idMeal;

        savedItem.innerHTML = `
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" />
            <h4>${mealData.strMeal}</h4>
            <p>${mealData.strCategory || "Unknown"} • ${mealData.strArea || "Unknown"}</p>
            <div class="saved-item-buttons">
                <button class="view-saved-btn">View</button>
                <button class="remove-saved">Remove</button>
            </div>
        `;

        savedItem.querySelector(".view-saved-btn").addEventListener("click", () => {
            populateRecipeModal(mealData);
            recipeModal.style.display = "flex";
            savedModal.classList.add("hidden");
        })


        savedItem.querySelector(".remove-saved").addEventListener("click", () => {
            removeRecipe(mealData.idMeal);
            savedItem.remove();
            updateBookmarkIcon(mealData.idMeal, false);
        });
        savedList.appendChild(savedItem);
    });
}

function syncBookmarkIcons() {
    const savedRecipes = getSavedRecipes();
    savedRecipes.forEach(mealData => {
        updateBookmarkIcon(mealData.idMeal, true);
    })
}

function updateBookmarkIcon(mealId, isSaved) {
    const card = document.querySelector(`.recipe-card[data-id="${mealId}"]`);
    if (!card) return;
    const icon = card.querySelector(".bookmark-icon");
    icon.classList.toggle("fa-solid", isSaved);
    icon.classList.toggle("fa-regular", !isSaved);
}

// Local Storage Functions
function getSavedRecipes() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
}

function saveRecipe(mealData) {
    const savedRecipes = getSavedRecipes();
    if (savedRecipes.length >= 10) {
        alert("Maximum 10 recipes can be saved.");
        return;
    }
    const exists = savedRecipes.find(r => r.idMeal === mealData.idMeal);
    if (!exists) {
        savedRecipes.push(mealData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRecipes));
    }
}

function removeRecipe(mealId) {
    let savedRecipes = getSavedRecipes();
    savedRecipes = savedRecipes.filter(r => r.idMeal !== mealId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRecipes));
}