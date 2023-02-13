console.log("Strap-picker script loaded in");


var strapId = 0;
var strapSelected = false;
var strapPopUpOpen = false;
var displayedPrice = 0;
var selectedStrap = undefined;
var strap_Data;
var strapPickerDiv;

const config = { attributes: true, subtree: true};

const callback = function(mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for(const mutation of mutationsList) {
        if (mutation.attributeName === 'class') {
            if (displayedPrice !== $(".uk-active p").attr("data-price")){
                $("#strappicker-button-price-span").text("€" + $(".uk-active p").attr("data-price"));
                displayedPrice = $(".uk-active p").attr("data-price");
            }
        } 
    }
};

var observer = null;

 $(document).ready(async function(){
    strapPickerDiv = document.querySelector("div#strap-app-selector");
    const headEl = document.querySelector("head");

    if (strapPickerDiv){

        const storageData = await getDataFromStorage();

        if (storageData){
            let strapPickerStylesheet = document.createElement("style");
            strapPickerStylesheet.innerHTML = strapPickerCSS;
    
            let uikitCSS = document.createElement("link");
            uikitCSS.rel = "stylesheet";
            uikitCSS.href = "https://cdn.jsdelivr.net/npm/uikit@3.7.0/dist/css/uikit.min.css";
    
            let uikit1 = document.createElement("script");
            uikit1.src = "https://cdn.jsdelivr.net/npm/uikit@3.7.0/dist/js/uikit.min.js";
    
            let uikit2 = document.createElement("script");
            uikit2.src = "https://cdn.jsdelivr.net/npm/uikit@3.7.0/dist/js/uikit-icons.min.js";
    
            strapPickerDiv.append(strapPickerStylesheet);
            headEl.append(uikitCSS);
            headEl.append(uikit1);
            headEl.append(uikit2);

            getProductData(storageData);
        }
    }

    $("#strap-picker-dropdown").change( function (event){
        if (event.target.value == 1){
            const targetNode = $(".uk-slideshow-items")[0];
            observer = new MutationObserver(callback);
            observer.observe(targetNode, config);

            $(".mobile-view-wrapper-strap").css("display","block");
            getProductData();
            strapPopUpOpen = true;
        } else {
            strapPopUpOpen = false;
            strapSelected = false;
            $(".mobile-view-wrapper-strap").css("display","none");
        }
    });

    $(document).click(function(event){
        let target = event.target;
        if (strapPopUpOpen && !$(target).is('.mobile-view-wrapper-strap') && !$(target).parents().is('.mobile-view-wrapper-strap')
        && !$(target).is('#strap-picker-dropdown') && !$(target).parents().is('#strap-picker-dropdown')){
            strapPopUpOpen = false;
            $("#strap-picker-dropdown").val(0);
            $(".mobile-view-wrapper-strap").css("display","none");
            observer.disconnect();
        }
    });

    $(".close-popup-icon").click(function(e){
        strapPopUpOpen = false;
        $("#strap-picker-dropdown").val(0);
        $(".mobile-view-wrapper-strap").css("display","none");
        observer.disconnect();
    });

    $(".strapBtn").click(function(e){
        strapPopUpOpen = false;
        strapSelected = true;
        strapId = $(".uk-active p")[0].id;
        $(".mobile-view-wrapper-strap").css("display","none");
    });

// End of document ready function
 });

async function performAPICall(objectsForAPIcall){
    const response = await fetch("/cart/add.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            items: objectsForAPIcall
        })
      });

      const data = await response.json();
}

async function getProductData(db_data){
    strapPickerDiv.innerHTML = getSelectBoxForPage(
        db_data.dropdownHeader, 
        db_data.options.filter(e => e.yes)[0]?.yes,
        db_data.options.filter(e => e.no)[0]?.no);

    addModalToPage(db_data);

    let tempIds = db_data.ids;

    const url = "https://fromanteel-watches.myshopify.com/api/2023-01/graphql.json";
    const headers = {
        "Content-Type" : "application/graphql",
        "X-Shopify-Storefront-Access-Token" : "a9ca468fb8388fae2ab62c3208dbf5db"
    };

    let query = ` {
        nodes(ids: ${JSON.stringify(tempIds)}) {
        ... on Product {
            id
            title,
            variants(first: 1){
            edges {
                node {
                    id,
                    title,
                    price {
                        amount
                    }
                }
            }
            }
            images(first: 1){
            edges {
                node {
                url
                }
            }
            }
        }
        }
    }`;

        await fetch(url, {
            method: "POST", 
            headers: headers,
            body: query
        })
        .then(async (res) => {
        let data = await res.json();

        if (data){
            getListItemsHTML(data.data.nodes);
        }

        displayedPrice = data.data.nodes[0].variants.edges[0].node.price.amount.slice(0,-2);
        $("#strappicker-button-price-span").text("€" +  data.data.nodes[0].variants.edges[0].node.price.amount.slice(0,-2));
        }).catch(error => console.error(error));
}

