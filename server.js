const express = require('express');
const request = require('request');
const querystring = require('querystring');
const cors = require('cors');
const app = express();

app.use(express.static(__dirname + '/public'));

app.use(cors());

const clientId = '4e4ec788103946b7bacd013c3036ff85';
const clientSecret = 'e8a341b975204e2da058006e404523db';
const redirectUri = 'http://localhost:8080/callback';
const scopes = 'user-library-read user-top-read';
const state = 'todinho';


// ==== ENDPOINTS
app.get('/login', function(req, res) {
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scopes,
      state: state
    }));
});

app.get('/callback', function(req, res) {
  if(req.query.state == state) {
    let code = req.query.code || null;
    let state = req.query.state || null;

    let authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: req.query.code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        let access_token = body.access_token,
            refresh_token = body.refresh_token;

        let options = {
          url: 'https://api.spotify.com/v1/me/tracks',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });
      } else {
          res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token'
            })
          );
        }
    });
  } else {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  }
});

app.get('/refresh_token', function(req, res) {

  let refresh_token = req.query.refresh_token;
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };
  
  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      let access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.listen(8080, () => console.log('collage-endpoints started on 8080! '));