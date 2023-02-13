console.log("Engraver script loaded in");

var types = ["Generations Series","Globetrotter Series","Amsterdam Series","Pendulum Series"];
var productType = undefined;
var engraveData;
var engravingId = 0;
var engravingPrice = "";
var engravingSelected = false;
var engravingPopUpOpen = false;
var engravingDiv = undefined;
var engravingHTML = "";

 $(document).ready(async function(){
    engravingDiv = document.querySelector("div#engraving-app-selector");

    // check if product type is ok
    await getProductType();

    // check if placeholder div is found
    if (engravingDiv && productType){

        // 
        engraveData = await getLabelsFromDb();

        if (engraveData?.idv2?.length > 1){
            engravingId = await getEngravingProductData(engraveData?.idv2);

            if (engravingId > 1){
                
                engravingHTML = `<span>${engraveData?.dropdownHeader}</span>
                <div class="Select Select--primary">
                    <select id="engraver-dropdown">
                        <option value="0" selected="selected">${engraveData?.options.filter(i => i.no)[0].no}</option>
                        <option id="engravingPrice" value="1" data-money-convertible>${engraveData?.options.filter(i => i.yes)[0].yes}</option>       
                    </select>
                    <svg class="Icon Icon--select-arrow" role="presentation" viewBox="0 0 19 12">
                    <polyline fill="none" stroke="currentColor" points="17 2 9.5 10 2 2" fill-rule="evenodd" stroke-width="2" stroke-linecap="square"></polyline>
                    </svg>
                </div>
                
                <div class="mobile-view-wrapper">
                    <div class="pop-up">
                        <div class="pop-up-header">
                            <svg class="close-popup-icon"version="1.1" viewBox="0 0 512 512"xml:space="preserve"><path d="M443.6,387.1L312.4,255.4l131.5-130c5.4-5.4,5.4-14.2,0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4  L256,197.8L124.9,68.3c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4L68,105.9c-5.4,5.4-5.4,14.2,0,19.6l131.5,130L68.4,387.1  c-2.6,2.6-4.1,6.1-4.1,9.8c0,3.7,1.4,7.2,4.1,9.8l37.4,37.6c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1L256,313.1l130.7,131.1  c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1l37.4-37.6c2.6-2.6,4.1-6.1,4.1-9.8C447.7,393.2,446.2,389.7,443.6,387.1z"/></svg>
                            ${engraveData?.popupTitle}
                        </div>
                        <div class="pop-up-body">
                            <p class="pop-up-intro">
                                ${engraveData?.popupText}
                            </p>
                
                            <textarea class="engraver-textarea" maxlength="12" id="inputField"></textarea>
                            <textarea class="engraver-textarea" maxlength="12" id="inputField2"></textarea>
                
                            <div class="watch-back-image" style="background-image: url(${setBackgroundOfEngraverImage(productType)})">
                                <span id="transFormText"></span>
                                <span id="transFormText2"></span>
                            </div>
                
                            <button class="engraveBtn" type="button">
                                <span>${engraveData?.buttonText}</span>
                                <span class="Button__SeparatorDot"></span>
                                <span id="engraving-button-price-span" data-money-convertible="">${engravingPrice}</span>
                            </button>
                        </div>
                    </div>
                </div>`;
    
                engravingDiv.innerHTML = engravingHTML;
                let engravingStylesheet = document.createElement("style");
                engravingStylesheet.innerHTML = engravingCSS;
                engravingDiv.append(engravingStylesheet);
        
                let circleTypeScript = document.createElement("script");
                circleTypeScript.src = "https://engraving-app.web.app/circletype.js";
        
                let letteringJsScript = document.createElement("script");
                letteringJsScript.src = "https://engraving-app.web.app/lettering.js";
                engravingDiv.append(circleTypeScript);
            } 
        } else {
            console.log("failed getting data");
        }
    }

    $("#engraver-dropdown").change( function (event){
        if (event.target.value == 1){
            $(".mobile-view-wrapper").css("display","block");
            engravingPopUpOpen = true;
        } else {
            engravingPopUpOpen = false;
            engravingSelected = false;
            $(".mobile-view-wrapper").css("display","none");
        }
    });

    $(document).click(function(event){
        let target = event.target;
        if (engravingPopUpOpen && !$(target).is('.mobile-view-wrapper') && !$(target).parents().is('.mobile-view-wrapper')
        && !$(target).is('#engraver-dropdown') && !$(target).parents().is('#engraver-dropdown')){
            engravingPopUpOpen = false;
            $("#engraver-dropdown").val(0);
            $(".mobile-view-wrapper").css("display","none");
        }
    });

    $(".close-popup-icon").click(function(e){
        engravingPopUpOpen = false;
        $("#engraver-dropdown").val(0);
        $(".mobile-view-wrapper").css("display","none");
    });

    $(".engraveBtn").click(function(e){
        $("#engraver-dropdown").val(1);
        engravingPopUpOpen = false;
        engravingSelected = true;
        $(".mobile-view-wrapper").css("display","none");
    });
      
    $('#inputField').on('keyup', function() {
        var fieldValue = $("#inputField").val().replace(/[^a-zA-Z0-9. \-]/g, "");
        $("[id=inputField]").val(fieldValue);
        $("#transFormText").html(fieldValue);
        const rip = new CircleType(document.getElementById('transFormText'))
        if ($(document).width() < 371 ){
        rip.radius(150);
        } else {
        rip.radius(200);
        }
    });
  
    $('#inputField2').on('keyup', function() {
        var fieldValue = $("#inputField2").val().replace(/[^a-zA-Z0-9. \-]/g, "");
        $("#inputField2").val(fieldValue);
        $("#transFormText2").html(fieldValue);
        const rip = new CircleType(document.getElementById('transFormText2'))
        if ($(document).width() < 371 ){
        rip.radius(150);
        } else {
        rip.radius(200);
        }
    });

// End of document ready function
 });

