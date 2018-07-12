let restaurant;

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
      document.getElementById("restaurant_id").value=restaurant.id;
    });
  }
}
fetchRestaurantFromURL();

document.getElementById("submit_review").addEventListener('click', function(event) {
  event.preventDefault();
submit_form();
});
//begin dbhelper
window.addEventListener('load', function() {
  var status = document.getElementById("status");
  var log = document.getElementById("log");

  function updateData(event) {
    var condition = navigator.onLine ? "online" : "offline";
      if(navigator.onLine){
        //get all reviews in IDB
        const reviews=getIDBReviews();

        reviews.then(function(reviews){
          return Promise.resolve(reviews);
        }).then(function(myJson){
          if(myJson.length){

            myJson.forEach(function(rev){

              let rev_data= {
                restaurant_id:rev.restaurant_id,
                name:rev.name,
                rating:rev.rating,
                comments:rev.comments
            }
            //sync database reviews and delete from idb
            console.log("online");
            fetch('http://localhost:1337/reviews',{method:"post",
             body: JSON.stringify(rev_data)
            }).then(function(response){

            }).catch(function(error){
                console.log(error);
            });
            ////////

          });
          //delete record after sync
          var dbPromise=openIDB();
          dbPromise.then(function(db){
            if(!db)
              return;
              var tx= db.transaction('reviews','readwrite');
              var store = tx.objectStore('reviews').clear();
              //alert("Review Submitted Successfully!");
          });
            ///forEach
          }
          //length

            });
            //reviews.then

        }
        //navigator.online

      // else{
      //   console.log("offline");
      // }

  }

  window.addEventListener('online',  updateData);
  window.addEventListener('offline', updateData);
});
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
  function insertIDB(review){
        var dbPromise= openIDB();
        dbPromise.then(function(db){
          var tx= db.transaction('reviews','readwrite');
          var store = tx.objectStore('reviews');
            store.put(review);
            console.log(review);

        });
  }
// end dbhelper

/**
*Submit form
*/
submit_form= (restaurant = self.restaurant)=>{
const form= document.getElementById("add_review_form");
const fd = new FormData(form);
if(navigator.onLine){

  fetch('http://localhost:1337/reviews',{method:"post",
   body: fd
  }).then(function(response){
    alert("Review Submitted Successfully!");
  }).catch(function(error){
      console.log(error);
  });

}
else{
alert("You are currently offline, your review will be submitted when the connection is reestablished");
let review_id=1;
  const reviews=getIDBReviews();

  reviews.then(function(reviews){
    return Promise.resolve(reviews);
  }).then(function(myJson){
    if(myJson.length){
      review_id=myJson[myJson.length-1].id+1;
    }
    const data= {
      id:review_id,
      restaurant_id:document.getElementById("restaurant_id").value,
      name:document.getElementById("name").value,
      rating:document.getElementById("rating").value,
      comments:document.getElementById("comments").value
  }
  insertIDB(data);
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
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}
