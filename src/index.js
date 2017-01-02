var https = require('https');

exports.handler = (event, context) => {

var url = 'https://api.football-data.org/v1/teams/66/fixtures?timeFrame=n14';

  try {

    if (event.session.new) {

      // New Session

      console.log("NEW SESSION");

    }

    switch (event.request.type) {

      case "LaunchRequest":

        // Launch Request

        console.log(`LAUNCH REQUEST`);

        context.succeed(

          generateResponse(

            buildSpeechletResponse("Ask about a Man United match", false),

            {}

          )

        );

        break;

      case "IntentRequest":

        // Intent Request

        console.log(`INTENT REQUEST`);

        switch(event.request.intent.name) {

          case "GetNextGame":

            https.get( url, function(response) {

                var data = '';
                
                response.on('data', function( chunk ) {
                    
                    data += chunk;
                    
                });
            
                response.on('end', function() {
                    

                    var json = JSON.parse(data);

                    var awayTeam = json.fixtures[0].awayTeamName;


                    if (awayTeam == "Manchester United FC") {


                        awayTeam = json.fixtures[0].homeTeamName;

                    }                    

                    if (json.fixtures[0].status == "FINISHED") {
   
                        awayTeam = json.fixtures[1].awayTeamName;                     

                        if (awayTeam == "Manchester United FC") {

                            awayTeam = json.fixtures[1].homeTeamName;

                        }

                    }

                    var text = awayTeam;

                    context.succeed(

                        generateResponse(         

                            buildSpeechletResponse("Manchester United next plays against " + text, true),
                            {}

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
