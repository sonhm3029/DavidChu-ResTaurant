$(function () { // Same as document.addEventListener("DOMContentLoaded"...

    // Same as document.querySelector("#navbarToggle").addEventListener("blur",...
    $("#navbarToggle").blur(function (event) {
      var screenWidth = window.innerWidth;
      if (screenWidth < 768) {
        $("#collapsable-nav").collapse('hide');
      }
    });
  
    // In Firefox and Safari, the click event doesn't retain the focus
    // on the clicked button. Therefore, the blur event will not fire on
    // user clicking somewhere else in the page and the blur event handler
    // which is set up above will not be called.
    // Refer to issue #28 in the repo.
    // Solution: force focus on the element that the click event fired on
    $("#navbarToggle").click(function (event) {
      $(event.target).focus();
    });
  });
  
  (function (global) {
  
  var dc = {};
  // URL for the homrpage and menu catgories
  var homeHtml = "snippets/home-snippet.html";
  var allCategoriesUrl = "data/categories.json";
  var allCategoriesUrl = "https://davids-restaurant.herokuapp.com/categories.json";
  var categoriesTitleHtml = "snippets/categories-title-snippet.html";
  var categoryHtml = "snippets/category-snippet.html";
  //URL for menu items
  var menuItemsURL = "data/menu_items_";
  var menuItemsTitleHtml = "snippets/menu-items-title-snippet.html";
  var menuItemsHtml = "snippets/menu-items-snippet.html";
  
  // Convenience function for inserting innerHTML for 'select'
  var insertHtml = function (selector, html) {
    var targetElem = document.querySelector(selector);
    targetElem.innerHTML = html;
  };

  // Function to insert property name into {{xxxx}}
  function insertProperty(string, propName, propValue) {
    // string is all html prop in html page convert into string
    // and then replace propName with propValue
    var propToReplace = "{{"+ propName + "}}";
    string = string.replace( new RegExp(propToReplace, "g"), propValue );
    return string;
  }

  function insertPrice(html, pricePropName, priceValue ) {
    // If not specified, replace with empty string
    if(! priceValue){
      return insertProperty(html, pricePropName, "");
    }
    priceValue = "$" + priceValue.toFixed(2);
    html = 
    insertProperty(html,
                  pricePropName,
                  priceValue);
    return html;
  }


  function insertPortion(html, portionPropName, portionValue) {
    if(!portionValue) {
      return insertProperty(html, portionPropName, "");
    }
    portionValue = '(' + portionValue + ')';
    html =
    insertProperty(html,
                  portionPropName,
                  portionValue);
    return html;
  }
  
  // Show loading icon inside element identified by 'selector'.
  var showLoading = function (selector) {
    var html = "<div class='text-center'>";
    html += "<img src='images/ajax-loader.gif'></div>";
    insertHtml(selector, html);
  };
  
  // On page load (before images or CSS)
  document.addEventListener("DOMContentLoaded", function (event) {
  
  // On first load, show home view
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    homeHtml,
    function (responseText) {
      document.querySelector("#main-content")
        .innerHTML = responseText;
    },
    false);
  });
  
  dc.loadMenuCategories = function (){
    // show loading if page haven't loaded yet
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      allCategoriesUrl,
      buildAndShowCategoriesHTML
    );
    // In send get resquest , we not put in the third parameter
    // so it is undefined and in our function in AJAX, we set it
    // to true by default
    // so after this function, we put a JSON.parse  -> Object into
    // buildANdShowCategoriesHTML which is responseHandler in AJAX
  }

  dc.loadMenuItems = function (catShortName) {
    // show loading if page haven't loaded yet
    // console.log(catShortName);
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      menuItemsURL + catShortName +'.json',
      buildAndShowItemsHTML
    );

  }

  dc.loadSpecialMenuItems = function () {
    // Function show special menu in homepage reffer to SP short name
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      menuItemsURL + "SP.json",
      buildAndShowItemsHTML
    );
  }
  //Remove class 'Active' from home and switch to menu button

  var switchActive = function(idActive) {
    listIdActive = ["#navHomeButton", "#navMenuButton", "#navAboutButton", "#navAdwardButton"];
    idActive = '#' + idActive;
    for (var i =0 ; i<listIdActive.length; i++) {
      //take classname
      var activeClassName = document.querySelector(listIdActive[i]).className;
      // switch to active with current button and unactive to other button
      if(listIdActive[i] == idActive) {
        if(activeClassName.indexOf("avtive") == -1) {
          activeClassName += " active";
          document.querySelector(listIdActive[i]).className = activeClassName;
        }
      }
      else {
        activeClassName = activeClassName.replace( new RegExp("active","g"),"");
        document.querySelector(listIdActive[i]).className = activeClassName;
      }
    }
  }

  var buildAndShowCategoriesHTML = function (categories) {
    //categories is an array of object we take form database .json
    //Step 1: Get title html
    $ajaxUtils.sendGetRequest(categoriesTitleHtml,
      function (categoriesTitleHtml) {
        // Step2: Get Content html
        $ajaxUtils.sendGetRequest(categoryHtml,
          function (categoryHtml) {
            switchActive("navMenuButton");
            var categoriesViewHtml = 
            buildCategoriesViewHtml (categories, categoriesTitleHtml, categoryHtml);
            //Step 3: Build up all content and insert to #main-content
            insertHtml("#main-content", categoriesViewHtml);
            for(var i = 0; i< categories.length; i++) {
              console.log(categories[i].short_name);
            }
          }, false);
      }, false);

  }

  var buildAndShowItemsHTML = function (categoryMenuItems) {
    $ajaxUtils.sendGetRequest(menuItemsTitleHtml,
      function (menuItemsTitleHtml) {
        $ajaxUtils.sendGetRequest(menuItemsHtml,
          function (menuItemsHtml) {
            var menuItemsViewhtml =
            buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtml, menuItemsHtml);
            insertHtml("#main-content", menuItemsViewhtml);
          },false);
      },false);

  }

  function buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml) {
    var finalHtml = categoriesTitleHtml;
    finalHtml += "<section class='row'>";


    //Loop over all categories

    for( var i = 0; i< categories.length; i++) {
      //Insert categories value
      var html = categoryHtml;
      var name = categories[i].name;
      var short_name = categories[i].short_name;
      html = insertProperty(html, "name", name);
      html = insertProperty(html, "short_name", short_name);
      finalHtml += html;

    }
    // finalHtml +="<div style='padding-left:15px; padding-right:15px'><a href='index.html'>Home</a></div>";
    finalHtml += "</section>";
    return finalHtml;
  }

  function buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtml, menuItemsHtml) {
    menuItemsTitleHtml = 
    insertProperty(menuItemsTitleHtml,
                   "name",
                   categoryMenuItems.category.name);
    menuItemsTitleHtml =
    insertProperty(menuItemsTitleHtml,
                    "special_instructions",
                    categoryMenuItems.category.special_instructions);
    var finalHtml = menuItemsTitleHtml;
    finalHtml += "<section class='row'>";

    //loop over all items
    var menuItems = categoryMenuItems.menu_items;
    var catShortName = categoryMenuItems.category.short_name;
    for(var i = 0; i< menuItems.length; i++) {
      var html = menuItemsHtml;
      html =
      insertProperty(html,
                    "name",
                    menuItems[i].name);
      html =
      insertProperty(html,
                    "short_name",
                    menuItems[i].short_name);
      html = 
      insertProperty(html,
                    "catShortName",
                    catShortName);
      html = 
      insertPrice(html,
                  "price_small",
                  menuItems[i].price_small);
     html =
     insertPrice(html,
                 "price_large",
                 menuItems[i].price_large);
     html =
     insertPortion(html,
                  "small_portion_name",
                  menuItems[i].small_portion_name);
     html =
     insertPortion(html,
                  "large_portion_name",
                  menuItems[i].large_portion_name);  

     html = 
     insertProperty(html,
                    "description",
                    menuItems[i].description);
      //Add clearfix after every second menu item
      if( i%2 != 0) {
        html += "<div class='clearfix visible-md-block visible-lg-block'></div>"
      }
      finalHtml += html;                        
    }
    finalHtml += "</section>";
    return finalHtml;
  }

  dc.loadAbout = function (){
    var aboutUrl = "snippets/about-snippet.html";
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      aboutUrl,
      function (responseText) {
        switchActive("navAboutButton");
        document.querySelector("#main-content").innerHTML = responseText;
      }
    ,false);

  }
  dc.loadAdward = function (){
    var adwardUrl = "snippets/adward-snippet.html";
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      adwardUrl,
      function (responseText) {
        switchActive("navAdwardButton");
        document.querySelector("#main-content").innerHTML = responseText;
      }
    ,false);

  }
  
  global.$dc = dc;
  
})(window);
  
