console.log("Buckle-picker script loaded in");

var el = document.getElementById("fold-buckle-app-selector");
var buckleId;
var buckleSelected = false;
var popUpIsOpen = false;
var buckle_price_label = "";

if (el) {
getShopifyProducts().then((data) => {
  if (data){
    var styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);
    el.innerHTML = `
    <span>${data?.dropdownHeader}</span>
      <div class="Select Select--primary pickerdiv">
          <select id="buckle-picker">
              <option value="0" selected="selected">${data?.options.filter(i => i.no)[0].no?.replaceAll("{price}",buckle_price_label)}</option>
              <option id="buckleOk" value="1" data-money-convertible>${data?.options.filter(i => i.yes)[0].yes?.replaceAll("{price}",buckle_price_label)}</option>
              
          </select>
          <svg class="Icon Icon--select-arrow" role="presentation" viewBox="0 0 19 12">
              <polyline fill="none" stroke="currentColor" points="17 2 9.5 10 2 2" fill-rule="evenodd" stroke-width="2" stroke-linecap="square"></polyline>
          </svg>
      </div>
  `;

  let newEl = `
  <div class="buckle__mobileWrapper">
      <header class="popTitle"></header>
      <div class="buckle__popover__content">
        <button type="button" class="buckle__popCloseButton">
          <svg style="height: 15px; width: 15px;" version="1.1" viewBox="0 0 512 512"xml:space="preserve"><path d="M443.6,387.1L312.4,255.4l131.5-130c5.4-5.4,5.4-14.2,0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4  L256,197.8L124.9,68.3c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4L68,105.9c-5.4,5.4-5.4,14.2,0,19.6l131.5,130L68.4,387.1  c-2.6,2.6-4.1,6.1-4.1,9.8c0,3.7,1.4,7.2,4.1,9.8l37.4,37.6c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1L256,313.1l130.7,131.1  c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1l37.4-37.6c2.6-2.6,4.1-6.1,4.1-9.8C447.7,393.2,446.2,389.7,443.6,387.1z"/></svg>
        </button>
          <header class="popTitle"><span id="popMsg" class="popover__message">${data?.popupTitle}</span></header>
          <div class="content">
              <p class="buckle__popover__text">
              ${data?.popupText}
              </p>

              <div class="fold_buckle_div">
                  <img style="max-width: 100%" class="Image--lazyLoad" src="https://firebasestorage.googleapis.com/v0/b/my-masjid-bae25.appspot.com/o/fold_buckle.jpg?alt=media&token=064c4233-d801-4ec4-b9ad-840494211f96"/>
              </div>
              
              <button class="addBuckleButton" type="button"> 
                  <span>${data?.buttonText}</span>
                  <span class="Button__SeparatorDot"></span>
                  <span id="price" data-money-convertible>€${buckle_price_label}</span>
              </button>
          </div>
      </div>
  </div>
  `;

    $('body').prepend(newEl);
  }

$(document).ready(function () {
    $(".buckle__popCloseButton").click(function () {
      $("[id=buckle-picker]").val(0).trigger("buckle1toggle");
      $(".buckle__mobileWrapper").css("display", "none");
    });
  
    $(".addBuckleButton").click(function () {
      buckleSelected = true;
      popUpIsOpen = false;
      $("[id=buckle-picker]").val(1);
      $(".buckle__mobileWrapper").css("display", "none");
    });
  
    /*AddToCartButton label change after adding a buckle*/
    $("#buckle-picker").change(function () {
      var optionId = $("#buckle-picker option:selected")[0].id;
      if (optionId == "buckleOk") {
        buckleSelected = true;
        $(".buckle__mobileWrapper").css("z-index", "10");
        $(".buckle__mobileWrapper").css("display", "block");
        popUpIsOpen = true;
      } else {
        buckleSelected = false;
        $("#buckle-picker").val(0);
      }
    });
  
    $(document).click(function (e) {
      var target = e.target;
      if (
        popUpIsOpen &&
        !$(target).is(".buckle__mobileWrapper") &&
        !$(target).parents().is(".buckle__mobileWrapper") &&
        !$(target).parents().is("div#fold-buckle-app-selector") &&
        !$(target).is("div#fold-buckle-app-selector")
      ) {
        if (buckleSelected) {
          $("#buckle-picker").val(0);
          buckleSelected = false;
          popUpIsOpen = false;
        }

        $(".buckle__mobileWrapper").css("display", "none");
      }
    });
  }); // End of document ready function
});
} else {
  console.error("Element to place fold buckle was not found");
}

function returnBuckleObjectForCart() {
  let objectToAdd = {
    id: buckleId,
    quantity: 1,
  };
  return objectToAdd;
}

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

async function getShopifyProducts() {
  const url =
    "https://europe-west1-fromanteel-nightdive.cloudfunctions.net/getInfo?collection=Wrz5MqzjaGRRLk1Vjb4X";
  try {
    const response = await fetch(url);
    const content = await response.json();

    if (content?.data.idv2?.length > 1){
        try {
            const api_url = "https://fromanteel-watches.myshopify.com/api/2023-01/graphql.json";
            const headers = new Headers({
            "Content-Type": "application/graphql",
            "Accept": "application/json",
            "X-Shopify-Storefront-Access-Token": "a9ca468fb8388fae2ab62c3208dbf5db",
            });

            const response2 = await fetch(api_url, {
              method: "POST",
              headers: headers,
              body: getQuery(content?.data.idv2),
            });
            const data = await response2.json();
		if (data.data.product){
		  const priceLabel = `${data.data.product.variants.edges[0].node.price.amount.slice(0,-2)}`;
      buckle_price_label = priceLabel;
      buckleId = data.data.product.variants.edges[0].node.id.toString()
      .split("gid://shopify/ProductVariant/")[1];
        
		}
          } catch (error) {
            console.error(`error: ${error}`);
          }
    } else {
      return null;
    }

    return content.data;
  } catch (error) {
    console.error(
      "Something went wrong retrieving the buckle id's. Contact the admin when you see this."
    );
  }
}

