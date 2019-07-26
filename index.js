var Twit = require('twit');

let T = new Twit({
    consumer_key:         '',
    consumer_secret:      '',
    access_token:         '',
    access_token_secret:  '',
})
let our_id=""
let our_username="nocontextnocon2"


function get_followers(id , count=200) 
{
	let url="";
	if(id => /\D/.test(id))
		url = "https://api.twitter.com/1.1/friends/ids.json?cursor=-1&screen_name="+id+"&count="+count+"&stringify_ids=true";
	else
		url = "https://api.twitter.com/1.1/friends/ids.json?cursor=-1&user_id="+id+"&count="+count+"&stringify_ids=true";
	T.get(url).then(function(data){
	//	console.log(data);
		data= data.data;
//		console.log( data);
		users=data.ids;
		let mxfav = -1;
		let tweetId = "";
		for(let i=0; i < users.length; i++)
		{
			console.log("users : " , users[i]);
			let url = "https://api.twitter.com/1.1/statuses/user_timeline.json?user_id=" + users[i] + "&count=200"+"&stringify_ids=true";
//			console.log("FULL URL",url);
			T.get(url).then(function(data)
			{
				console.log(url);
				data = data.data;
				for(let i=0; i<data.length;i++){
					let str = data[i].created_at;
					let created_date = new Date(
					str.replace(/^\w+ (\w+) (\d+) ([\d:]+) \+0000 (\d+)$/,
					"$1 $2 $4 $3 UTC"));
					created_date = created_date.getTime();
					let now = new Date();
					now = now.getTime();
					let hours = 6;
					if(now - created_date > hours*60*60*1000) // in the last x hours
							break;
					let fav = 0;
					if(data[i].retweeted_status == undefined)
						fav = data[i].favorite_count;
//					else         
//						fav = data[i].retweeted_status.favorite_count;  //rts included
//					console.log(fav);
					if(fav > mxfav){
						mxfav = fav;
						tweetId = data[i].id_str;
					}	
				}
			});
	}
	setTimeout( () =>{
		T.post('statuses/retweet/:id', { id: tweetId }, function (err, data, response) {
			console.log(data)
		})
		}
			,2000);
	});
}



setInterval( ()=>get_followers(our_username) , 180 * 60 * 1000) // each 180 minutes

