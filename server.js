// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const mustacheExpress = require('mustache-express');
const xhr = require('axios')
const cheerio = require('cheerio')
const scheduleUrl = 'https://www.fifa.com/womensworldcup/matches/'
const teamOwners = {
  'China PR': 'Mark',
  'Germany': 'Marty',
  'Australia': 'Jackie',
  'Netherlands': 'Jess',
  'Brazil': 'Katie',
  'Korea Republic': 'Kevin',
  'Cameroon': 'Chris',
  'Jamaica': 'Oz',
  'Nigeria': 'Meagan',
  'Chile': 'Malinda',
  'Italy': 'Robin',
  'Argentina': 'Ashley',
  'France': 'Malinda',
  'South Africa': 'Robin',
  'New Zealand': 'Ashley',
  'Canada': 'Chris',
  'Thailand': 'Oz',
  'Scotland': 'Jackie',
  'Spain': 'Jess',
  'Norway': 'Katie',
  'USA': 'Kevin',
  'Japan': 'Mark',
  'Sweden': 'Marty',
  'England': 'Meagan'
}

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(req, res) {
  xhr.get(scheduleUrl)
    .then(response => cheerio.load(response.data))
    .then($ => {
      let dates = []
      let date = { date: '', matches: [] }

      $('.fi-mu__link').each((idx, el) => {
        let $match = $(el)
        let dateAbbr = $match.find('.fi__info__datetime--abbr').text().trim()
        let home = $match.find('.home')
        let away = $match.find('.away')

        if (date.date !== (dateAbbr || '') && date.matches.length > 0) {
          dates.push(date)
          date = { date: dateAbbr, matches: [] }
        }

        let match = {
          href: 'https://www.fifa.com' + $match.attr('href'),
          dateTime: $match.find('.fi-mu__info__datetime').data('utcdate'),
          group: $match.find('.fi__info__group').text(),
          home: {
            name: home.find('.fi-t__nText').text(),
            flag: home.find('img').attr('src'),
            href: 'https://www.fifa.com/womensworldcup/teams/team/' + home.data('team-id'),
            owner: '',
          },
          away: {
            name: away.find('.fi-t__nText').text(),
            flag: away.find('img').attr('src'),
            href: 'https://www.fifa.com/womensworldcup/teams/team/' + away.data('team-id'),
            owner: '',
          }
        }

        match.home.owner = teamOwners[match.home.name]
        match.away.owner = teamOwners[match.away.name]

        date.date = dateAbbr
        date.matches.push(match)
      })

      return {dates}
    })
    .then(dates => res.render('index', dates))
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
