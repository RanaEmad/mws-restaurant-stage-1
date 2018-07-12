let restaurant;
let map;

function register_sw(){
  //register service worker
if(!navigator.serviceWorker)
	return;
navigator.serviceWorker.register('/sw.js').then(function(reg) {
	 console.log("Registered!");
  }).catch(function(){
	  console.log("Registration Failed!");
  });
}
register_sw();

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
			check_fav();
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  // begin picutre
  // <picture>
  //   <source media="(min-width: 750px)" srcset="images/still_life-1600_large_2x.jpg 2x" type="image/jpeg" >
  //     <source media="(min-width: 750px)" srcset="images/still_life-1600_large_2x.jpg 2x" type="image/jpeg" >
  //     <img src="images/still_life-1600_large_2x.jpg" alt="Still Life">
  // </picture>
  const pic= document.getElementById('restaurant-img');

  const source1= document.createElement("source");
  source1.media="(min-width: 1180px)";
  source1.srcset=DBHelper.imageUrlForRestaurant_mlarge(restaurant);
  source1.className='restaurant-img';
  pic.append(source1);

  const source2= document.createElement("source");
  source2.media="(max-width: 1180px)";
  source2.srcset=DBHelper.imageUrlForRestaurant_large(restaurant);
  pic.append(source2);


  // end picture
// const image = document.getElementById('restaurant-img');
  const image = document.createElement("img");
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant_large(restaurant);
  image.alt= DBHelper.imageAlt(restaurant);
  pic.append(image);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

function openIDB(){
    // import idb from 'idb';
//  var index=db.transaction('rests').objectStore('rests').index('by-id');
  var dbPromise=idb.open('mws-db',1,function(upgradeDb){
    var store= upgradeDb.createObjectStore('reviews',{keyPath:'id'});
    store.createIndex('by-id', 'id');
  });
  return dbPromise;
}
 function getIDBReviews() {
    var dbPromise=openIDB();
    return dbPromise.then(function(db){
      if(!db)
        return;
      var store = db.transaction('reviews').objectStore('reviews');
      var reviews =store.getAll();
      return reviews;
    });
  }

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
	//fetch Reviews
let revs=fetch("http://localhost:1337/reviews/?restaurant_id="+self.restaurant.id).then(function(response){
	let rev= response.json();
	return rev;
}).then(function(response){

	 reviews=response;
	const container = document.getElementById('reviews-container');
	const title = document.createElement('h3');
	title.innerHTML = 'Reviews';
	container.appendChild(title);

	if (!reviews) {
		const noReviews = document.createElement('p');
		noReviews.innerHTML = 'No reviews yet!';
		container.appendChild(noReviews);
		return;
	}
	const ul = document.getElementById('reviews-list');
	reviews.forEach(review => {
		ul.appendChild(createReviewHTML(review));
	});
	container.appendChild(ul);


});
//get idb reviews
reviews=getIDBReviews();
reviews.then(function(response){
	reviews=response;
 const container = document.getElementById('reviews-container');
 const title = document.createElement('h3');
 title.innerHTML = 'Reviews';
 container.appendChild(title);

 if (!reviews) {
	 const noReviews = document.createElement('p');
	 noReviews.innerHTML = 'No reviews yet!';
	 container.appendChild(noReviews);
	 return;
 }
 const ul = document.getElementById('reviews-list');
 reviews.forEach(review => {
	 ul.appendChild(createReviewHTML(review));
 });
 container.appendChild(ul);
});



}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  // const date = document.createElement('p');
  // date.innerHTML = review.createdAt;
  // li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

//add to Favorites
var favorite=document.getElementById("favorite");
favorite.addEventListener('click',function(){
	var id=self.restaurant.id;
	if(self.restaurant.is_favorite=="true"){
		fetch("http://localhost:1337/restaurants/"+id+"/?is_favorite=false",{"method":"PUT"})
		.then(function(response){
			favorite.innerHTML="Favorite Restaurant";
			self.restaurant.is_favorite="false";
		});

	}
	else{
		fetch("http://localhost:1337/restaurants/"+id+"/?is_favorite=true",{"method":"PUT"})
		.then(function(response){
			favorite.innerHTML="Unfavorite Restaurant";
			self.restaurant.is_favorite="true";
		});
	}

});
function check_fav(){
	if(self.restaurant.is_favorite=="true"){
		document.getElementById("favorite").innerHTML="Unfavorite Restaurant";
	}
}
