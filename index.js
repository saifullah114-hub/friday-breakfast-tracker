let form = document.getElementById("form");
let formSubmitButton = document.getElementById("form-submit-button");
let numberOfVegetarian = 0;
let numberOfEggetarian = 0;
let numberOfNonVegetarian = 0;
let numberOfTea = 0;
let numberOfCoffee = 0;
let numberOfJuice = 0;
let numberOfIceTea = 0;
let numberOfUser = 0;
let eggScore = 0;
let vegScore = 0;
let nonVegScore = 0;
let teaScore = 0;
let coffeeScore = 0;
let juiceScore = 0;
let iceTeaScore = 0;
let currentPage = 0;
let pageSize = 5;
let userData = [];
let pages = "";
let page = [];
let arrList = [];
let pageLi = "";


let listItemList = document.getElementById("pagination");
let foodChartTitle = document.getElementsByClassName("food-chart-title");
const selectFood = document.getElementById("food-choice");
selectFood.selectedIndex = -1; //making by-default option null
const selectDrink = document.getElementById("drink-choice");
selectDrink.selectedIndex = -1; //making by-default option null

const postData = (bodyContent) => {
  fetch("http://localhost:3000/users/", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(bodyContent),
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.log(error);
    });
};
form.addEventListener("submit", (e) => {
  e.preventDefault();
  let firstName = e.target[0].value;
  let lastName = e.target[1].value;
  let foodChoice = e.target[2].value;
  let drinkChoice = e.target[3].value;
  let bodyContent = {
    name: `${firstName}`,
    lastName: `${lastName}`,
    foodChoice: `${foodChoice}`,
    drinkChoice: `${drinkChoice}`,
  };
  postData(bodyContent);
});
const onLoad = async () => {
  const response = await fetch("http://localhost:3000/users/");
  userData = await response.json();
  return userData;
};

const createPagination = async () => {
  const dataPages = await onLoad();
  pages = paginate(dataPages, pageSize); //it is returning array containing array in chunks. for eg-> i have 12 enteries i will get 3 array [[],[],[]] because my row_size is 5
  page = pages[currentPage];//to extract the index of pages to show data of that particular index
  pages.forEach((element, index) => {
    let li = document.createElement("button"); //dynamically creating button based on number of arrays
    li.setAttribute("class", "list-button list-item");
    li.setAttribute("id", `page_${index}`);
    li.innerHTML = index + 1;
    listItemList.appendChild(li);
  });
  const btns = document.querySelectorAll(".list-item");
  for (let i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function (e) { //applying eventListner of button that we created and calling function to change and update the table
      changePage(e.target.innerHTML - 1);
    });
  }
  printRows(page);
};

//this function is storing data for eg: i have set row-size:5, now it will create chunks of 5-5 element and push it into array
const paginate = (arr, size) => {
  return arr.reduce((acc, val, i) => {
    let idx = Math.floor(i / size);
    let page = acc[idx] || (acc[idx] = []);
    page.push(val);
    return acc;
  }, []);
};
//it update the currentPage index and calls to print rows of that data
const changePage = (idx) => {
  currentPage = idx;
  let newpage = pages[currentPage];
  printRows(newpage);
};
const printRows = (data) => {
  var temp = "";
  data.forEach((itemData) => {
    temp += "<tr>";
    temp += "<td >" + itemData.name + "</td>";
    temp += "<td>" + itemData.lastName + "</td>";
    temp += "<td>" + itemData.drinkChoice + "</td>";
    temp += "<td>" + itemData.foodChoice + "</td></tr>";
  });
  document.getElementById("table-data").innerHTML = temp;
};

const calculateScore = (input, total) => {
  return Math.floor((input / total) * 100); //formula to calculate the score out of 100 for bar graph
};

