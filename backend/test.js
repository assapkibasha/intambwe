function duplicateCount(text){
  if(!text?.trim() ) return 0
const arrText = text?.toLowerCase()?.split('');
  
  let counter = 0;
  
  arrText.forEach((arr,idx)=>{
    
    if(arr == arrText[idx+1] && counter <2 ){
      counter++
    }
    

  })
  
  
  return counter





  //...
}
console.log(duplicateCount('indivisibility'));