async function getDataFromStorage(){
  let url = "https://europe-west1-fromanteel-nightdive.cloudfunctions.net/getInfo?collection=hsFwgmywbqcBw6QgjLGI";

  let res = await fetch(url); 
  let jsonData = await res.json();

  if (jsonData?.data && jsonData?.data?.ids?.length >= 1){
    return jsonData.data;
  } else {return null};
}

function getListItemsHTML(productList){
    let listItems = [];
    let navItems = [];
    let pos = 0;
      for (let x of productList){
        listItems.push(
            `<li> <img class="carousel-img Image--lazyLoad" src="${x.images.edges[0].node.url}"/>
            <p data-price="${x.variants.edges[0].node.price.amount.slice(0,-2)}" id="${x.variants.edges[0].node.id.split("gid://shopify/ProductVariant/")[1]}" class="carousel-title" uk-slideshow-item="${pos}">${x.variants.edges[0].node.title}</p></li>`
        );
        navItems.push(`<li uk-slideshow-item="${pos}"><a class="uk-nav-link-custom" href="#"></a></li>`);
        pos++;
      }

      $(".uk-slideshow-items").html(listItems);
      $(".uk-dotnav").html(navItems);
}

function returnStrapObjectForApiCall(){
    let objectToAddToCart = {
        id : strapId,
        quantity : 1
    };

    return objectToAddToCart;
}

function getSelectBoxForPage(selectLabel, optionYes, optionNo){
    return `<span>${selectLabel}</span>
    <div class="Select Select--primary">
        <select id="strap-picker-dropdown">
            <option value="0" selected="selected">${optionNo}</option>
            <option value="1" data-money-convertible>${optionYes}</option>       
        </select>
        <svg class="Icon Icon--select-arrow" role="presentation" viewBox="0 0 19 12">
        <polyline fill="none" stroke="currentColor" points="17 2 9.5 10 2 2" fill-rule="evenodd" stroke-width="2" stroke-linecap="square"></polyline>
        </svg>
    </div>`
}

function addModalToPage(data){
 let modalHTML = `    
 <div class="mobile-view-wrapper-strap">
     <div class="pop-up">
         <div class="pop-up-header">
             <svg class="close-popup-icon"version="1.1" viewBox="0 0 512 512"xml:space="preserve"><path d="M443.6,387.1L312.4,255.4l131.5-130c5.4-5.4,5.4-14.2,0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4  L256,197.8L124.9,68.3c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4L68,105.9c-5.4,5.4-5.4,14.2,0,19.6l131.5,130L68.4,387.1  c-2.6,2.6-4.1,6.1-4.1,9.8c0,3.7,1.4,7.2,4.1,9.8l37.4,37.6c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1L256,313.1l130.7,131.1  c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1l37.4-37.6c2.6-2.6,4.1-6.1,4.1-9.8C447.7,393.2,446.2,389.7,443.6,387.1z"/></svg>
             ${data?.popupTitle}
         </div>
         <div class="pop-up-body">
             <p class="pop-up-intro">${data?.popupText}</p>
 
             <div class="image-holder">
                 <img class="intro-img" src="https://firebasestorage.googleapis.com/v0/b/fromanteel-nightdive.appspot.com/o/strap-picker-image.png?alt=media&token=684e8e7f-3298-4ef5-acd3-0ca18a07dde5"/>
             </div>
 
             <div class="uk-position-relative uk-visible-toggle uk-light slideshow" tabindex="-1" uk-slideshow>
                 <ul class="uk-slideshow-items"></ul>
     
                 <a class="uk-position-center-left uk-position-small" href="#" uk-slidenav-previous uk-slideshow-item="previous"></a>
                 <a class="uk-position-center-right uk-position-small" href="#" uk-slidenav-next uk-slideshow-item="next"></a>
     
               <div class="uk-position-bottom-center uk-position-small">
                 <ul class="uk-dotnav"></ul>              
               </div>
             </div>
 
             <button class="strapBtn" type="button">
                 <span> ${data?.buttonText} </span>
                 <span class="Button__SeparatorDot"></span>
                 <span id="strappicker-button-price-span" data-money-convertible="">Loading...</span>
             </button>
         </div>
     </div>
 </div>`;

 $('body').prepend(modalHTML);
}