//-> in this function we calculated number of veg,non-veg,egg and for tea,coffee,ice-tea and juice
const barGraphDetails = async () => {
  const data = await onLoad();
  numberOfUser = data.length;
  data.forEach((itemData) => {
    if (itemData.foodChoice === "veg") {
      numberOfVegetarian += 1;
    } else if (itemData.foodChoice === "egg") {
      numberOfEggetarian += 1;
    } else {
      numberOfNonVegetarian += 1;
    }
    if (itemData.drinkChoice === "tea") {
      numberOfTea += 1;
    } else if (itemData.drinkChoice === "coffee") {
      numberOfCoffee += 1;
    } else if (itemData.drinkChoice === "juice") {
      numberOfJuice += 1;
    } else if (itemData.drinkChoice === "ice-tea") {
      numberOfIceTea += 1;
    }
  });
  //- to create bar graph we need to calculate score based out of total values
  teaScore = calculateScore(numberOfTea, numberOfUser);
  coffeeScore = calculateScore(numberOfCoffee, numberOfUser);
  juiceScore = calculateScore(numberOfJuice, numberOfUser);
  iceTeaScore = calculateScore(numberOfIceTea, numberOfUser);
  eggScore = calculateScore(numberOfEggetarian, numberOfUser);
  vegScore = calculateScore(numberOfVegetarian, numberOfUser);
  nonVegScore = calculateScore(numberOfNonVegetarian, numberOfUser);

  //------  its an object containing detail of food chart graph
  let foodChartJson = {
    title: "Food Choice",
    data: [
      {
        name: "Veg",
        score: vegScore,
      },
      {
        name: "Egg",
        score: eggScore,
      },
      {
        name: "Non-Veg",
        score: nonVegScore,
      },
    ],
    xtitle: "Food Choices",
    ytitle: "Users",
    ymax: 100,
    ykey: "food",
    xkey: "name",
    prefix: "%",
  };
  //------  its an object containing detail of drink chart graph
  var drinkChartJson = {
    title: "Drink Choice",
    data: [
      {
        name: "Tea",
        score: teaScore,
      },
      {
        name: "Coffee",
        score: coffeeScore,
      },
      {
        name: "Juice",
        score: juiceScore,
      },
      {
        name: "Ice-Tea",
        score: iceTeaScore,
      },
    ],
    xtitle: "Drinks",
    ytitle: "User",
    ymax: 100,
    ykey: "drinks",
    xkey: "name",
    prefix: "%",
  };
  createBarGraph(foodChartJson, "food-chart");
  createBarGraph(drinkChartJson, "drink-chart");
};

//based on the data we have we created the bar
const createBarGraph = (dataJson, elementId) => {
  //chart colors
  let colors = ["one", "two", "three", "four"];

  //constants
  let TROW = "tr",
    TDATA = "td";

  let chart = document.createElement("div");
  //create the chart canvas
  let barchart = document.createElement("table");
  //create the title row
  let titlerow = document.createElement(TROW);
  //create the title data
  let titledata = document.createElement(TDATA);
  //make the colspan to number of records
  titledata.setAttribute("colspan", dataJson.data.length + 1);
  titledata.setAttribute("class", "charttitle");
  titledata.innerText = dataJson.title;
  titlerow.appendChild(titledata);
  barchart.appendChild(titlerow);
  chart.appendChild(barchart);

  //create the bar row
  let barrow = document.createElement(TROW);

  //lets add data to the chart
  for (let i = 0; i < dataJson.data.length; i++) {
    barrow.setAttribute("class", "bars");
    let prefix = dataJson.prefix || "";
    //create the bar data
    let bardata = document.createElement(TDATA);
    let bar = document.createElement("div");
    let barText = document.createElement("span");
    bar.setAttribute("class", colors[i]);
    bar.style.height = dataJson.data[i].score + prefix;
    bardata.innerText = dataJson.data[i].score + prefix;
    barText.innerText = dataJson.data[i].name;
    bardata.appendChild(bar);
    bardata.appendChild(barText);
    barrow.appendChild(bardata);
  }
  barchart.appendChild(barrow);
  chart.appendChild(barchart);
  document.getElementById(`${elementId}`).innerHTML = chart.outerHTML;
};

createPagination();
barGraphDetails();