async function getLabelsFromDb(){
    let data = await fetch("https://europe-west1-fromanteel-nightdive.cloudfunctions.net/getInfo?collection=bowgaRlUpEU23EWtVDoo");
    
    if (data){
        const jsonData = await data.json();    
        return jsonData.data;
    }

    return null;
}

//  Switch background of the to-be-engraved watch back div.
function setBackgroundOfEngraverImage(type){
    switch(type){
        case types[0]:
            return "https://firebasestorage.googleapis.com/v0/b/fromanteel-nightdive.appspot.com/o/Engraver_Images%2Fgenerations-back.png?alt=media&token=3cb31962-c93c-41f2-8531-5f7addeb9bb0";
        case types[1]:
            return "https://firebasestorage.googleapis.com/v0/b/fromanteel-nightdive.appspot.com/o/Engraver_Images%2Fglobetrotter-back.png?alt=media&token=4ea03d9f-498b-4899-9514-d97732bbd578";
        case types[2]:
            return "https://firebasestorage.googleapis.com/v0/b/fromanteel-nightdive.appspot.com/o/Engraver_Images%2Famsterdam-back.png?alt=media&token=0e4c3436-a876-488a-a62d-605f86bcaa17";
        case types[3]:
            return "https://firebasestorage.googleapis.com/v0/b/fromanteel-nightdive.appspot.com/o/Engraver_Images%2Fpendulum-back.png?alt=media&token=59563972-901e-4b6a-acb1-7ce1e4bebca1";
        default:
            return null;
    }
}

async function getProductType(){
    let urlTemp = "";
    if (window.location.href.includes("?")){
        urlTemp = window.location.href.split("?")[0];
      } else {
        urlTemp = window.location.href;
    }

    const data = await fetch(`${urlTemp}.json`);
    const d = await data.json();
    let inTypes = (types.indexOf(d.product.product_type) > -1);
    if(inTypes) { productType = d.product.product_type}
}

function returnEngravingObjectForCart(){
    let objectToAddToCart = {
        id : engravingId,
        quantity : 1,
        properties : {
            "First line: " : $("#inputField").val(),
            "Second line: " : $("#inputField2").val()
        }
    };

    return objectToAddToCart;
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

async function getEngravingProductData(id){
    const url = "https://fromanteel-watches.myshopify.com/api/2023-01/graphql.json";
    const headers = {
        "Content-Type" : "application/graphql",
        "X-Shopify-Storefront-Access-Token" : "a9ca468fb8388fae2ab62c3208dbf5db"
    };

    let query = `{
        product (id: "${id}"){
          id,
          variants(first: 1){
            edges {
              node {
                id,
                price {
                    amount
                },
                image {
                  src
                }
              }
            }
          }
        }
      }`;

    const data = await fetch(url, {
        method: "POST", 
        headers: headers,
        body: query
    });

    const jsonData = await data.json();
    engravingPrice = `€${jsonData.data.product.variants.edges[0].node.price.amount.slice(0,-2)}`;
    // $("#engravingPrice").text(`€${jsonData.data.product.variants.edges[0].node.price.amount.slice(0,-2)}`);
    let varId = jsonData.data.product.variants.edges[0].node.id.toString().split("gid://shopify/ProductVariant/")[1];
    return varId;
}

var engravingCSS = `
#engraving-app-selector {
    margin-bottom: 9px;
}

.mobile-view-wrapper {
    font-family: "Avenir Next",sans-serif;
    width: 370px;
    height: 540px;
    background: white;
    box-shadow: 0 2px 5px 0 rgb(0 0 0 / 26%);
    z-index: 10;
    position: absolute;
    right: 410px;
    bottom: 25px;
    display: none;
    bottom: 0;
    top: 0;

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

.engraver-textarea {
    width: 100%;
    resize: none;
    height: 45px;
    margin-top: 25px;
    padding: 0;
    border: 1px solid #cfcfcf;
    font-size: 14px;
    font-family: "Avenir Next", sans-serif;
}

.engraver-textarea:focus-visible {
    outline: 0;
}

.watch-back-image {
    width: 100%;
    height: 145px;
    border: 1px solid #cfcfcf;
    margin-top: 25px;
    position: relative;
    background-size: contain;
}

.engraveBtn {
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
}

.engraveBtn:hover {
    cursor: pointer;
    background-color: white;
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

#transFormText {
    color: grey;
    position: absolute;
    top: 30px;
    left: 77px;
    font-size: 7pt;
    transform: rotate(330deg);
    font-family: "Avenir";
  }
  
  #transFormText2 {
    color: grey;
    font-family: "Avenir";
    position: absolute;
    top: 28px;
    right: 85px;
    font-size: 7pt;
    transform: rotate(29deg);
  }

@media only screen and (max-width: 1008px) {
    .close-popup-icon {
        display: block;
    }

    .mobile-view-wrapper {
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
`;