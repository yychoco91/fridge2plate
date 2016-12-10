$(document).ready(function () {
    recipe_info_from_jsonphp_file();
    // getRecipe();
    getIngredients();
    buttonsPushedToMainDisplay();
    titleImgToModal();
});
/**
 * Global Variables
 */
var updatedIngredientsArray;
var newIngredients;
var ingredientsID = [];
/**
 * getIngredientsAjaxCall - Ajax call, auto complete, auto complete filter
 * @returns - data from get_ingredients.php
 */
var getIngredients = function () {
    $.ajax({

        url: "./db_prototype/get_ingredients.php",
        dataType: "json",
        method: "post",
        success: function (response) {
            console.log("data from get_ingredients.php\n", response);

            // -----------Auto Complete-----------
            updatedIngredientsArray = [];
            newIngredients = (response.data);
            for (var key in newIngredients) {
                if (newIngredients.hasOwnProperty(key)) {
                    updatedIngredientsArray.push(key);
                }
            }
            autoCompleteFilter();
            //-----Input Field Ingredient Invert to ID Numbers-----

            //-----On Go Button-----
            $(".btn.btn-danger").click(function () {
                var ingredientInputSelected = $("#ingredientInput").val();
                var objectData = response.data[ingredientInputSelected];
                ingredientCheck(objectData);
                console.log("Ingredients Added to Fridge From Input", ingredientsID);
                $("#ingredientInput").val("");
            });
            //-----On KeyPress Enter-----
            $('#ingredientInput').bind('keypress', function (enter) {
                if (enter.keyCode == 13) {
                    var ingredientInputSelected = $("#ingredientInput").val();
                    var objectData = response.data[ingredientInputSelected];
                    ingredientCheck(objectData);
                    console.log("Ingredients Added to Fridge From Input", ingredientsID);
                    $("#ingredientInput").val("");
                }

            });
        }
    })
};
/**
 * getRecipe - Ajax call, dom creation when called
 * @returns - recipes from get_recipes.php
 */
var getRecipe = function () {
    $.ajax({

        url: "./db_prototype/get_recipes.php",
        dataType: "json",
        method: "post",
        data: {
            ingredients: ingredientsID
        },
        success: function (response) {
            getBackItems();   /*put function here so that it is called after ajax call for getRecipe is completed*/
            console.log("data from get_recipes.php\n", response);
            clear();
            var authorName;
            var recipeName;
            var imgSrc;
            var url;

            var ingName;
            var amount;
            var amountType;
            var designatedIngredients;

            for (var i = 0; i < response.data.length; i++) {

                authorName = response.data[i].author;
                recipeName = response.data[i].name;
                imgSrc = response.data[i].img;
                url = response.data[i].url;

                var theDiv = $("<div>", {
                    class: "col-md-3 col-sm-6 col-xs-12"
                });
                var outterDiv = $("<div>", {
                    class: "card"
                });
                var img = $("<img>", {
                    src: imgSrc,
                    class: "showImage img-responsive cover",
                    width: "100%",
                    height: "286px",
                    'data-toggle': "modal",
                    'data-target': "#myModal"
                });
                var innerDiv = $("<div>", {
                    class: "card-block",
                    height: "100px"         //set the height of card-block cards in following rows will line up correctly
                });
                var h3 = $("<h3>", {
                    class: "card-title",
                    text: recipeName
                });
                var recipeUrl = $("<p>", {
                    html: '<a href="' + url + '">' + url + '</a>'
                });

                var ingDiv = $('<div>', {
                    class: 'ingDiv',
                    style: 'height: 0; overflow: hidden'
                });

                $("#stuff").append(theDiv);
                theDiv.append(outterDiv);
                outterDiv.append(img, innerDiv);
                innerDiv.append(h3);

                for (var j = 0; j < response.data[i].ingredient.length; j++) {

                    ingName = response.data[i].ingredient[j].name;
                    amount = response.data[i].ingredient[j].amount;
                    amountType = response.data[i].ingredient[j].amountType;
                    designatedIngredients = Math.round(amount) + " " + amountType + " " + ingName;

                    var p = $("<p>", {
                        class: "card-text",
                        html: '<li>' + designatedIngredients
                    });
                    ingDiv.append(p)
                }
                innerDiv.append(ingDiv.append(recipeUrl));
            }
        },
        error: function () {
            console.log("BROKEN")
        }
    });
};
/**
 * clear - clears row of recipes
 */
