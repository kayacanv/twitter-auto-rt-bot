const express = require('express');
const app = express();


app.get("/", (req,res)=>{
	var Twit = require('twit');



	let T = new Twit({
	    consumer_key:         'IN69pKsnfsgXRWDyZN9ktM4me',
	    consumer_secret:      'PU8RYfSAdeATpupXrrN6xhJRePPn6p0tm8HPzdp1AhPwWFJsAR',
	    access_token:         '1152585585720287232-CCRThAGwX0MbkLJJ7nb0CNlJdx0aaj',
	    access_token_secret:  'RbcBUgXK23yyo3atEoqQsm494H0jtXD9ZdLD7S0Nol4xU',
	})

	let our_id=""
	let our_username="nocontextnocon2"



	function request(url){
		return T.get(url).then( data => {
			return data;
		});
	}

	async function getMax(id){
		let mxFav = -1;
		let tweetId = "";
		
		let url = "https://api.twitter.com/1.1/statuses/user_timeline.json?user_id=" + id + "&count=200"+"&stringify_ids=true";

		let tweets = await request(url);
		tweets = tweets.data;

		tweets.forEach(async tweet => {

			let str = tweet.created_at;
			let created_date = new Date(
		
			str.replace(/^\w+ (\w+) (\d+) ([\d:]+) \+0000 (\d+)$/,
			"$1 $2 $4 $3 UTC"));

			created_date = created_date.getTime();
			let now = new Date();
			now = now.getTime();
			let hours = 3;
			
			if(now - created_date > hours*60*60*1000) // in the last x hours
				return ;
			
			let fav = 0;
			if(tweet.retweeted_status == undefined)
				fav = tweet.favorite_count;
			else         
				fav = tweet.retweeted_status.favorite_count;  //rts included

			if(fav > mxFav){
				mxFav = fav;
				tweetId = tweet.id_str;
			}
		});
		return [mxFav,tweetId];
	}
	async function asyncForEach(array, callback) {
	  for (let index = 0; index < array.length; index++) {
	    await callback(array[index], index, array);
	  }
	}

	async function autoRT(id , count=200) 
	{
		let url="";
		if(id => /\D/.test(id))
			url = "https://api.twitter.com/1.1/friends/ids.json?cursor=-1&screen_name="+id+"&count="+count+"&stringify_ids=true";
		else
			url = "https://api.twitter.com/1.1/friends/ids.json?cursor=-1&user_id="+id+"&count="+count+"&stringify_ids=true";
		
		let users = await request(url);
		users = users.data.ids;
			
		let globalMaxFav = -1;
		let tweetId = "";
		await asyncForEach(users, async id=>{

			let data = await getMax(id);

			if(data[0] > globalMaxFav){
				globalMaxFav = data[0];
				tweetId = data[1];
			}
			console.log(data[0]);

		});

		console.log(globalMaxFav,tweetId);
		T.post('statuses/retweet/:id', { id: tweetId },  (err, data, response)=>{
			console.log(data)
		});
	}
	autoRT(our_username);
	setInterval( ()=>autoRT(our_username) , 180 * 60 * 1000) // each 180 minutes

	res.send("<h1>hi bro</h1>");
});

app.listen(process.env.PORT || 3000, "0.0.0.0");

