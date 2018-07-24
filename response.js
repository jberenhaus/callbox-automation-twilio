exports.handler = function (context, event, callback) {
    let twiml = new Twilio.twiml.VoiceResponse();
    let answers = ["twilio", "test", "moist"];
    let selectedVoice = "alice";
    if (!event.SpeechResult) {
        twiml
            .gather({ input: 'speech', speechTimeout: 'auto', hints: answers, action: '/test' })
            .say({ voice: selectedVoice, language: 'en-us' }, 'What is the password?');
    } else if (event.MessageSid ) {
        console.log("MessageSid: " + event.MessageSid);
    } else {
        let found = false;
        let speechResult = event.SpeechResult.toLowerCase();
        console.log("The program heard: '" + speechResult + "' With Confidence: " + event.Confidence);
        for(let i = 0; i < answers.length; i++){
            if(speechResult.indexOf(answers[i]) !== -1){
                found = true;
            }
        }
        console.log("found = " + found);
        if (found) {
            twiml.say({ voice: selectedVoice, language: 'en-us' }, 'Correct Password');
            twiml.play({ digits: '6' });
            twiml.hangup();
            console.log("success");
            sendLog("success!");
        } else {
            twiml.say({ voice: selectedVoice, language: 'en-us' }, 'Wrong Password');
            twiml.hangup();
            console.log("failure");
            sendLog("failure!");
        }
    }
    callback(null, twiml);

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
