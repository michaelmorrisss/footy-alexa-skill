var https = require('https');

exports.handler = (event, context) => {

var url = 'https://api.football-data.org/v1/teams/66/fixtures?timeFrame=n14';
// The URL to the JSON file on Football-Data for United's current fixtures

  try {

    if (event.session.new) {
      // New Session
      
      console.log("NEW SESSION");
        
    }

    switch (event.request.type) {

      case "LaunchRequest":
        // Launch Request: What Alexa says after invoking "United Next Match"
        
        console.log(`LAUNCH REQUEST`);
        
        context.succeed(
        
          generateResponse(
        
            buildSpeechletResponse("Ask about a Man United match", false),
            {}
            // Alexa launch, Alexa says "Ask about a Man United match"
            // The session continues
        
          )
        
        );
        
        break;

      case "IntentRequest":
        // Intent Request: The functions that can be asked of Footy
        
        console.log(`INTENT REQUEST`);

        switch(event.request.intent.name) {
          
          case "GetNextGame":
            // When United Next Match is asked for the next Man United Match
            
            https.get( url, function(response) {
                // Opens up the Football-Data URL to access the JSON file
                // for Manchester United fixtures
                
                var data = '';
                
                response.on('data', function( chunk ) {
                    
                    data += chunk;
                    // Adds all URL info into var data
                    
                });
            
            
                response.on('end', function() {
                    
                    var json = JSON.parse(data);
                    // Parses the JSON data into var json
                    
                    var i_firstOrSecond = 0;
                    // If the first match has not been played
                    
                    if (json.fixtures[0].status == "FINISHED") {
                        // Checks whether the first match has already been played
                        // If it has been played, then we use the next match
                        
                        i_firstOrSecond = 1;
                        
                    }
                    
                    var matchDay = new Date(json.fixtures[i_firstOrSecond].date);
                    // Retrieves the date for the upcoming match
                    
                    var opponent = teamNameEditor(json.fixtures[i_firstOrSecond].awayTeamName);
                    // Retrieves what team United plays, if United is at home
                    
                    if (opponent == "manchester united") {
                        // Retrieves what team United plays, if United is away
                        
                        opponent = teamNameEditor(json.fixtures[i_firstOrSecond].homeTeamName);
                        
                    }
            
                    context.succeed(
            
                        generateResponse(
            
                            buildSpeechletResponse("Manchester United next play against " + opponent + " on " + getFormattedDate(matchDay) + " at " + getFormattedTime (matchDay), true),
                            {}
                            // Alexa says against whom United is playing and then
                            // ends the session
                        )
                    );
                });
                
            });
            
            break;
            

          default:
            throw "Invalid intent";
        }

        break;

      case "SessionEndedRequest":
        // Session Ended Request
        
        console.log(`SESSION ENDED REQUEST`);
        
        break;

      default:
        
        context.fail(`INVALID REQUEST TYPE: ${event.request.type}`);

    }

  } catch(error) { context.fail(`Exception: ${error}`) }

};

// Helpers
buildSpeechletResponse = (outputText, shouldEndSession) => {
    //(what Alexa will say, whether the session should end after)

  return {
    
    outputSpeech: {
    
      type: "PlainText",
    
      text: outputText
    
    },
    
    shouldEndSession: shouldEndSession
  
  };

};

generateResponse = (speechletResponse, sessionAttributes) => {

  return {
      
    version: "1.0",
    
    sessionAttributes: sessionAttributes,
    
    response: speechletResponse
    
  };
  
};

function teamNameEditor(teamName) {
    // Removes "FC" and "AFC" from team names so that they can 
    // be verbalized more normally
    
    return teamName.replace(/(fc|afc)/gi, '').trim().toLowerCase();

}

function getFormattedTime (date) {
            var hours = date.getHours();
            var minutes = date.getMinutes();

            var periodOfDay;
            if (hours < 12) {
                periodOfDay = ' in the morning';
            } else if (hours < 17) {
                periodOfDay = ' in the afternoon';
            } else if (hours < 20) {
                periodOfDay = ' in the evening';
            } else {
                periodOfDay = ' at night';
            }

            hours = hours % 12;
            hours = hours ? hours : 12; // handle midnight
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var formattedTime = hours + ':' + minutes + periodOfDay;
            return formattedTime;
}

function getFormattedDate(date) {
            var today = new Date();

            if (today.getFullYear() === date.getFullYear()) {
                return DAYS_OF_WEEK[date.getDay()] + ' ' + MONTHS[date.getMonth()] + ' ' + DAYS_OF_MONTH[date.getDate() - 1];
            } else {
                return DAYS_OF_WEEK[date.getDay()] + ' ' + (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
            }
}

var DAYS_OF_MONTH = [
        '1st',
        '2nd',
        '3rd',
        '4th',
        '5th',
        '6th',
        '7th',
        '8th',
        '9th',
        '10th',
        '11th',
        '12th',
        '13th',
        '14th',
        '15th',
        '16th',
        '17th',
        '18th',
        '19th',
        '20th',
        '21st',
        '22nd',
        '23rd',
        '24th',
        '25th',
        '26th',
        '27th',
        '28th',
        '29th',
        '30th',
        '31st'
    ];

    var DAYS_OF_WEEK = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    var MONTHS = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];