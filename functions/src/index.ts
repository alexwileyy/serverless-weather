import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript


export const onWeatherUpdate = functions.firestore.document("weather-data/{location}").onCreate((snap, context) => {
	return new Promise((res, rej) => {
		const newData = snap.data();
		newData.weather = newData.weather.toUpperCase();
		admin.firestore().collection('weather-data').doc(context.params.location).set(newData)
		.then(docRef => {
			console.log('Document updated');
			res();
		})
		.catch(err => {
			console.log('Error updating new document.');
			console.log(err);
			rej();
		})
	})
})


export const addWeatherData = functions.https.onRequest((req, res) => {
	const data = req.body;
	if(data.location && data.temp && data.weather){
		const location = data.location;
		delete data.location;
		admin.firestore().collection('weather-data').doc(location).set(data)
		.then(docRef => {
			res.send('Document created!');
		})
		.catch(error => {
			console.log(error);
			res.status(500).send(error);
		})
	} else{
		res.status(500).send('Invalid params provided to the API.');
	}
})


export const countryWeather = functions.https.onRequest((req, res) => {
	admin.firestore().doc('countries/usa').get()
	.then(countrySnapshot => {
		const cities = countrySnapshot.data().cities;
		const p = [];
		for(const city in cities){
			const cityData = admin.firestore().doc(`weather-data/${cities[city]}`).get()
			p.push(cityData);
		}
		console.log(p);
		return Promise.all(p);
	})
	.then(weather => {
		const results = [];
		weather.forEach(cityWeather => {
			const data = cityWeather.data();
			results.push(data);
		})
		res.send(results);
	})
	.catch(error => {
		console.log(error);
		res.status(500).send(error);
	})
})


//Get boston weather
export const getWeather = functions.https.onRequest((request, response) => {
	admin.firestore().doc('weather-data/boston').get()
	.then(resData => {
		const data = resData.data();
		response.send(data);
	})
	.catch(error => {
		response.status(500).send({
			error: 'There was an error getting the requested data.'
		})
	})
});


export const getUser = functions.https.onRequest((request, response)=>{
	response.send({
		username: request.body,
		password: 'helloWorld'
	})
})
