const axios = require('axios');
import DOMPurify from 'dompurify';

function searchResultsHTML(stores){
  return stores.map(store=>{
    return `<a href="/store/${store.slug}" class='search__result'> 
      <strong>
        ${store.name}
      </strong>
    </a>`
  }).join('');
}


function typeAhead(search){
  if(!search){
    return;
  }

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');

  searchInput.on('input', function(){
    if(!this.value){
      searchResults.style.display = 'none';
      return;
    }

    searchResults.style.display = 'block';
    axios.get(`/api/v1/search?q=${this.value}`)
    .then(res=>{
      console.log(res.data);
      if(res.data.length){
        searchResults.innerHTML = DOMPurify.sanitize(searchResultsHTML(res.data));
        return
      }
      searchResults.innerHTML = DOMPurify.sanitize(`<div class="search__result"> No Results for ${this.value} found!</div>`)
    })
    .catch(err=>{
      console.error(err);
    })

  });

  searchInput.on('keyup',(e)=>{
    if(![38, 40, 13].includes(e.keyCode)){
      return;
    }
    const activeClass = 'search__result--active';
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll(
      '.search__result'
    )
    let next;

    if(e.keyCode === 40 && current){
      next = current.nextElementSibling || items[0]
    }else if (e.keyCode === 40){
      next = items[0];
    }else if(e.keyCode === 38 && current){
      next = current.previousElementSibling || [items.length - 1]
    }else if ( e.keyCode === 38){
      next = items[items.length -1];
    }else if ( e.keyCode === 13 && current.href){
      window.location = current.href;
      return;
    }
    if(current){
      current.classList.remove(activeClass);
    }
    next.classList.add(activeClass);
  })
}

export default typeAhead;