function getQuery(id) {
  const query = `
        {
            product (id: "${id}"){
               title,
            variants(first: 1){
              edges {
                node {
                  price {
                    amount
                  },
                  id
                }
              }
            },
            images (first: 1){
              edges{
                node {
                  url
                }
              }
            }
          }
        }`;
  return query;
}

var css = `

#fold-buckle-app-selector {
  margin-bottom: 9px;
}

#buckle-picker {
    width: 100%;
}

.pickerdiv {
    width: 100%; 
    position: relative;
}

.buckle__mobileWrapper {
    display: none;
}

.buckle-pickerDiv {
    margin-bottom: 10px;
}

.fold_buckle_div {
    border: 1px solid #cfcfcf;
    margin-top: 25px;
}

.buckle__popover__wrapper {
    position: relative;
    width: 100%;
}

.buckle__popover__text {
    margin-top: 25px;
    text-align: center;
    line-height: 14px;
}

.popover__title {
    line-height: 36px;
    text-decoration: none;
    color: rgb(228, 68, 68);
    text-align: center;
    padding: 15px 0;
}

.content {
    padding: 0px 25px 25px 25px;
}

.popTitle {
  position: relative;
  border-bottom: 1px solid rgba(207,207,207,0.4);
  text-align: center;
  height: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
}

.addBuckleButton {
    background-color: black;
    width: 100%;
    height: 45px;
    color: white;
    margin-top: 25px;
    font-size: 12px;
    text-align: center;
    letter-spacing: 0.2em;
    font-family: "Avenir Next",sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    border: 1px solid black;
    z-index: -3;
}

.addBuckleButton:hover {
  background-color: white;
  color: black;
}

@font-face {
    font-family: 'Avenir';
    src: url({{ 'Avenir-Black.eot' | asset_url }});
    src: url({{ 'Avenir-Black.eot?#iefix' | asset_url }}) format('embedded-opentype'),
         url({{ 'Avenir-Black.woff2' | asset_url }}) format('woff2'),
         url({{ 'Avenir-Black.woff' | asset_url }}) format('woff'),
         url({{ 'Avenir-Black.svg#Avenir-Black' | asset_url }}) format('svg');
    font-weight: 900;
    font-style: normal;
}

.popover__message {
    font-family: "Avenir Next",sans-serif;
    text-align: center;
    letter-spacing: 0.2em;
    font-size: 15px;
    font-weight: 700;
}

.buckle__popCloseButton {
  width: 30px;
  height: 30px;
  position: absolute;
  top: 7px;
  left: 17px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
}

@media (min-width: 371px) and (max-width: 1008px){
    .buckle__mobileWrapper {
        z-index: 10;
        position: fixed;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 520px;
        background-color: white;
    }

    .buckle__popover__content {
        position: absolute;
        display: block;
        opacity: 1;
        width: 370px;
        bottom: 0;
        left: 0;
        right: 0;
        margin-left: auto;
        margin-right: auto;
        background-color: white;
        z-index: 20;
    }

    .buckle__popover__content:before {
        display: none;
        z-index: -1;
        content: "";
        position: fixed;
        width: 100%;
        transition-duration: 0.3s;
        transition-property: transform;
        filter: drop-shadow(2px 0 2px rgba(54,54,54,0.2));
    } 
}

@media (min-width: 1008px){
    .buckle__popCloseButton {
        display: none;
    }

    .buckle__popover__content {
        display: block;
        position: fixed;
        right: 500px;
        top: 160px;
        width: 370px;
        z-index: 20;
        transform: translate(0, -20px);
        background-color: white;
        box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);
    }

    .buckle__popover__content:before {
        position: absolute;
        opacity: 0;
        z-index: -1;
        content: "";
        top: 167px;
        right: -14px;
        border-style: solid;
        border-width: 15px 0 15px 15px;
        border-color: transparent transparent transparent white;
        transition-duration: 0.3s;
        transition-property: transform;
        filter: drop-shadow(2px 0 2px rgba(54,54,54,0.2));
    }

}

@media (max-width: 370px){
  .content {
    padding: 0px 25px 15px 25px;
  }

  .buckle__popover__content {
    position: absolute;
    display: block;
    width: 310px;
    bottom: 0;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    background-color: white;
  }

  .buckle__mobileWrapper {
    z-index: -1;
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 502px;
    background-color: white;
  }

  .buckle__popover__content:before {
    z-index: -1;
    content: "";
    position: fixed;
    width: 100%;
    transition-duration: 0.3s;
    transition-property: transform;
    filter: drop-shadow(2px 0 2px rgba(54,54,54,0.2));
  } 

  .popover__message {
    font-family: "Avenir Next",sans-serif;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-size: 14px;
    font-weight: 700;
  }
}`;

