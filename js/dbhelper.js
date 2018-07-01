/**
 * Common database helper functions.
 */
class DBHelper {
 // BEGIN IDB
  static openIDB(){
      // import idb from 'idb';
  //  var index=db.transaction('rests').objectStore('rests').index('by-id');
    var dbPromise=idb.open('mws-db',1,function(upgradeDb){
      var store= upgradeDb.createObjectStore('rests',{keyPath:'id'});
      store.createIndex('by-id', 'id');
    });
    return dbPromise;
  }
  static getIDB() {
    var dbPromise=DBHelper.openIDB();
    return dbPromise.then(function(db){
      if(!db)
        return;
      var store = db.transaction('rests').objectStore('rests');
      return store.getAll();
    });
  }

  static insertIDB(restaurants){
        var dbPromise= DBHelper.openIDB();
        dbPromise.then(function(db){
          var tx= db.transaction('rests','readwrite');
          var store = tx.objectStore('rests');
          restaurants.forEach(function(rest){
            store.put(rest);
          });

        });
  }
// END IDB
  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    var rests=[];
var idbRests= DBHelper.getIDB();
idbRests.then(function(restaurants){
  if(restaurants.length){
    console.log(restaurants);
    rests=restaurants;
  return Promise.resolve(restaurants);
  }
  else{
    // begin fetch
    fetch('http://localhost:1337/restaurants').then(function(response) {
      rests=response.json();
    return rests;
  })
  .then(function(myJson) {
    const restaurants =myJson;
  DBHelper.insertIDB(restaurants);
    callback(null, restaurants);
  }).catch(function(error) {
        callback(error, null);
    });
    return rests;
// end fetch
  }

})
.then(function(myJson) {
  const restaurants =myJson;
 // console.log(restaurants);
// DBHelper.insertIDB(restaurants);
  callback(null, restaurants);
}).catch(function(error) {
      callback(error, null);
  });


  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    fetch('http://localhost:1337/restaurants/'+id).then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    const restaurant =myJson;
    if (restaurant) { // Got the restaurant
      callback(null, restaurant);
    } else { // Restaurant does not exist in the database
      callback('Restaurant does not exist', null);
    }
    }).catch(function(error) {
          callback(error, null);
      });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}.jpg`);
  }
  static imageUrlForRestaurant_small(restaurant) {
    return (`/img_200/${restaurant.photograph}.jpg`);
  }
  static imageUrlForRestaurant_medium(restaurant) {
    return (`/img_400/${restaurant.photograph}.jpg`);
  }
  static imageUrlForRestaurant_large(restaurant) {
    return (`/img_800/${restaurant.photograph}.jpg`);
  }
  static imageUrlForRestaurant_mlarge(restaurant) {
    return (`/img_600/${restaurant.photograph}.jpg`);
  }
  static imageAlt(restaurant) {
    return (restaurant.alt);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