var clear = function () {
    $("#stuff").empty()
};
/**
 * buttonsPushedToMainDisplay - Buttons On NAV to Main Display
 */
var buttonsPushedToMainDisplay = function () {
    $(".btn.btn-info.topIng").click(function () {
        var val = $(this).attr("value");
        var txt = $(this).text();
        txtArr.push(txt);
        ingredientsID.push(val);
        console.log("Ingredients Added to Fridge", ingredientsID);
        newButtonCreation();
        getRecipe();
    });
};
/**
 * getValue - Pushes Buttons to Container Using the "GO" Button
 */
var txtArr = [];
var getValue = function () {
    $('#ingredientInput').each(function () {
        var theValue = $(this).val();
        txtArr.push(theValue);
        newButtonCreation()
    });
};
/**
 * removeIng - Removes Buttons off the Main Display and ingredientsID Array
 */
var removeIng = function () {
    var text = $(this).text();
    text = text.substring(0, text.length - 2);

    var indexS = txtArr.indexOf(text);
    txtArr.splice(indexS, 1);
    ingredientsID.splice(indexS, 1);

    $(this).closest("button").remove();
    console.log("Current Items in Fridge", ingredientsID);
    getRecipe();

};
var addClickHandlerToRemovableIngredient = function (element) {
    element.on('click', removeIng);
};
//-----Creates Button-----
var newButtonCreation = function () {
    var fridgeButton = $("<button>", {
        text: txtArr[txtArr.length - 1] + " x",
        class: "btn btn-info addedIng fridgeButton"
    });
    addClickHandlerToRemovableIngredient(fridgeButton);
    $(".container-fluid .fridge").append(fridgeButton)
};
/**
 * ingredientCheck - CHECK IF ELEMENT IN INPUT FIELD MATCHES WITH ingredientID ARRAY
 */
var ingredientCheck = function (ingredient) {
    if (ingredient === undefined) {
        noExist();
    }
    else {
        ingredientsID.push(ingredient);
        getValue();
        getRecipe();
    }
};
/**
 * noExist - Dynamically Displays a Modal Telling user Their Ingredient Has No Existence
 */
var noExist = function () {

    var modal = $("<div>", {
        class: "modal fade",
        id: "noIng",
        role: "dialog"
    });
    var modalDialog = $("<div>", {
        class: "modal-dialog"
    });
    var modalContent = $("<div>", {
        class: "modal-content"
    });
    var modalHeader = $("<div>", {
        class: "modal-header"
    });
    var buttonH = $("<button>", {
        class: "close",
        'data-dismiss': "modal",
        html: "&times"
    });
    var h3 = $("<h3>", {
        class: "modal-title",
        html: "Ingredient Not Found"
    });
    var modalBody = $("<div>", {
        class: "modal-body"
    });
    var p = $("<p>", {
        html: "Your nonsense does not exist you moron"
    });
    var modalFooter = $("<div>", {
        class: "modal-footer"
    });
    var buttonF = $("<button>", {
        class: "btn btn-default",
        'data-dismiss': "modal",
        html: "Close"
    });

    $("body").append(modal);

    modal.append(modalDialog);
    modalDialog.append(modalContent);
    modalContent.append(modalHeader, modalBody, modalFooter);

    modalHeader.append(buttonH, h3);
    modalBody.append(p);
    modalFooter.append(buttonF);
    $('#noIng').modal('toggle');
};
/**
 * autoCompleteFilter - Filter For Auto Complete
 */