var strapPickerCSS = `

img:not([src]) {
  min-width: 1px;
  visibility: initial !important;
}

#strap-app-selector {
  margin-bottom: 9px;
}

.uk-dotnav>*>* {
  height: 6px !important;
  width: 6px !important;
}

.uk-icon:not(.uk-preserve) [stroke*='#']:not(.uk-preserve) {
color: black;
stroke-width: 4px !important;
}

.uk-position-bottom-center {
  bottom: -30px !important;
}

.uk-light .uk-dotnav>.uk-active>*, .uk-section-primary:not(.uk-preserve-color) .uk-dotnav>.uk-active>*, .uk-section-secondary:not(.uk-preserve-color) .uk-dotnav>.uk-active>*, .uk-tile-primary:not(.uk-preserve-color) .uk-dotnav>.uk-active>*, .uk-tile-secondary:not(.uk-preserve-color) .uk-dotnav>.uk-active>*, .uk-card-primary.uk-card-body .uk-dotnav>.uk-active>*, .uk-card-primary>:not([class*='uk-card-media']) .uk-dotnav>.uk-active>*, .uk-card-secondary.uk-card-body .uk-dotnav>.uk-active>*, .uk-card-secondary>:not([class*='uk-card-media']) .uk-dotnav>.uk-active>*, .uk-overlay-primary .uk-dotnav>.uk-active>*, .tm-navbar-container:not(.uk-navbar-transparent) .uk-dotnav>.uk-active>* {
  margin-top: -1px;
  width: 10px !important;
  height: 10px !important;
}

.uk-slideshow {
  height: 215px !important;
}

.uk-slideshow-items {
    height: 215px !important;
    margin-top: 15px !important;
}

.image-holder {
  height: 113px;
  border: 2px solid #80808040;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.intro-img {
  height: 135px;
  margin-top: 10px;
}

.carousel-img {
  display: block;
  object-fit: contain;
  width: 100%;
  height: 180px;
  margin: auto;
}

.carousel-title {
  color: black;
  font-weight: 700;
  position: absolute;
  bottom: 4px;
  width: 100%;
  font-size: 14px;
  font-family: "Avenir Next",sans-serif;
  text-align: center;
  text-transform: capitalize;
}

.uk-nav-link-custom {
    border-color: black !important;
    background-color: black !important;
}

.uk-position-bottom-center {
  bottom: -48px;
}

.mobile-view-wrapper-strap {
  font-family: "Avenir Next",sans-serif;
  width: 370px;
  height: 600px;
  background: white;
  box-shadow: 0 2px 5px 0 rgb(0 0 0 / 26%);
  z-index: 10;
  position: absolute;
  right: 410px;
  bottom: 0;
  top: 0;
  display: none;

  /* temporary */
  margin: 30px;
}

.pop-up {
  max-width: 370px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.pop-up-header {
  font-family: "Avenir Next",sans-serif;
  text-align: center;
  text-transform: uppercase;
  max-height: 45px;
  letter-spacing: 0.2em;
  font-size: 15px;
  font-weight: 700;
  padding: 15px 20px 13px;
  border-bottom: 1px solid rgba(207,207,207,0.4);
  position: relative;
}

.pop-up-body {
  padding: 0px 25px 25px 25px;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

.pop-up-intro {
  padding-top: 11px;
  text-align: center;
  font-size: 14px;
  margin: 0;
  line-height: 15px;
}

.strapBtn {
  background-color: black;
  width: 100%;
  height: 45px;
  color: white;
  margin-top: 42px;
  font-size: 12px;
  text-align: center;
  letter-spacing: 0.2em;
  font-family: "Avenir Next",sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  border: 1px solid black;
}

.strapBtn:hover {
  cursor: pointer;
  background-color: #ffffff;
  color: black;
}

.close-popup-icon {
  position: absolute;
  left: 15px;
  top: 16px;
  height: 15px;
  width: 15px;
  display: none;
}

.close-popup-icon:hover {
  cursor: pointer;
}

@media only screen and (max-width: 1008px) {
  .close-popup-icon {
      display: block;
  }

  .mobile-view-wrapper-strap {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      margin: 0;
      top: auto;
      width: 100%;
  }

  .pop-up {
      margin-inline: auto;
  }
}

html {
  margin: 0;
}
}`;