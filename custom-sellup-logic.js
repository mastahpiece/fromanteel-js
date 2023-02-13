
async function customAddToCartLogic(){
    let arrayWithDropdownObjectsToAddtoCart = [];

    if (typeof buckleSelected != "undefined" && typeof buckleSelected != null){
       if (buckleSelected){
          arrayWithDropdownObjectsToAddtoCart.push(returnBuckleObjectForCart());
      } 
    }

    if (typeof engravingSelected != "undefined" && typeof engravingSelected != null){
      if (engravingSelected){
          arrayWithDropdownObjectsToAddtoCart.push(returnEngravingObjectForCart());	
      }
    }

    if (typeof strapSelected != "undefined" && typeof strapSelected != null){
      if (strapSelected){
        arrayWithDropdownObjectsToAddtoCart.push(returnStrapObjectForApiCall());	
      }
    }
    
    if (arrayWithDropdownObjectsToAddtoCart.length > 0){
        await performAPICall(arrayWithDropdownObjectsToAddtoCart);    
    }
}