var autoCompleteFilter = function () {
    $("#ingredientInput").autocomplete({
        source: updatedIngredientsArray
    });

    // Overrides the default autocomplete filter function to search only from the beginning of the string
    $.ui.autocomplete.filter = function (array, term) {
        var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(term), "i");
        return $.grep(array, function (value) {
            return matcher.test(value.label || value.value || value);
        });
    };
};
/**
 * titleImgToModal - Title and Image Inside Modal
 */
var titleImgToModal = function () {
    $('#stuff').on('click', 'img', function () {
        var image = $(this).attr('src');
        var recipeTitle = $(this).parent().find(".card-title").text();

        $("#myModal .showImage").attr("src", image);
        $('#myModal .ingContainer').html($(this).next().find('.ingDiv').html());
        $("#myModal .modal-header").html("<h3>" + recipeTitle + "</h3>");
    });
};
/**
 * toggleNav - Pushes Nav Bar to the Side
 */
$(function () {
    // Toggle Nav on Click
    $('.toggle-nav').click(function () {
        // Calling a function in case you want to expand upon this.
        toggleNav();
    });
});
function toggleNav() {
    if ($('#site-wrapper').hasClass('show-nav')) {
        // Do things on Nav Close
        $('#site-wrapper').removeClass('show-nav');
    } else {
        // Do things on Nav Open
        $('#site-wrapper').addClass('show-nav');
    }
}

// ==================DUMMY DATA===============================
// ====================ajax call to json.php====================
var recipe_info_from_jsonphp_file = function () {
    $.ajax({
        url: "./db_prototype/testjson.php",
        dataType: "json",
        method: "post",
        success: function (response) {
            console.log("data from json.php\n", response);
            var authorName;
            var url;
            for (var i = 0; i < response.recipeData.length; i++) {
                var imgSrc = response.recipeData[i].img;
                // console.log(imgSrc);
                var recipeName = response.recipeData[i].name;
                authorName = response.recipeData[i].author;
                url = response.recipeData[i].url;
                var theDiv = $("<div>", {
                    class: "col-md-3 col-sm-6 col-xs-12"
                });
                var outterDiv = $("<div>", {
                    class: "card"
                });
                var img = $("<img>", {
                    src: imgSrc,
                    class: " thumbnail showImage img-responsive cover",
                    width: "100%",
                    height: "286px",
                    'data-toggle': "modal",
                    'data-target': "#myModal"
                });
                var innerDiv = $("<div>", {
                    class: "card-block",
                    height: "100px"         //set the height of card-block so cards in following rows will line up correctly
                });
                var h4 = $("<h4>", {
                    class: "card-title",
                    text: recipeName
                });
                var recipeUrl = $("<p>", {
                    html: '<a href="' + url + '">' + url + '</a>'
                });
                var ingDiv = $('<div>', {
                    class: 'ingDiv',
                    style: 'height: 0; overflow: hidden'
                });
                $("#stuff").append(theDiv);
                theDiv.append(outterDiv);
                outterDiv.append(img, innerDiv);
                innerDiv.append(h4);
                var ingName;
                var amount;
                var amountType;
                var designatedIngredients;
                for (var j = 0; j < response.recipeData[i].ingredients.length; j++) {
                    ingName = response.recipeData[i].ingredients[j].name;
                    amount = response.recipeData[i].ingredients[j].amount;
                    amountType = response.recipeData[i].ingredients[j].amountType;
                    designatedIngredients = Math.round(amount) + " " + amountType + " " + ingName;
                    var p = $("<p>", {
                        class: "card-text",
                        html: '<li>' + designatedIngredients
                    });
                    ingDiv.append(p)
                }
                innerDiv.append(ingDiv.append(recipeUrl));
            }
        }
    })
};


function getBackItems(){
    console.log("jjj")
    if(ingredientsID.length === 0){
        clear()
        recipe_info_from_jsonphp_file();
        console.log("jjj2")
    }
}

var loadStart = function() {
    console.log("loadStart");
    $("#loading").show();
    // $body.show("loading");
};
var loadStop = function() {
    console.log("loadStop");
    $("#loading").hide();
    // $body.hide("loading");
};


