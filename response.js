exports.handler = function (context, event, callback) {
    let twiml = new Twilio.twiml.VoiceResponse();
    let answers = ["twilio", "test", "moist"];
    let selectedVoice = "alice";

    // If we haven't gotten a call response to process, ask the caller for the password
    if (!event.SpeechResult) {
        twiml
            .gather({ input: 'speech', speechTimeout: 'auto', hints: answers, action: '/test' })
            .say({ voice: selectedVoice, language: 'en-us' }, 'What is the password?');
    // We have a call response to process!
    } else {
        let found = false;
        let speechResult = event.SpeechResult.toLowerCase();
        console.log("The program heard: '" + speechResult + "' With Confidence: " + event.Confidence);

        // Check if the response contained one of the acceptable answers
        for(let i = 0; i < answers.length; i++){
            if(speechResult.indexOf(answers[i]) !== -1){
                found = true;
            }
        }
        console.log("found = " + found);

        // If we found an acceptable answer in the reponse, buzz the person in
        if (found) {
            twiml.say({ voice: selectedVoice, language: 'en-us' }, 'Correct Password');
            twiml.play({ digits: '6' });
            twiml.hangup();

            // They said the correct password, tell the Admin that someone got in
            console.log("success");
            sendLog("success!");

        // If we failed to find an acceptable answer, tell them they got the password wrong and hang up rudely
        } else {
            twiml.say({ voice: selectedVoice, language: 'en-us' }, 'Wrong Password');
            twiml.hangup();

            // They said the wrong password, tell the Admin that someone failed
            console.log("failure");
            sendLog("failure!");
        }
    }
    callback(null, twiml);

    ///////////////////////////////////////////////////////////////
    /// Send a log to the admin's phone number (on the To line) ///
    ///////////////////////////////////////////////////////////////
    function sendLog(message){
        console.log("send log");
        context.getTwilioClient().messages.create({
            to: '+XXX',
            from: '+XXX',
            body: message,
          }).then(msg => {
            callback(null, msg.sid);
          }).catch(err => callback(err));
    }
};
