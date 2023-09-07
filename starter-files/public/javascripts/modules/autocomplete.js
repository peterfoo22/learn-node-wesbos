const autocomplete =(input, )=>{
  if(!input) return; // skip this function from running if there is not input
  const dropdown = new google.maps.places.Autocomplete(input);

  dropdown.addListener('place_changed', ()=>{
    const place = dropdown.getPlace();
    latinput.value = place.geometry.location.lat();
    lnginput.value = place.geomtry.location.lng();

    input.on('keydown', (e)=>{
      if(e.keyCode === 13) e.preventDefault();
    })
  })

}

export default autocomplete;